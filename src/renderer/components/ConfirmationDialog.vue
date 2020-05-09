<template>
  <v-row justify="center">
    <v-dialog v-model="dialogFlag" persistent max-width="290">
      <v-card>
        <slot name="title">
          <v-card-title class="headline">{{ cardTitle ? cardTitle : "Confirm" }}</v-card-title>
        </slot>
        <slot name="text">
          <v-card-text>{{ cardText ? cardText : "Are you sure to do this?" }}</v-card-text>
        </slot>
        <v-card-actions>
          <v-btn text @click="response(false)">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="response(true)">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  name: 'ConfirmationDialog',

  model: {
    prop: 'dialog',
    event: 'close-dialog'
  },

  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    cardTitle: String,
    cardText: String
  },

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
    response: function(isOk) {
      this.$emit('is-ok-response', isOk)
      this.dialogFlag = false
    }
  }
}
</script>
