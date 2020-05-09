import {
  UPDATE_PLAYING_QUEUE,
  IS_LOADING,
  UPDATE_TABLE_COLUMNS
} from './mutation-types'

export default {
  [UPDATE_PLAYING_QUEUE] (state, songs) {
    state.currentSongs = songs
  },

  [IS_LOADING] (state, isLoading) {
    state.isLoading = isLoading
  },

  [UPDATE_TABLE_COLUMNS] (state, columns) {
    state.tableColumns = columns
  }
}
