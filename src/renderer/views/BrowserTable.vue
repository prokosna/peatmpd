<template>
  <div>
    <div>
      <v-card>
        <v-card-title class="py-0">
          <v-text-field
            class="px-16"
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
      </v-card>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="currentSongs"
        :single-select="false"
        item-key="file"
        show-select
        no-data-text="Please select any tag from the side panel."
        dense
        disable-pagination
        multi-sort
        :loading="isLoading"
        hide-default-footer
        :sort-by="tableSortedBy"
        :sort-desc="tableSortDesc"
        :search="search"
        @current-items="updateItems"
        @update:options="updateOptions"
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
            <v-btn text @click="addSongs">Add to Queue</v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn text @click="replaceSongs">Replace Queue</v-btn>
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
                  @click="saveAsPlaylist(playlist)"
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

    <playlist-name-input
      v-model="inputDialog"
      :playlists="playlists.map(v => v.playlist)"
      @playlist-response="createPlaylist"
    ></playlist-name-input>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import EditColumnsPanel from '../components/EditColumnsPanel'
import PlaylistNameInput from '../components/PlaylistNameInput'
import ContextMenu from '../components/ContextMenu'

export default {
  name: 'BrowserTable',

  components: {
    EditColumnsPanel,
    PlaylistNameInput,
    ContextMenu
  },

  data: () => ({
    songs: [],
    selected: [],
    search: null,
    editColumnsDialog: false,
    selectedMetaTags: [],
    isPressedShiftKey: false,
    selectedSongWithShiftKey: null,
    inputDialog: false,
    contextMenu: null,
    contextMenuX: null,
    contextMenuY: null
  }),

  computed: {
    ...mapState(['metaTags']),
    ...mapState('browser', [
      'isLoading',
      'currentSongs',
      'tableColumns',
      'tableSortedBy',
      'tableSortDesc'
    ]),
    ...mapState('playlists', ['playlists']),
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
    }
  },

  mounted: function() {
    this.selectedMetaTags = this.tableColumns
    document.addEventListener('keydown', this.checkShiftKey, false)
    document.addEventListener('keyup', this.checkShiftKey, false)
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
    ...mapActions('browser', [
      'updateTableColumns',
      'updateTableSortedBy',
      'updateTableSortDesc'
    ]),
    ...mapActions('playingQueue', ['clearPlayingQueue']),

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

    //----- Browser Actions

    addSongs: function() {
      this.addSongsToPlayingQueue(this.selected.map(v => v.file))
    },

    replaceSongs: async function() {
      await this.clearPlayingQueue()
      await this.addSongsToPlayingQueue(this.selected.map(v => v.file))
      await this.playImmediate()
    },

    updateItems: function(items) {
      this.selectedSongWithShiftKey = null
      this.songs = items
    },

    updateOptions: async function(options) {
      this.selectedSongWithShiftKey = null
      await this.updateTableSortedBy(options.sortBy)
      await this.updateTableSortDesc(options.sortDesc)
    },

    saveAsPlaylist: async function(playlist) {
      if (playlist === 'New Playlist') {
        this.inputDialog = true
        return
      }

      await this.addSongsToPlaylist({
        playlist,
        files: this.selected.map(v => v.file)
      })
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