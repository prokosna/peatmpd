import { ipcMain } from 'electron'
import client from './client'
import {
  reply,
  CONNECT,
  FETCH_META_UNIQUE_VALUES,
  FETCH_SONGS,
  FETCH_META_TAGS,
  FETCH_PLAYLISTS,
  FETCH_PLAYLIST_SONGS,
  CLEAR_PLAYLIST,
  DELETE_PLAYLIST,
  MOVE_SONG_IN_PLAYLIST,
  DELETE_SONGS_IN_PLAYLIST,
  ADD_SONGS_TO_PLAYLIST,
  FETCH_PLAYING_QUEUE_SONGS,
  FETCH_PLAYING_SONG_STATUS,
  CLEAR_PLAYING_QUEUE,
  MOVE_SONG_IN_PLAYING_QUEUE,
  DELETE_SONGS_IN_PLAYING_QUEUE,
  ADD_SONGS_TO_PLAYING_QUEUE,
  SAVE_PLAYLING_QUEUE_AS_PLAYLIST,
  SET_RANDOM,
  SET_REPEAT,
  SET_VOLUME,
  NEXT,
  PAUSE,
  PLAY,
  PREVIOUS,
  SEEK,
  STOP
} from '../../const/mpd/channel-types'
import { END, ERROR, READY } from '../../const/mpd/events'
import {
  sortCaseInsensitive,
  parseResultToJson,
  makeFilterFrom,
  wrap
} from './utils'

