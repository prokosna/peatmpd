import {
  UPDATE_CURRENT_SONGS,
  UPDATE_CURRENT_CONDITIONS,
  UPDATE_CONDITIONS_LIST,
  IS_LOADING,
  UPDATE_TABLE_COLUMNS,
  UPDATE_TABLE_SORTED_BY,
  UPDATE_TABLE_SORT_DESC
} from './mutation-types'
import { FETCH_SONGS } from '../../../const/mpd/channel-types'
import { ipcSend } from '../../util/mpd/ipc'
import {
  EQUAL,
  NOT_EQUAL,
  CONTAIN,
  NOT_CONTAIN,
  REGEX
} from '../../../const/mpd/operators'

export default {
  async updateCurrentSongs ({ commit, state }) {
    const c = state.conditionsList.find(v => v.name === state.currentConditions)

    if (!c) {
      commit(UPDATE_CURRENT_SONGS, [])
      return
    }

    const conditions = c.conditions

    if (!conditions || conditions.length <= 0) {
      commit(UPDATE_CURRENT_SONGS, [])
      return
    }

    commit(IS_LOADING, true)

    // EQUAL can be used in search of mpd
    const equalConditions = conditions.filter(v => v.op === EQUAL)
    const otherConditions = conditions.filter(v => v.op !== EQUAL)
    const songs = await ipcSend(FETCH_SONGS, equalConditions)

    // Apply other conditions
    const filtered = songs.filter(song =>
      otherConditions.every(v => {
        if (!song[v.metaTag]) {
          return false
        }

        const target = String(song[v.metaTag]).toLocaleLowerCase()

        switch (v.op) {
          case NOT_EQUAL:
            return target === v.metaValue.toLowerCase()
          case CONTAIN:
            return target.indexOf(v.metaValue.toLowerCase()) >= 0
          case NOT_CONTAIN:
            return target.indexOf(v.metaValue.toLowerCase()) < 0
          case REGEX: {
            const regex = new RegExp(v.metaValue, 'iu')
            return regex.test(target)
          }
        }

        return false
      })
    )

    commit(UPDATE_CURRENT_SONGS, filtered)

    commit(IS_LOADING, false)
  },

  async addNewConditions ({ dispatch, commit, state }, name) {
    commit(IS_LOADING, true)

    const tmp = [...state.conditionsList, { name, conditions: [] }]
    commit(UPDATE_CONDITIONS_LIST, tmp)

    dispatch('selectConditions', name)

    commit(IS_LOADING, false)
  },

  async updateConditions ({ commit, state }, { name, conditions }) {
    commit(IS_LOADING, true)

    const tmp = [...state.conditionsList]
    const i = tmp.findIndex(v => v.name === name)
    if (i >= 0) {
      tmp.splice(i, 1, { name, conditions })
    }
    commit(UPDATE_CONDITIONS_LIST, tmp)

    commit(IS_LOADING, false)
  },

  async removeConditions ({ dispatch, commit, state }, name) {
    commit(IS_LOADING, true)

    const i = state.conditionsList.findIndex(v => v.name === name)
    const tmp = [...state.conditionsList]
    tmp.splice(i, 1)
    commit(UPDATE_CONDITIONS_LIST, tmp)

    dispatch('selectConditions', null)

    commit(IS_LOADING, false)
  },

  async selectConditions ({ dispatch, commit }, name) {
    commit(IS_LOADING, true)

    commit(UPDATE_CURRENT_CONDITIONS, name)

    dispatch('updateCurrentSongs')

    commit(IS_LOADING, false)
  },

  async updateTableColumns ({ commit }, columns) {
    commit(IS_LOADING, true)

    commit(UPDATE_TABLE_COLUMNS, columns)

    commit(IS_LOADING, false)
  },

  async updateTableSortedBy ({ commit }, sortedBy) {
    commit(IS_LOADING, true)

    commit(UPDATE_TABLE_SORTED_BY, sortedBy)

    commit(IS_LOADING, false)
  },

  async updateTableSortDesc ({ commit }, desc) {
    commit(IS_LOADING, true)

    commit(UPDATE_TABLE_SORT_DESC, desc)

    commit(IS_LOADING, false)
  }
}
