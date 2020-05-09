<template>
  <div>
    <v-list nav>
      <v-list-item-group v-model="item" color="primary" :mandatory="isMandatory">
        <v-list-item v-for="playlist in playlists" :key="playlist.playlist">
          <v-list-item-content @click="select(playlist.playlist)">
            <v-list-item-title v-html="playlist.playlist"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'PlaylistsSideBar',

  data: () => ({
    item: null
  }),

  computed: {
    ...mapState('playlists', ['playlists', 'playlistSongs', 'currentPlaylist']),
    isMandatory: function() {
      return !!this.currentPlaylist
    }
  },

  methods: {
    ...mapActions('playlists', ['selectPlaylist']),

    select: async function(playlist) {
      await this.selectPlaylist(playlist)
    }
  }
}
</script>

<style scoped>
</style>
