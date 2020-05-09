import { UPDATE_PLAYING_SONG, UPDATE_STATUS } from './mutation-types'
import {
  FETCH_PLAYING_SONG_STATUS,
  PREVIOUS,
  STOP,
  PAUSE,
  PLAY,
  NEXT,
  SET_VOLUME,
  SET_REPEAT,
  SET_RANDOM,
  SEEK
} from '../../../const/mpd/channel-types'
import { ipcSend } from '../../util/mpd/ipc'

export default {
  // Refresh control panel with latest status
  async refresh ({ dispatch }) {
    await dispatch('updatePlayingSongStatus')
  },

  // Update currently playing song and other options status
  async updatePlayingSongStatus ({ commit }) {
    const ret = await ipcSend(FETCH_PLAYING_SONG_STATUS)

    const status = ret.status
    const song = ret.song

    commit(UPDATE_PLAYING_SONG, song)
    commit(UPDATE_STATUS, status)
  },

  // Go to previous song
  async goPreviousSong ({ dispatch }) {
    await ipcSend(PREVIOUS)
  },

  // Stop currently playing song
  async stopSong ({ dispatch }) {
    await ipcSend(STOP)
  },

  // Pause / Resume / Play the song according to current state
  async pauseSong ({ dispatch, state }) {
    switch (state.state) {
      case 'play':
        await ipcSend(PAUSE, true)
        break
      case 'pause':
        await ipcSend(PAUSE, false)
        break
      case 'stop':
        if (state.playingSong && state.playingSong.Pos) {
          await ipcSend(PLAY, state.playingSong.Pos)
        }
        break
    }
  },

  // Go to next song
  async goNextSong ({ dispatch }) {
    await ipcSend(NEXT)
  },

  // Set volume
  async setVolume ({ dispatch }, volume) {
    await ipcSend(SET_VOLUME, volume)
  },

  // Switch repeat on/off
  async switchRepeat ({ dispatch, state }) {
    await ipcSend(SET_REPEAT, !state.isRepeat)
  },

  // Switch random on/off
  async switchRandom ({ dispatch, state }) {
    await ipcSend(SET_RANDOM, !state.isRandom)
  },

  // Seek current song
  async seek ({ dispatch }, time) {
    await ipcSend(SEEK, time)
  }
}
