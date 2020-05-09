<template>
  <div>
    <v-btn block @click="add">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-list nav>
      <v-list-item-group v-model="item" color="primary" :mandatory="isMandatory">
        <v-list-item v-for="conditions in conditionsList" :key="conditions.name">
          <v-list-item-content @click="select(conditions.name)">
            <v-list-item-title v-html="conditions.name"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <playlist-name-input
      v-model="inputDialog"
      :playlists="conditionsList.map(v => v.name)"
      @playlist-response="createSmartPlaylist"
    >
      <template v-slot:title>New Smart Playlist</template>
    </playlist-name-input>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import PlaylistNameInput from '../components/PlaylistNameInput'

export default {
  name: 'SmartPlaylistsSideBar',

  components: {
    PlaylistNameInput
  },

  data: () => ({
    item: null,
    inputDialog: false
  }),

  computed: {
    ...mapState('smartPlaylists', ['currentConditions', 'conditionsList']),
    isMandatory: function() {
      return !!this.currentConditions
    }
  },

  watch: {
    currentConditions: function() {
      this.item = this.conditionsList.findIndex(
        v => v.name === this.currentConditions
      )
    }
  },

  methods: {
    ...mapActions('smartPlaylists', ['selectConditions', 'addNewConditions']),

    select: async function(name) {
      await this.selectConditions(name)
    },

    add: function() {
      this.inputDialog = true
    },

    createSmartPlaylist: function(name) {
      if (!name) {
        return
      }
      this.addNewConditions(name)
    }
  }
}
</script>

<style scoped>
</style>