import {
  CONNECT,
  FETCH_META_TAGS,
  PLAY,
  ADD_SONGS_TO_PLAYING_QUEUE,
  ADD_SONGS_TO_PLAYLIST
} from '../../const/mpd/channel-types'
import { ipcSend, ipcReceive } from '../util/mpd/ipc'
import {
  UPDATE_META_TAGS,
  SET_MESSAGGE,
  SET_CURRENT_PROFILE,
  SET_PROFILES,
  UPDATE_IS_LOADING,
  UPDATE_CONNECTING_TIMESTAMP
} from './mutation-types'
import {
  DATABASE,
  STORED_PLAYLIST,
  PLAYLIST,
  PLAYER,
  MIXER,
  OPTIONS,
  END,
  ERROR,
  READY
} from '../../const/mpd/events'

export default {
  initialize ({ dispatch, commit }) {
    commit(UPDATE_IS_LOADING, true)

    ipcReceive(READY, async () => {
      commit(UPDATE_IS_LOADING, true)

      // Update current meta tags
      // Update PlayingQueue
      // Update ControlPanel
      // Update Playlists
      await Promise.all(
        [
          'updateMetaTags',
          'playingQueue/refresh',
          'controlPanel/refresh',
          'playlists/refresh',
          'browser/refresh'
        ].map(dispatch)
      )

      commit(UPDATE_IS_LOADING, false)

      dispatch('setMessage', {
        type: 'info',
        message: 'Succeeded to connect to MPD and ready now.'
      })

      ipcReceive(END, async () => {
        await dispatch('setMessage', {
          type: 'warning',
          message: `Connection was closed. Will connect again soon...`
        })

        dispatch('connectToMpd')
      })
    })

    ipcReceive(PLAYER, async () => {
      // Update ControlPanel
      dispatch('controlPanel/refresh')
    })

    ipcReceive(DATABASE, async () => {
      dispatch('setMessage', {
        type: 'info',
        message: 'Database was updated.'
      })
    })

    ipcReceive(STORED_PLAYLIST, async () => {
      // Update Playlists
      dispatch('playlists/refresh')
    })

    ipcReceive(PLAYLIST, async () => {
      // Update Playing Queue
      // Update ControlPanel
      await Promise.all(
        ['playingQueue/refresh', 'controlPanel/refresh'].map(dispatch)
      )
    })

    ipcReceive(MIXER, async () => {
      // Update ControlPanel
      dispatch('controlPanel/refresh')
    })

    ipcReceive(OPTIONS, async () => {
      // Update ControlPanel
      dispatch('controlPanel/refresh')
    })

    ipcReceive(ERROR, async err => {
      dispatch('setMessage', {
        type: 'error',
        message: `Something went wrong...: ${err}`
      })
    })

    // TODO: Read saved data
    // this is done in the main process
    // should use ipc send sync

    commit(UPDATE_IS_LOADING, false)
  },

  // Connect to MPD server
  connectToMpd ({ dispatch, getters, commit, state }) {
    const timestamp = Date.now()
    commit(UPDATE_IS_LOADING, true)
    commit(UPDATE_CONNECTING_TIMESTAMP, timestamp)

    const connectWithRetry = async () => {
      const profile = getters.currentProfile

      const ret = await ipcSend(CONNECT, profile).catch(err => err)

      if (ret instanceof Error) {
        dispatch('setMessage', {
          type: 'error',
          message: `Failed to connect to MPD server. Will retry after 3 seconds...: ${ret.message}`
        })

        await new Promise(r => setTimeout(r, 3000))

        if (state.connectingTimestamp !== timestamp) {
          return
        }

        return await connectWithRetry(profile)
      }
    }

    connectWithRetry()
  },

  // Fetch meta tags from MPD server and update them
  async updateMetaTags ({ commit, state }) {
    const metaTags = await ipcSend(FETCH_META_TAGS)
    commit(UPDATE_META_TAGS, { metaTags })
  },

  async setMessage ({ commit, state }, { type, message }) {
    if (state.messageTimeout) {
      clearTimeout(state.messageTimeout)
      commit(SET_MESSAGGE, { timeout: null })
    }

    const timeout = setTimeout(() => {
      commit(SET_MESSAGGE, { type, message: null, timeout: null })
    }, 3000)

    commit(SET_MESSAGGE, { type, message, timeout })
  },

  updateCurrentProfile ({ commit }, profileId) {
    commit(SET_CURRENT_PROFILE, profileId)
  },

  updateProfiles ({ commit }, profiles) {
    commit(SET_PROFILES, profiles)
  },

  // If the song (file) is in the playing queue, play it
  // Otherwise add the song to the last of the playing queue and play it
  // If the song is null, play first song in the playing queue
  async playImmediate ({ state }, file) {
    const songsInQueue = state.playingQueue.currentSongs

    if (!file) {
      if (songsInQueue.length > 0) {
        const first = songsInQueue[0]
        await ipcSend(PLAY, first.Pos)
        return
      }
      return
    }

    const found = songsInQueue.find(v => v.file === file)
    if (found) {
      await ipcSend(PLAY, found.Pos)
      return
    }

    const lastPos = songsInQueue[songsInQueue.length - 1].Pos
    await ipcSend(ADD_SONGS_TO_PLAYING_QUEUE, [file])
    await ipcSend(PLAY, Number(lastPos) + 1)
  },

  async addSongsToPlaylist ({ _ }, { playlist, files }) {
    await ipcSend(ADD_SONGS_TO_PLAYLIST, playlist, files)
  },

  async addSongsToPlayingQueue ({ _ }, files) {
    await ipcSend(ADD_SONGS_TO_PLAYING_QUEUE, files)
  }
}
