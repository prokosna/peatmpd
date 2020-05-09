import {
  SELECT_PLAYLIST,
  UPDATE_PLAYLISTS,
  UPDATE_PLAYLIST_SONGS,
  IS_LOADING,
  UPDATE_TABLE_COLUMNS
} from './mutation-types'

export default {
  [SELECT_PLAYLIST] (state, playlist) {
    state.currentPlaylist = playlist
  },

  [UPDATE_PLAYLISTS] (state, playlists) {
    state.playlists = playlists
  },

  [UPDATE_PLAYLIST_SONGS] (state, { playlist, songs }) {
    state.playlistSongs = {
      ...state.playlistSongs,
      [playlist]: songs
    }
  },

  [IS_LOADING] (state, isLoading) {
    state.isLoading = isLoading
  },

  [UPDATE_TABLE_COLUMNS] (state, columns) {
    state.tableColumns = columns
  }
}
