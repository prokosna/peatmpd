import {
  UPDATE_CURRENT_SONGS,
  UPDATE_CURRENT_CONDITIONS,
  UPDATE_CONDITIONS_LIST,
  IS_LOADING,
  UPDATE_TABLE_COLUMNS,
  UPDATE_TABLE_SORTED_BY,
  UPDATE_TABLE_SORT_DESC
} from './mutation-types'

export default {
  [UPDATE_CURRENT_SONGS] (state, songs) {
    state.currentSongs = songs
  },

  [UPDATE_CURRENT_CONDITIONS] (state, conditions) {
    state.currentConditions = conditions
  },

  [UPDATE_CONDITIONS_LIST] (state, conditionsList) {
    state.conditionsList = conditionsList
  },

  [IS_LOADING] (state, isLoading) {
    state.isLoading = isLoading
  },

  [UPDATE_TABLE_COLUMNS] (state, columns) {
    state.tableColumns = columns
  },

  [UPDATE_TABLE_SORTED_BY] (state, sortedBy) {
    state.tableSortedBy = sortedBy
  },

  [UPDATE_TABLE_SORT_DESC] (state, desc) {
    state.tableSortDesc = desc
  }
}
