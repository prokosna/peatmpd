<template>
  <v-app class="app-container">
    <ControlPanel />

    <v-content>
      <v-tabs v-model="tab" centered grow>
        <v-tabs-slider></v-tabs-slider>
        <v-tab href="#tab-1">Playing Queue</v-tab>
        <v-tab href="#tab-2">Browser</v-tab>
        <v-tab href="#tab-3">Playlists</v-tab>
        <v-tab href="#tab-4">Smart Playlists</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item value="tab-1">
          <div class="tab-item-wrapper">
            <PlayingQueueTable />
          </div>
        </v-tab-item>
        <v-tab-item value="tab-2">
          <div class="tab-item-wrapper">
            <ResizableColumns :flexBar="browserSideBar" :flexContent="browserTable" />
          </div>
        </v-tab-item>
        <v-tab-item value="tab-3">
          <div class="tab-item-wrapper">
            <ResizableColumns :flexBar="playlistsSideBar" :flexContent="playlistsTable" />
          </div>
        </v-tab-item>
        <v-tab-item value="tab-4">
          <div class="tab-item-wrapper">
            <ResizableColumns :flexBar="smartPlaylistsSideBar" :flexContent="smartPlaylistsTable" />
          </div>
        </v-tab-item>
      </v-tabs-items>

      <v-overlay absolute :value="isLoading">
        <div class="text-center">
          <v-progress-circular indeterminate color="primary" size="70"></v-progress-circular>
        </div>
      </v-overlay>
    </v-content>
    <template v-if="hasMessage">
      <v-bottom-navigation absolute horizontal class="bottom-navbar">
        <v-alert dense text type="info" v-if="infoMessage" width="100%">{{infoMessage}}</v-alert>
        <v-alert
          dense
          text
          type="success"
          v-else-if="successMessage"
          width="100%"
        >{{successMessage}}</v-alert>
        <v-alert
          dense
          text
          type="warning"
          v-else-if="warningMessage"
          width="100%"
        >{{warningMessage}}</v-alert>
        <v-alert dense text type="error" v-else-if="errorMessage" width="100%">{{errorMessage}}</v-alert>
      </v-bottom-navigation>
    </template>
  </v-app>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import ControlPanel from './views/ControlPanel'
import PlayingQueueTable from './views/PlayingQueueTable'
import BrowserSideBar from './views/BrowserSideBar'
import BrowserTable from './views/BrowserTable'
import PlaylistsSideBar from './views/PlaylistsSideBar'
import PlaylistsTable from './views/PlaylistsTable'
import SmartPlaylistsSideBar from './views/SmartPlaylistsSideBar'
import SmartPlaylistsTable from './views/SmartPlaylistsTable'
import ResizableColumns from './components/ResizableColumns'

export default {
  name: 'App',

  components: {
    ControlPanel,
    ResizableColumns,
    PlayingQueueTable
  },

  created: function() {
    this.initialize()

    this.connectToMpd()

    const p = this.profiles.find(v => v.id === this.currentProfileId)
    if (p) {
      this.$vuetify.theme.dark = p.isDark
    }
  },

  data: () => ({
    tab: null,
    browserSideBar: BrowserSideBar,
    browserTable: BrowserTable,
    playlistsSideBar: PlaylistsSideBar,
    playlistsTable: PlaylistsTable,
    smartPlaylistsSideBar: SmartPlaylistsSideBar,
    smartPlaylistsTable: SmartPlaylistsTable
  }),

  computed: {
    ...mapState([
      'isLoading',
      'successMessage',
      'infoMessage',
      'warningMessage',
      'errorMessage',
      'currentProfileId',
      'profiles'
    ]),
    ...mapGetters(['currentProfile']),
    hasMessage: function() {
      return (
        this.successMessage ||
        this.infoMessage ||
        this.warningMessage ||
        this.errorMessage
      )
    }
  },

  watch: {
    profiles: function() {
      const p = this.profiles.find(v => v.id === this.currentProfileId)
      if (p) {
        this.$vuetify.theme.dark = p.isDark
      }
      this.connectToMpd()
    }
  },

  methods: {
    ...mapActions(['initialize', 'connectToMpd'])
  }
}
</script>

<style scoped>
.tab-item-wrapper {
  height: calc(100vh - 64px - 48px);
}
</style>

<style>
html {
  overflow-y: hidden !important;
}
</style>