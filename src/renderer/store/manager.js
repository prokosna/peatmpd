import { RESTORE_WHOLE_STATE } from './mutation-types'
import { ipcSend, ipcSendSync } from '../util/mpd/ipc'
import { READ_FROM_DB_SYNC, WRITE_TO_DB } from '../../const/mpd/channel-types'

class StoreManager {
  constructor () {
    this.changed = false
    this.latestSerialized
  }

  initialize (store) {
    store.watch(
      state => {
        this.latestSerialized = this.serialize(state)
        return this.latestSerialized
      },
      () => {
        this.changed = true
      }
    )

    setInterval(() => {
      if (this.changed) {
        ipcSend(WRITE_TO_DB, this.latestSerialized)
        this.changed = false
      }
    }, 1000)
  }

  serialize (state) {
    const s = {
      root: {},
      browser: {},
      playingQueue: {},
      playlists: {},
      smartPlaylists: {}
    }

    s.root = {
      profiles: state.profiles,
      currentProfileId: state.currentProfileId,
      isFirstLanding: state.isFirstLanding
    }

    s.browser = {
      sideBarMetaTags: state.browser.sideBarMetaTags,
      tableColumns: state.browser.tableColumns,
      tableSortedBy: state.browser.tableSortedBy,
      tableSortDesc: state.browser.tableSortDesc
    }

    s.playingQueue = {
      tableColumns: state.playingQueue.tableColumns
    }

    s.playlists = {
      tableColumns: state.playlists.tableColumns
    }

    s.smartPlaylists = {
      conditionsList: state.smartPlaylists.conditionsList,
      tableColumns: state.smartPlaylists.tableColumns,
      tableSortedBy: state.smartPlaylists.tableSortedBy,
      tableSortDesc: state.smartPlaylists.tableSortDesc
    }

    return JSON.stringify(s)
  }

  restore (store) {
    const json = ipcSendSync(READ_FROM_DB_SYNC)

    if (!json) {
      return
    }

    const s = JSON.parse(json)

    store.commit(RESTORE_WHOLE_STATE, s)
  }
}

const storeManager = new StoreManager()
export default storeManager
