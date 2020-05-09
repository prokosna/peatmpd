<template>
  <v-menu v-model="openFlag" :position-x="x" :position-y="y" absolute offset-y>
    <slot name="list"></slot>
  </v-menu>
</template>

<script>
export default {
  name: 'ContextMenu',

  model: {
    prop: 'open',
    event: 'close-menu'
  },

  props: {
    open: {
      type: Boolean,
      default: false
    },
    x: Number,
    y: Number
  },

  computed: {
    openFlag: {
      get() {
        return this.open
      },
      set(value) {
        this.$emit('close-menu', value)
      }
    }
  }
}
</script>