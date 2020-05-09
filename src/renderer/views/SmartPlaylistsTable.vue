<template>
  <div>
    <div>
      <div>
        <template v-if="currentConditions !== null">
          <v-expansion-panels accordion>
            <v-expansion-panel>
              <v-expansion-panel-header class="pa-0 ma-0">
                <v-toolbar>
                  <v-toolbar-title>
                    <strong>{{ currentConditions }}</strong>
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
                        @click.stop="confirmAction('delete', 'Delete', 'Are yopu sure to delete this smart playlist?')"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>Delete</span>
                  </v-tooltip>
                </v-toolbar>
              </v-expansion-panel-header>

              <v-expansion-panel-content>
                <v-container>
                  <v-row>Match the following conditions (case-insentitive):</v-row>
                  <v-row>
                    <strong>It is strongly recommended to use at least one "Equals" rule, otherwise all songs will be scanned</strong>
                  </v-row>
                  <template v-for="(_, i) in localConditions">
                    <smart-playlists-condition
                      v-model="localConditions[i]"
                      :key="i"
                      @remove-condition="removeCondition(i)"
                    ></smart-playlists-condition>
                  </template>
                  <v-row v-if="!someIsEmptyOrError()">
                    <v-col cols="2 pa-0 mx-1">
                      <v-btn text outlined @click="addCondition">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </v-col>
                    <v-col offset="8" class="py-0 px-6">
                      <v-tooltip bottom>
                        <template v-slot:activator="{on}">
                          <v-btn
                            v-if="localConditions.length > 0"
                            text
                            outlined
                            @click="saveConditions"
                            color="primary"
                            v-on="on"
                          >
                            <v-icon>mdi-check</v-icon>
                          </v-btn>
                        </template>
                        <span>Save and Update</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </v-container>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>
      </div>
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
        disable-filtering
        multi-sort
        :loading="isLoading"
        hide-default-footer
        :sort-by="tableSortedBy"
        :sort-desc="tableSortDesc"
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
import EditColumnsPanel from '../components/EditColumnsPanel'
import ConfirmationDialog from '../components/ConfirmationDialog'
import SmartPlaylistsCondition from './SmartPlaylistsCondition'
import PlaylistNameInput from '../components/PlaylistNameInput'
import ContextMenu from '../components/ContextMenu'
import * as operators from '../../../src/const/mpd/operators'
import { formatSecond } from '../util/format'

export default {
  name: 'SmartPlaylistsTable',

  components: {
    EditColumnsPanel,
    ConfirmationDialog,
    SmartPlaylistsCondition,
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
    contextMenuY: null,
    localConditions: []
  }),

  watch: {
    conditionsList: {
      immediate: true,
      handler() {
        if (this.currentConditions) {
          this.localConditions = [
            ...this.conditionsList.find(v => v.name === this.currentConditions)
              .conditions
          ]
        }
      }
    },
    currentConditions: function() {
      if (this.currentConditions) {
        this.localConditions = [
          ...this.conditionsList.find(v => v.name === this.currentConditions)
            .conditions
        ]
      }
    }
  },

  computed: {
    ...mapState(['metaTags']),
    ...mapState('smartPlaylists', [
      'isLoading',
      'currentSongs',
      'currentConditions',
      'conditionsList',
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
    ...mapActions('smartPlaylists', [
      'updateCurrentSongs',
      'updateConditions',
      'removeConditions',
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

    //----- Smart Playlists Actions

    addSongs: function() {
      this.addSongsToPlayingQueue(this.selected.map(v => v.file))
    },

    replaceSongs: async function() {
      await this.clearPlayingQueue()
      await this.addSongsToPlayingQueue(this.selected.map(v => v.file))
      await this.playImmediate()
    },

    saveConditions: async function() {
      await this.updateConditions({
        name: this.currentConditions,
        conditions: this.localConditions
      })
      this.updateCurrentSongs()
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

    addCondition: function() {
      this.localConditions.push({})
    },

    removeCondition: function(i) {
      this.localConditions.splice(i, 1)
    },

    someIsEmptyOrError: function() {
      return this.localConditions.some(
        v => !v.metaTag || !v.op || !v.metaValue || v.hasError
      )
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
        case 'delete':
          this.removeConditions(this.currentConditions)
          break
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

      this.addSongsToPlaylist({
        playlist,
        files: this.songs.map(v => v.file)
      })
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