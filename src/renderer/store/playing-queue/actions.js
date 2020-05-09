import {
  UPDATE_PLAYING_QUEUE,
  IS_LOADING,
  UPDATE_TABLE_COLUMNS
} from './mutation-types'
import {
  FETCH_PLAYING_QUEUE_SONGS,
  CLEAR_PLAYING_QUEUE,
  MOVE_SONG_IN_PLAYING_QUEUE,
  DELETE_SONGS_IN_PLAYING_QUEUE,
  ADD_SONGS_TO_PLAYING_QUEUE,
  SAVE_PLAYLING_QUEUE_AS_PLAYLIST
} from '../../../const/mpd/channel-types'
import { ipcSend } from '../../util/mpd/ipc'

export default {
  // Refresh playing queue
  async refresh ({ dispatch }) {
    dispatch('updatePlayingQueue')
  },

  async updatePlayingQueue ({ commit }) {
    commit(IS_LOADING, true)

    const songs = await ipcSend(FETCH_PLAYING_QUEUE_SONGS)

    commit(UPDATE_PLAYING_QUEUE, songs)

    commit(IS_LOADING, false)
  },

  async clearPlayingQueue ({ commit }) {
    commit(IS_LOADING, true)

    await ipcSend(CLEAR_PLAYING_QUEUE)

    commit(IS_LOADING, false)
  },

  async moveSongInPlayingQueue ({ dispatch, commit }, { from, to }) {
    commit(IS_LOADING, true)

    await ipcSend(MOVE_SONG_IN_PLAYING_QUEUE, from, to)

    commit(IS_LOADING, false)
  },

  async deleteSongsInPlayingQueue ({ dispatch, commit }, indices) {
    commit(IS_LOADING, true)

    await ipcSend(DELETE_SONGS_IN_PLAYING_QUEUE, indices)

    commit(IS_LOADING, false)
  },

  async savePlayingQueueAsPlaylist ({ commit }, playlist) {
    commit(IS_LOADING, true)

    await ipcSend(SAVE_PLAYLING_QUEUE_AS_PLAYLIST, playlist)

    commit(IS_LOADING, false)
  },

  async updateTableColumns ({ commit }, columns) {
    commit(UPDATE_TABLE_COLUMNS, columns)
  }
}
