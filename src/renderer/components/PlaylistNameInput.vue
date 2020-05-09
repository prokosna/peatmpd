<template>
  <v-row justify="center">
    <v-dialog v-model="dialogFlag" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">
          <slot name="title">New Playlist</slot>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="playlist"
            label="Playlist"
            required
            :rules="[() => !!playlist || 'Required', checkPlaylistName]"
            ref="input"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="response(false)">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="response(true)">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  name: 'PlaylistNameInput',

  model: {
    prop: 'dialog',
    event: 'close-dialog'
  },

  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    playlists: Array
  },

  data: () => ({
    playlist: null
  }),

  computed: {
    dialogFlag: {
      get() {
        return this.dialog
      },
      set(value) {
        this.$emit('close-dialog', value)
      }
    }
  },

  methods: {
    checkPlaylistName: function(playlist) {
      if (!this.playlists) {
        return true
      }
      return this.playlists.includes(playlist)
        ? 'The playlist already exists'
        : true
    },

    response: function(isOk) {
      if (!isOk) {
        this.$emit('playlist-response')
        this.dialogFlag = false
        return
      }

      if (this.$refs.input.validate()) {
        this.$emit('playlist-response', String(this.playlist))
        this.dialogFlag = false
        this.playlist = null
      }
    }
  }
}
</script>
