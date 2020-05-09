import {
  SELECT_PLAYLIST,
  UPDATE_PLAYLISTS,
  UPDATE_PLAYLIST_SONGS,
  IS_LOADING,
  UPDATE_TABLE_COLUMNS
} from './mutation-types'
import {
  FETCH_PLAYLISTS,
  FETCH_PLAYLIST_SONGS,
  CLEAR_PLAYLIST,
  DELETE_PLAYLIST,
  MOVE_SONG_IN_PLAYLIST,
  DELETE_SONGS_IN_PLAYLIST,
  ADD_SONGS_TO_PLAYLIST
} from '../../../const/mpd/channel-types'
import { ipcSend } from '../../util/mpd/ipc'

export default {
  async refresh ({ dispatch, state }) {
    await dispatch('updatePlaylists')

    if (state.currentPlaylist) {
      dispatch('updatePlaylistSongs', state.currentPlaylist)
    }
  },

  async selectPlaylist ({ dispatch, commit }, playlist) {
    commit(IS_LOADING, true)

    if (playlist) {
      await dispatch('updatePlaylistSongs', playlist)
    }

    commit(SELECT_PLAYLIST, playlist)

    commit(IS_LOADING, false)
  },

  async updatePlaylists ({ commit }) {
    commit(IS_LOADING, true)

    const playlists = await ipcSend(FETCH_PLAYLISTS)

    commit(UPDATE_PLAYLISTS, playlists)

    commit(IS_LOADING, false)
  },

  async updatePlaylistSongs ({ commit }, playlist) {
    commit(IS_LOADING, true)

    const songs = await ipcSend(FETCH_PLAYLIST_SONGS, playlist)

    commit(UPDATE_PLAYLIST_SONGS, { playlist, songs })

    commit(IS_LOADING, false)
  },

  async clearPlaylist ({ dispatch, commit }, playlist) {
    commit(IS_LOADING, true)

    await ipcSend(CLEAR_PLAYLIST, playlist)

    commit(IS_LOADING, false)
  },

  async deletePlaylist ({ dispatch, commit, state }, playlist) {
    commit(IS_LOADING, true)

    await ipcSend(DELETE_PLAYLIST, playlist)

    if (state.currentPlaylist === playlist) {
      await dispatch('selectPlaylist', null)
    }

    commit(UPDATE_PLAYLIST_SONGS, { playlist, songs: [] })

    commit(IS_LOADING, false)
  },

  async moveSongInPlaylist ({ dispatch, commit }, { playlist, from, to }) {
    commit(IS_LOADING, true)

    await ipcSend(MOVE_SONG_IN_PLAYLIST, playlist, from, to)

    commit(IS_LOADING, false)
  },

  async deleteSongsInPlaylist ({ dispatch, commit }, { playlist, indices }) {
    commit(IS_LOADING, true)

    await ipcSend(DELETE_SONGS_IN_PLAYLIST, playlist, indices)

    commit(IS_LOADING, false)
  },

  async addSongsToPlaylist ({ dispatch, commit }, { playlist, files }) {
    commit(IS_LOADING, true)

    await ipcSend(ADD_SONGS_TO_PLAYLIST, playlist, files)

    commit(IS_LOADING, false)
  },

  async updateTableColumns ({ commit }, columns) {
    commit(UPDATE_TABLE_COLUMNS, columns)
  }
}
