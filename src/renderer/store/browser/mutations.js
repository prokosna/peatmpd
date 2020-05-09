import {
  UPDATE_META_TAG_ROW,
  SELECT_META_VALUE,
  UPDATE_CURRENT_SONGS,
  IS_LOADING,
  UPDATE_TABLE_COLUMNS,
  UPDATE_TABLE_SORTED_BY,
  UPDATE_TABLE_SORT_DESC
} from './mutation-types'

export default {
  [UPDATE_META_TAG_ROW] (state, { metaTag, values }) {
    if (values) {
      if (!state.sideBarMetaTags.includes(metaTag)) {
        state.sideBarMetaTags.push(metaTag)
      }

      state.sideBarMetaValues = {
        ...state.sideBarMetaValues,
        [metaTag]: values
      }
      return
    }

    // Remove tag
    const i = state.sideBarMetaTags.findIndex(v => v === metaTag)
    if (i >= 0) {
      state.sideBarMetaTags.splice(i, 1)
    }

    const tmp = { ...state.sideBarMetaValues }
    delete tmp[metaTag]
    state.sideBarMetaValues = tmp
  },

  [SELECT_META_VALUE] (state, { metaTag, metaValue }) {
    const i = state.sideBarMetaValuesSelected.findIndex(
      v => v.metaTag === metaTag
    )

    if (!metaValue) {
      if (i >= 0) {
        state.sideBarMetaValuesSelected.splice(i, 1)
      }
      return
    }

    if (i >= 0) {
      const old = state.sideBarMetaValuesSelected.splice(i, 1).shift()
      if (old.metaValue === metaValue) {
        return
      }
    }

    state.sideBarMetaValuesSelected.push({
      metaTag,
      metaValue
    })
  },

  [UPDATE_CURRENT_SONGS] (state, songs) {
    state.currentSongs = songs
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
