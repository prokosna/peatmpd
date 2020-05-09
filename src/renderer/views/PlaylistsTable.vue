<template>
  <div>
    <div>
      <v-toolbar v-if="currentPlaylist !== null">
        <v-toolbar-title>
          <strong>{{ currentPlaylist }}</strong>
          <br />
          <small>{{ `${tracksCount} Tracks, Total Time: ${totalDuration}` }}</small>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <template v-slot:activator="{on}">
            <v-btn icon v-on="on" @click="replaceSongs(true)">
              <v-icon>mdi-play-box</v-icon>
            </v-btn>
          </template>
          <span>Replace Playing Queue and Play</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{on}">
            <v-btn icon v-on="on" @click="addSongs(true)">
              <v-icon>mdi-plus-box-multiple</v-icon>
            </v-btn>
          </template>
          <span>Add to Playing Queue</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{on}">
            <v-btn
              icon
              v-on="on"
              @click.stop="confirmAction('clear', 'Clear Playlist', 'Are you sure to clear this playlist?')"
            >
              <v-icon>mdi-tray-remove</v-icon>
            </v-btn>
          </template>
          <span>Clear This Playlist</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{on}">
            <v-btn
              icon
              v-on="on"
              @click.stop="confirmAction('delete', 'Delete Playlist', 'Are yopu sure to delete this playlist?')"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Delete This Playlist</span>
        </v-tooltip>
      </v-toolbar>
    </div>
    <div>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="currentPlaylistSongs"
        :single-select="false"
        item-key="index"
        show-select
        no-data-text="Please select any playlist from left panel."
        dense
        disable-pagination
        disable-filtering
        disable-sort
        :loading="isLoading"
        hide-default-footer
        @current-items="updateItems"
        ref="sortableTable"
      >
        <template v-slot:item="{ item, isSelected, headers, index }">
          <tr :class="{ selected: isSelected, 'default-cursor': true }" :key="index">
            <td class="text-start">
              <v-simple-checkbox
                class="v-data-table__checkbox"
                :value="isSelected"
                @input="selectItem(item)"
              ></v-simple-checkbox>
            </td>
            <template v-for="header in headers.slice(1)">
              <td
                class="text-left"
                :key="header.value"
                @click.exact="clickRow(item)"
                @click.shift="selectItem(item)"
                @dblclick="doubleClickRow(item)"
                @contextmenu="rightClickRow($event, item)"
              >{{ item[header.value] }}</td>
            </template>
          </tr>
        </template>
      </v-data-table>
    </div>

    <context-menu v-model="contextMenu" :x="contextMenuX" :y="contextMenuY">
      <template v-slot:list>
        <v-list dense class="pa-0 ma-0">
          <v-list-item>
            <v-btn text @click="addSongs(false)">Add to Queue</v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn text @click="replaceSongs(false)">Replace Queue</v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn text @click="removeSongs">Remove</v-btn>
          </v-list-item>
          <v-list-item>
            <v-menu offset-x open-on-hover z-index="10000000">
              <template v-slot:activator="{ on}">
                <v-btn text v-on="on">Add to playlist</v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="playlist in saveAsPlaylistDropdown"
                  :key="playlist"
                  @click="saveAsPlaylist(playlist, false)"
                >
                  <v-list-item-title>{{ playlist }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item>
            <v-btn text @click="editColumnsDialog = true">Edit Columns</v-btn>
          </v-list-item>
        </v-list>
      </template>
    </context-menu>

    <v-dialog v-model="editColumnsDialog" max-width="40%" persistent>
      <edit-columns-panel
        :all-meta-tags="metaTags"
        :selected-meta-tags="selectedMetaTags"
        @update-selected-meta-tags="updateSelectedMetaTags"
      >
        <template v-slot:close-button>
          <v-btn @click="editColumnsDialog = false">Close</v-btn>
        </template>
      </edit-columns-panel>
    </v-dialog>

    <confirmation-dialog
      v-model="confirmationDialog"
      :card-title="confirmationTitle"
      :card-text="confirmationText"
      @is-ok-response="executeAction"
    ></confirmation-dialog>

    <playlist-name-input
      v-model="inputDialog"
      :playlists="playlists.map(v => v.playlist)"
      @playlist-response="createPlaylist"
    ></playlist-name-input>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Sortable from 'sortablejs'
import EditColumnsPanel from '../components/EditColumnsPanel'
import ConfirmationDialog from '../components/ConfirmationDialog'
import PlaylistNameInput from '../components/PlaylistNameInput'
import ContextMenu from '../components/ContextMenu'
import { formatSecond } from '../util/format'

export default {
  name: 'PlaylistsTable',

  components: {
    EditColumnsPanel,
    ConfirmationDialog,
    PlaylistNameInput,
    ContextMenu
  },

  data: () => ({
    songs: [],
    selected: [],
    editColumnsDialog: false,
    selectedMetaTags: [],
    isPressedShiftKey: false,
    selectedSongWithShiftKey: null,
    confirmationDialog: false,
    confirmationTitle: null,
    confirmationText: null,
    confirmationAction: null,
    inputDialog: false,
    inputIsForWhole: false,
    contextMenu: null,
    contextMenuX: null,
    contextMenuY: null
  }),

  computed: {
    ...mapState(['metaTags']),
    ...mapState('playlists', [
      'currentPlaylist',
      'playlistSongs',
      'tableColumns',
      'isLoading',
      'playlists'
    ]),
    headers: function() {
      return this.selectedMetaTags.map(v => ({
        text: v,
        align: 'left',
        sortable: true,
        value: v
      }))
    },
    currentPlaylistSongs: function() {
      return this.currentPlaylist
        ? this.playlistSongs[this.currentPlaylist].map((v, i) => ({
            ...v,
            index: i
          }))
        : []
    },
    saveAsPlaylistDropdown: function() {
      return ['New Playlist'].concat(this.playlists.map(v => v.playlist))
    },
    tracksCount: function() {
      return this.songs.length
    },
    totalDuration: function() {
      return formatSecond(
        this.songs
          .map(v => Number(v.duration))
          .filter(v => !isNaN(v))
          .reduce((acc, c) => acc + c, 0)
      )
    }
  },

  mounted: function() {
    this.selectedMetaTags = this.tableColumns
    document.addEventListener('keydown', this.checkShiftKey, false)
    document.addEventListener('keyup', this.checkShiftKey, false)
  },

  updated: function() {
    // c.f. https://medium.com/vuetify/drag-n-drop-in-vuetify-part-ii-2b07b4b27684
    // c.f. https://github.com/vuetifyjs/vuetify/issues/2234
    const table = this.$refs.sortableTable
    if (table) {
      const elm = table.$el.getElementsByTagName('tbody')[0]
      const _self = this
      Sortable.create(elm, {
        onEnd({ newIndex, oldIndex }) {
          _self.moveSongInPlaylist({
            playlist: _self.currentPlaylist,
            from: oldIndex,
            to: newIndex
          })
        }
      })
    }
  },

  destroyed: function() {
    document.removeEventListener('keydown', this.checkShiftKey, false)
    document.removeEventListener('keyup', this.checkShiftKey, false)
  },

  methods: {
    ...mapActions([
      'playImmediate',
      'addSongsToPlaylist',
      'addSongsToPlayingQueue'
    ]),
    ...mapActions('playingQueue', ['clearPlayingQueue']),
    ...mapActions('playlists', [
      'clearPlaylist',
      'deletePlaylist',
      'moveSongInPlaylist',
      'deleteSongsInPlaylist',
      'updateTableColumns'
    ]),

    //----- Click

    clickRow: function(item) {
      this.selected = []
      this.selected.push(item)

      this.selectedSongWithShiftKey = item
    },

    doubleClickRow: function(item) {
      this.playImmediate(item.file)
    },

    rightClickRow: function(e, item) {
      if (!this.selected.includes(item)) {
        this.selected.push(item)
      }

      this.contextMenuX = e.clientX
      this.contextMenuY = e.clientY
      this.contextMenu = true

      this.selectedSongWithShiftKey = item
    },

    selectItem: function(item) {
      if (this.selected.includes(item)) {
        this.selected = this.selected.filter(v => v !== item)
      } else {
        this.selected.push(item)
      }

      if (!this.isPressedShiftKey) {
        this.selectedSongWithShiftKey = item
        return
      }

      if (!this.selectedSongWithShiftKey) {
        return
      }

      const preIndex = this.songs.findIndex(
        v => v === this.selectedSongWithShiftKey
      )
      const index = this.songs.findIndex(v => v === item)

      if (preIndex < 0 || index < 0 || preIndex === index) {
        this.selectedSongWithShiftKey = null
        return
      }

      const d = preIndex < index ? 1 : -1
      for (let i = preIndex + d; i !== index; i += d) {
        const song = this.songs[i]
        const j = this.selected.findIndex(v => v === song)
        if (j > 0) {
          this.selected.splice(j, 1)
        } else {
          this.selected.push(song)
        }
      }

      this.selectedSongWithShiftKey = item
    },

    checkShiftKey: function(e) {
      if (e.type === 'keyup' && e.key === 'Shift') {
        this.isPressedShiftKey = false
      } else if (e.type === 'keydown' && e.key === 'Shift') {
        this.isPressedShiftKey = true
      }
    },

    //----- Playlists Actions

    addSongs: function(isForWhole) {
      if (isForWhole) {
        this.addSongsToPlayingQueue(this.songs.map(v => v.file))
        return
      }
      this.addSongsToPlayingQueue(this.selected.map(v => v.file))
    },

    replaceSongs: async function(isForWhole) {
      await this.clearPlayingQueue()
      if (isForWhole) {
        await this.addSongsToPlayingQueue(this.songs.map(v => v.file))
      } else {
        await this.addSongsToPlayingQueue(this.selected.map(v => v.file))
      }
      await this.playImmediate()
    },

    removeSongs: async function() {
      this.deleteSongsInPlaylist({
        playlist: this.currentPlaylist,
        indices: this.selected.map(v => v.index)
      })
      this.selected = []
    },

    updateItems: function(items) {
      this.selectedSongWithShiftKey = null
      this.songs = items
    },

    saveAsPlaylist: async function(playlist, isForWhole) {
      if (playlist === 'New Playlist') {
        this.inputIsForWhole = isForWhole
        this.inputDialog = true
        return
      }

      if (isForWhole) {
        await this.addSongsToPlaylist({
          playlist,
          files: this.songs.map(v => v.file)
        })
      } else {
        await this.addSongsToPlaylist({
          playlist,
          files: this.selected.map(v => v.file)
        })
      }
    },

    createPlaylist: async function(playlist) {
      if (!playlist) {
        return
      }

      if (!this.inputIsForWhole) {
        await this.addSongsToPlaylist({
          playlist,
          files: this.selected.map(v => v.file)
        })
        return
      }

      await this.savePlayingQueueAsPlaylist(playlist)
    },

    confirmAction: function(action, title, text) {
      this.confirmationAction = action
      this.confirmationTitle = title
      this.confirmationText = text
      this.confirmationDialog = true
    },

    executeAction: function(isOk) {
      if (!isOk) {
        return
      }

      switch (this.confirmationAction) {
        case 'clear':
          this.clearPlaylist(this.currentPlaylist)
          break
        case 'delete':
          this.deletePlaylist(this.currentPlaylist)
          break
      }
    },

    updateSelectedMetaTags: function(selected) {
      this.selectedMetaTags = selected
      this.updateTableColumns(selected)
    }
  }
}
</script>

<style scoped>
.selected {
  color: var(--v-primary-base);
}
#context-menu >>> .ctx-menu {
  margin: 0px;
  padding: 0px;
}
.default-cursor:hover {
  cursor: default;
}
/* c.f. https://stackoverflow.com/questions/5611358/how-to-disable-text-selection-on-a-table-in-a-tricky-situation */
tr {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>