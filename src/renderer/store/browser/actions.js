// import { ipcRenderer } from 'electron'
import {
  UPDATE_META_TAG_ROW,
  SELECT_META_VALUE,
  UPDATE_CURRENT_SONGS,
  IS_LOADING,
  UPDATE_TABLE_COLUMNS,
  UPDATE_TABLE_SORTED_BY,
  UPDATE_TABLE_SORT_DESC
} from './mutation-types'
import {
  FETCH_META_UNIQUE_VALUES,
  FETCH_SONGS
} from '../../../const/mpd/channel-types'
import { EQUAL } from '../../../const/mpd/operators'
import { ipcSend } from '../../util/mpd/ipc'

export default {
  // Refresh browser with latest conditions
  async refresh ({ dispatch }) {
    await dispatch('updateMetaTagRows')
    await dispatch('updateCurrentSongs')
  },

  // Update songs with current conditions
  async updateCurrentSongs ({ commit, state }) {
    commit(IS_LOADING, true)

    const conditions = state.sideBarMetaValuesSelected.map(v => ({
      ...v,
      op: EQUAL
    }))

    if (conditions.length > 0) {
      const songs = await ipcSend(FETCH_SONGS, conditions)
      commit(UPDATE_CURRENT_SONGS, songs)
    } else {
      commit(UPDATE_CURRENT_SONGS, [])
    }

    commit(IS_LOADING, false)
  },

  // Update meta tag rows reflecting current selected tags
  async updateMetaTagRows ({ commit, state }) {
    const conditions = []
    for (const { metaTag, metaValue } of state.sideBarMetaValuesSelected) {
      const values = await ipcSend(
        FETCH_META_UNIQUE_VALUES,
        metaTag,
        conditions
      )

      commit(UPDATE_META_TAG_ROW, { metaTag, values })

      if (!values.includes(metaValue)) {
        commit(SELECT_META_VALUE, metaTag, null)
      } else {
        conditions.push({
          metaTag,
          metaValue,
          op: EQUAL
        })
      }
    }

    for (const metaTag of state.sideBarMetaTags) {
      if (
        !state.sideBarMetaValuesSelected.map(v => v.metaTag).includes(metaTag)
      ) {
        const values = await ipcSend(
          FETCH_META_UNIQUE_VALUES,
          metaTag,
          conditions
        )
        commit(UPDATE_META_TAG_ROW, { metaTag, values })
      }
    }
  },

  // Add selected metadata row to sidebar
  async addMetaTagRow ({ commit, state }, metaTag) {
    const conditions = state.sideBarMetaValuesSelected.map(v => ({
      ...v,
      op: EQUAL
    }))

    const values = await ipcSend(FETCH_META_UNIQUE_VALUES, metaTag, conditions)

    commit(UPDATE_META_TAG_ROW, { metaTag, values })
  },

  // Remove a row from sidebar
  async removeMetaTagRow ({ dispatch, commit, state }, metaTag) {
    commit(IS_LOADING, true)

    commit(UPDATE_META_TAG_ROW, { metaTag, values: null })

    if (state.sideBarMetaValuesSelected.map(v => v.metaTag).includes(metaTag)) {
      commit(SELECT_META_VALUE, { metaTag, metaValue: null })
      await dispatch('updateMetaTagRows')
      await dispatch('updateCurrentSongs')
    }

    commit(IS_LOADING, false)
  },

  // Select a value in sidebar metadata row
  async selectMetaValue ({ dispatch, commit }, { metaTag, metaValue }) {
    commit(IS_LOADING, true)

    commit(SELECT_META_VALUE, { metaTag, metaValue })

    await dispatch('updateMetaTagRows')
    await dispatch('updateCurrentSongs')

    commit(IS_LOADING, false)
  },

  async updateTableColumns ({ commit }, columns) {
    commit(UPDATE_TABLE_COLUMNS, columns)
  },

  async updateTableSortedBy ({ commit }, sortedBy) {
    commit(UPDATE_TABLE_SORTED_BY, sortedBy)
  },

  async updateTableSortDesc ({ commit }, desc) {
    commit(UPDATE_TABLE_SORT_DESC, desc)
  }
}
