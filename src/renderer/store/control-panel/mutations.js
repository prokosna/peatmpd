import { UPDATE_PLAYING_SONG, UPDATE_STATUS } from './mutation-types'

export default {
  [UPDATE_PLAYING_SONG] (state, song) {
    state.playingSong = song
  },
  [UPDATE_STATUS] (state, status) {
    if (!status) {
      return
    }

    state.elapsedTime = status.elapsed ? Number(status.elapsed) : 0
    state.totalTime = status.duration ? Number(status.duration) : 0
    state.volume = status.volume ? Number(status.volume) : -1
    state.isRandom = status.random === '1' ? true : false
    state.isRepeat = status.repeat === '1' ? true : false
    state.state = status.state
    state.playingSongPos = status.song
  }
}
