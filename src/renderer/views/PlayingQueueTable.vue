<template>
  <div class="pane flex-grow-1">
    <div>
      <v-toolbar>
        <v-toolbar-title>
          <strong>Playing Queue</strong>
          <br />
          <small>{{ `${tracksCount} Tracks, Total Time: ${totalDuration}` }}</small>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-menu offset-y>
          <template v-slot:activator="{ on: onMenu}">
            <v-tooltip bottom>
              <template v-slot:activator="{on: onTooltip}">
                <v-btn icon v-on="{...onMenu, ...onTooltip}">
                  <v-icon>mdi-content-save-move</v-icon>
                </v-btn>
              </template>
              <span>Save as a playlist</span>
            </v-tooltip>
          </template>
          <v-list>
            <v-list-item
              v-for="playlist in saveAsPlaylistDropdown"
              :key="playlist"
              @click="saveAsPlaylist(playlist, true)"
            >
              <v-list-item-title>{{ playlist }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-tooltip bottom>
          <template v-slot:activator="{on}">
            <v-btn
              icon
              v-on="on"
              @click.stop="confirmAction('clear', 'Clear Playing Queue', 'Are you sure to clear the playing queue?')"
            >
              <v-icon>mdi-tray-remove</v-icon>
            </v-btn>
          </template>
          <span>Clear Playing Queue</span>
        </v-tooltip>
      </v-toolbar>
    </div>

    <div>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="currentSongs"
        :single-select="false"
        item-key="Pos"
        show-select
        no-data-text="Nothing in the playing queue."
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
              >
                <template v-if="item.Pos === playingSongPos">
                  <h2>{{ item[header.value] }}</h2>
                </template>
                <template v-else>{{ item[header.value] }}</template>
              </td>
            </template>
          </tr>
        </template>
      </v-data-table>
    </div>

    <context-menu v-model="contextMenu" :x="contextMenuX" :y="contextMenuY">
      <template v-slot:list>
        <v-list dense class="pa-0 ma-0">
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
          <v-btn @click.stop="editColumnsDialog = false">Close</v-btn>
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
  name: 'PlayingQueueTable',

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
    ...mapState('playingQueue', ['currentSongs', 'tableColumns', 'isLoading']),
    ...mapState('playlists', ['playlists']),
    ...mapState('controlPanel', ['playingSong', 'playingSongPos']),
    headers: function() {
      return this.selectedMetaTags.map(v => ({
        text: v,
        align: 'left',
        sortable: true,
        value: v
      }))
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
          _self.moveSongInPlayingQueue({
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
    ...mapActions(['playImmediate', 'addSongsToPlaylist']),
    ...mapActions('playingQueue', [
      'clearPlayingQueue',
      'moveSongInPlayingQueue',
      'deleteSongsInPlayingQueue',
      'savePlayingQueueAsPlaylist',
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

    //----- Playing Queue Actions

    removeSongs: async function() {
      await this.deleteSongsInPlayingQueue(this.selected.map(v => v.Pos))
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

    executeAction: async function(isOk) {
      if (!isOk) {
        return
      }

      switch (this.confirmationAction) {
        case 'clear':
          this.clearPlayingQueue()
          this.selected = []
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
.pane {
  width: 100%;
  height: 100%;
  text-align: left;
  padding: 0px;
  overflow: auto;
  border: 1px solid #ccc;
  margin-bottom: 0em;
}
</style>