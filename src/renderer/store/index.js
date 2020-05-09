import Vue from 'vue'
import Vuex from 'vuex'

import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import state from './state'

import playlists from './playlists'
import browser from './browser'
import controlPanel from './control-panel'
import playingQueue from './playing-queue'
import smartPlaylists from './smart-playlists'

import storeManager from './manager'

Vue.use(Vuex)

// Create a new store
const store = new Vuex.Store({
  actions,
  getters,
  mutations,
  state,
  modules: {
    playlists,
    browser,
    controlPanel,
    playingQueue,
    smartPlaylists
  }
})

storeManager.restore(store)
storeManager.initialize(store)

export default store