export function initialize () {
  ipcMain.on(CONNECT, async (event, profile) => {
    const callbacks = {
      onSystem: function (systemName) {
        event.sender.send(systemName)
      },
      onError: function (err) {
        event.sender.send(ERROR, err.message)
      },
      onEnd: function () {
        event.sender.send(END)
      }
    }

    const ret = await client
      .connect(profile.host, profile.port, callbacks)
      .catch(err => err)
    event.sender.send(reply(CONNECT), wrap(ret))

    if (!(ret instanceof Error)) {
      event.sender.send(READY)
    }
  })

  /**
   * conditions is object of { metaTag, metaValue, op }
   */
  ipcMain.on(FETCH_META_UNIQUE_VALUES, async (event, metaTag, conditions) => {
    const filter = makeFilterFrom(conditions, false)

    const ret = await client
      .executeCommand('list', metaTag, ...filter)
      .then(msg => {
        const parsed = parseResultToJson(msg, metaTag).map(v => v[metaTag])
        return sortCaseInsensitive(parsed)
      })
      .catch(err => err)
    event.sender.send(reply(FETCH_META_UNIQUE_VALUES), wrap(ret))
  })

  /**
   * conditions is object of { metaTag, metaValue, op }
   */
  ipcMain.on(FETCH_SONGS, async (event, conditions) => {
    const filter = makeFilterFrom(conditions, true)

    const ret = await client
      .executeCommand('search', ...filter)
      .then(msg => {
        return parseResultToJson(msg, 'file')
      })
      .catch(err => err)
    event.sender.send(reply(FETCH_SONGS), wrap(ret))
  })

  ipcMain.on(FETCH_META_TAGS, async event => {
    const ret = await client
      .executeCommand('tagtypes')
      .then(msg => {
        const parsed = parseResultToJson(msg, 'tagtype')
        return parsed.map(a => a['tagtype'])
      })
      .catch(err => err)
    event.sender.send(reply(FETCH_META_TAGS), wrap(ret))
  })

  ipcMain.on(FETCH_PLAYLISTS, async event => {
    const ret = await client
      .executeCommand('listplaylists')
      .then(msg => {
        return parseResultToJson(msg, 'playlist')
      })
      .catch(err => err)
    event.sender.send(reply(FETCH_PLAYLISTS), wrap(ret))
  })

  ipcMain.on(FETCH_PLAYLIST_SONGS, async (event, playlist) => {
    const ret = await client
      .executeCommand('listplaylistinfo', playlist)
      .then(msg => {
        return parseResultToJson(msg, 'file')
      })
      .catch(err => err)
    event.sender.send(reply(FETCH_PLAYLIST_SONGS), wrap(ret))
  })

  ipcMain.on(CLEAR_PLAYLIST, async (event, playlist) => {
    const ret = await client
      .executeCommand('playlistclear', playlist)
      .catch(err => err)
    event.sender.send(reply(CLEAR_PLAYLIST), wrap(ret))
  })

  ipcMain.on(DELETE_PLAYLIST, async (event, playlist) => {
    const ret = await client.executeCommand('rm', playlist).catch(err => err)
    event.sender.send(reply(DELETE_PLAYLIST), wrap(ret))
  })

  ipcMain.on(MOVE_SONG_IN_PLAYLIST, async (event, playlist, from, to) => {
    const ret = await client
      .executeCommand('playlistmove', playlist, from, to)
      .catch(err => err)
    event.sender.send(reply(MOVE_SONG_IN_PLAYLIST), wrap(ret))
  })

  ipcMain.on(DELETE_SONGS_IN_PLAYLIST, async (event, playlist, indices) => {
    const ret = indices
      .sort()
      .reverse()
      .map(
        async index =>
          await client
            .executeCommand('playlistdelete', playlist, index)
            .catch(err => err)
      )
      .filter(v => v instanceof Error)
      .shift()

    event.sender.send(reply(DELETE_SONGS_IN_PLAYLIST), wrap(ret))
  })

  ipcMain.on(ADD_SONGS_TO_PLAYLIST, async (event, playlist, files) => {
    const ret = files
      .map(
        async file =>
          await client
            .executeCommand('playlistadd', playlist, file)
            .catch(err => err)
      )
      .filter(v => v instanceof Error)
      .shift()

    event.sender.send(reply(ADD_SONGS_TO_PLAYLIST), wrap(ret))
  })

  ipcMain.on(FETCH_PLAYING_QUEUE_SONGS, async event => {
    const ret = await client
      .executeCommand('playlistinfo')
      .then(msg => {
        return parseResultToJson(msg, 'file')
      })
      .catch(err => err)
    event.sender.send(reply(FETCH_PLAYING_QUEUE_SONGS), wrap(ret))
  })

  ipcMain.on(FETCH_PLAYING_SONG_STATUS, async event => {
    const ret = {}

    const status = await client
      .executeCommand('status')
      .then(msg => {
        return parseResultToJson(msg, null)
      })
      .catch(err => err)

    if (status instanceof Error) {
      event.sender.send(reply(FETCH_PLAYING_SONG_STATUS), wrap(status))
      return
    }

    ret.status = status

    if (status.song) {
      const song = await client
        .executeCommand('playlistinfo', status.song)
        .then(msg => {
          return parseResultToJson(msg, null)
        })
        .catch(err => err)

      if (song instanceof Error) {
        event.sender.send(reply(FETCH_PLAYING_SONG_STATUS), wrap(song))
        return
      }

      ret.song = song
    }

    event.sender.send(reply(FETCH_PLAYING_SONG_STATUS), wrap(ret))
  })

  ipcMain.on(CLEAR_PLAYING_QUEUE, async event => {
    const ret = await client.executeCommand('clear').catch(err => err)
    event.sender.send(reply(CLEAR_PLAYING_QUEUE), wrap(ret))
  })

  ipcMain.on(MOVE_SONG_IN_PLAYING_QUEUE, async (event, from, to) => {
    const ret = await client.executeCommand('move', from, to).catch(err => err)
    event.sender.send(reply(MOVE_SONG_IN_PLAYING_QUEUE), wrap(ret))
  })

  ipcMain.on(DELETE_SONGS_IN_PLAYING_QUEUE, async (event, indices) => {
    const ret = indices
      .sort()
      .reverse()
      .map(
        async index =>
          await client.executeCommand('delete', index).catch(err => err)
      )
      .filter(v => v instanceof Error)
      .shift()
    event.sender.send(reply(DELETE_SONGS_IN_PLAYING_QUEUE), wrap(ret))
  })

  ipcMain.on(ADD_SONGS_TO_PLAYING_QUEUE, async (event, files) => {
    const ret = files
      .map(
        async file => await client.executeCommand('add', file).catch(err => err)
      )
      .filter(v => v instanceof Error)
      .shift()

    event.sender.send(reply(ADD_SONGS_TO_PLAYING_QUEUE), wrap(ret))
  })

  ipcMain.on(SAVE_PLAYLING_QUEUE_AS_PLAYLIST, async (event, name) => {
    const ret = await client.executeCommand('save', name).catch(err => err)
    event.sender.send(reply(SAVE_PLAYLING_QUEUE_AS_PLAYLIST), wrap(ret))
  })

  ipcMain.on(SET_RANDOM, async (event, isRandom) => {
    const ret = await client
      .executeCommand('random', isRandom ? 1 : 0)
      .catch(err => err)
    event.sender.send(reply(SET_RANDOM), wrap(ret))
  })

  ipcMain.on(SET_REPEAT, async (event, isRepeat) => {
    const ret = await client
      .executeCommand('repeat', isRepeat ? 1 : 0)
      .catch(err => err)
    event.sender.send(reply(SET_REPEAT), wrap(ret))
  })

  ipcMain.on(SET_VOLUME, async (event, volume) => {
    const ret = await client.executeCommand('random', volume).catch(err => err)
    event.sender.send(reply(SET_VOLUME), wrap(ret))
  })

  ipcMain.on(NEXT, async event => {
    const ret = await client.executeCommand('next').catch(err => err)
    event.sender.send(reply(NEXT), wrap(ret))
  })

  ipcMain.on(PAUSE, async (event, isPause) => {
    const ret = await client
      .executeCommand('pause', isPause ? 1 : 0)
      .catch(err => err)
    event.sender.send(reply(PAUSE), wrap(ret))
  })

  ipcMain.on(PLAY, async (event, index) => {
    const ret = await client.executeCommand('play', index).catch(err => err)
    event.sender.send(reply(PLAY), wrap(ret))
  })

  ipcMain.on(PREVIOUS, async event => {
    const ret = await client.executeCommand('previous').catch(err => err)
    event.sender.send(reply(PREVIOUS), wrap(ret))
  })

  ipcMain.on(SEEK, async (event, time) => {
    const ret = await client.executeCommand('seekcur', time).catch(err => err)
    event.sender.send(reply(SEEK), wrap(ret))
  })

  ipcMain.on(STOP, async event => {
    const ret = await client.executeCommand('stop').catch(err => err)
    event.sender.send(reply(STOP), wrap(ret))
  })
}
