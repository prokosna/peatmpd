import {
  UPDATE_META_TAGS,
  SET_MESSAGGE,
  SET_CURRENT_PROFILE,
  SET_PROFILES,
  UPDATE_IS_LOADING,
  UPDATE_CONNECTING_TIMESTAMP,
  RESTORE_WHOLE_STATE,
  UPDATE_IS_FIRST_LANDING
} from './mutation-types'

export default {
  [UPDATE_META_TAGS] (state, { metaTags }) {
    state.metaTags = metaTags
  },

  [SET_MESSAGGE] (state, { type, message, timeout }) {
    state.infoMessage = null
    state.errorMessage = null
    state.warningMessage = null
    state.successMessage = null

    switch (type) {
      case 'info':
        state.infoMessage = message
        break
      case 'success':
        state.successMessage = message
        break
      case 'warning':
        state.warningMessage = message
        break
      case 'error':
        state.errorMessage = message
        break
    }

    state.messageTimeout = timeout
  },

  [SET_CURRENT_PROFILE] (state, profileId) {
    state.currentProfileId = profileId
  },

  [SET_PROFILES] (state, profiles) {
    state.profiles = profiles
  },

  [UPDATE_IS_LOADING] (state, isLoading) {
    state.isLoading = isLoading
  },

  [UPDATE_CONNECTING_TIMESTAMP] (state, timestamp) {
    state.connectingTimestamp = timestamp
  },

  [RESTORE_WHOLE_STATE] (state, newState) {
    Object.assign(state, {
      ...newState.root,
      browser: { ...state.browser, ...newState.browser },
      playingQueue: { ...state.playingQueue, ...newState.playingQueue },
      playlists: { ...state.playlists, ...newState.playlists },
      smartPlaylists: { ...state.smartPlaylists, ...newState.smartPlaylists }
    })
  },

  [UPDATE_IS_FIRST_LANDING] (state, isFirstLanding) {
    state.isFirstLanding = isFirstLanding
  }
}
