<template>
  <v-row>
    <v-col cols="2" class="pa-0 ma-1">
      <v-select
        outlined
        v-model="metaTag"
        :items="metaTags"
        placeholder="Tag"
        dense
        full-width
        hide-details="auto"
      ></v-select>
    </v-col>
    <v-col cols="2" class="pa-0 ma-1">
      <v-select
        outlined
        v-model="op"
        :items="operatorsDropdown"
        placeholder="Op"
        dense
        full-width
        hide-details="auto"
      ></v-select>
    </v-col>
    <v-col cols="6" class="pa-0 ma-1">
      <v-text-field
        outlined
        v-model="metaValue"
        placeholder="Condition"
        dense
        full-width
        hide-details="auto"
        :rules="[isInvalidRegex]"
        ref="metaValue"
      ></v-text-field>
    </v-col>
    <v-col class="pa-0 my-1 mx-2">
      <v-btn text outlined @click="remove">
        <v-icon>mdi-minus</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import * as operators from '../../../src/const/mpd/operators'

export default {
  name: 'SmartPlaylistCondition',

  model: {
    prop: 'condition',
    event: 'input'
  },

  props: {
    condition: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    ...mapState(['metaTags']),
    metaTag: {
      get() {
        return this.condition.metaTag
      },
      set(value) {
        const hasError = !this.$refs.metaValue.validate()
        this.$emit('input', { ...this.condition, metaTag: value, hasError })
      }
    },
    op: {
      get() {
        return this.condition.op
      },
      set(value) {
        const hasError = !this.$refs.metaValue.validate()
        this.$emit('input', { ...this.condition, op: value, hasError })
      }
    },
    metaValue: {
      get() {
        return this.condition.metaValue
      },
      set(value) {
        const hasError = !this.$refs.metaValue.validate()
        this.$emit('input', { ...this.condition, metaValue: value, hasError })
      }
    },
    operatorsDropdown: function() {
      return Object.values(operators)
    },
    operators: function() {
      return operators
    }
  },

  methods: {
    isInvalidRegex: function(reg) {
      if (this.condition.op !== operators.REGEX) {
        return true
      }

      try {
        new RegExp(reg)
        return true
      } catch (e) {
        return e.message
      }
    },
    remove: function() {
      this.$emit('remove-condition')
    }
  }
}
</script>