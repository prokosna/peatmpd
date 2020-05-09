<template>
  <div>
    <v-card>
      <v-card-title>Edit Columns</v-card-title>

      <v-divider></v-divider>

      <v-container>
        <v-row no-gutters>
          <v-col sm="8">
            <v-card>
              <v-simple-table height="50vh">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="no-header"></th>
                      <th class="no-header"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="v in metaTagList" :key="v.name">
                      <td>
                        <v-checkbox
                          class="my-2"
                          :key="v.name"
                          :input-value="v.isSelected"
                          @change="select(v.name)"
                          hide-details
                          dense
                        ></v-checkbox>
                      </td>
                      <td
                        :class="{selected: v.name === clicked}"
                        @click="click(v.name)"
                      >{{ v.name }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card>
          </v-col>
          <v-col sm="4">
            <v-btn block class="ma-2" @click="up()">Move Up</v-btn>
            <v-btn block class="ma-2" @click="down()">Move Down</v-btn>
          </v-col>
        </v-row>
      </v-container>

      <v-divider></v-divider>

      <v-card-actions>
        <v-col class="text-right">
          <slot name="close-button"></slot>
        </v-col>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'EditColumnsPanel',

  props: {
    allMetaTags: Array,
    selectedMetaTags: Array
  },

  data: () => ({
    clicked: null
  }),

  computed: {
    metaTagList: function() {
      return this.selectedMetaTags
        .map(v => ({ name: v, isSelected: true }))
        .concat(
          this.allMetaTags
            .filter(v => !this.selectedMetaTags.includes(v))
            .map(v => ({ name: v, isSelected: false }))
        )
    }
  },

  methods: {
    click: function(name) {
      this.clicked = this.clicked === name ? null : name
    },

    select: function(name) {
      const selected = this.metaTagList
        .filter(
          v =>
            (v.name === name && !v.isSelected) ||
            (v.name !== name && v.isSelected)
        )
        .map(v => v.name)

      this.$emit('update-selected-meta-tags', selected)
    },

    up: function() {
      if (!this.clicked) {
        return
      }

      const max = this.metaTagList.filter(v => v.isSelected).length
      const i = this.metaTagList.findIndex(v => v.name == this.clicked)
      if (i <= 0 || i > max - 1) {
        return
      }

      const tmp = this.metaTagList.filter(v => v.isSelected).map(v => v.name)
      tmp.splice(i - 1, 2, tmp[i], tmp[i - 1])
      this.$emit('update-selected-meta-tags', tmp)
    },

    down: function() {
      if (!this.clicked) {
        return
      }

      const max = this.metaTagList.filter(v => v.isSelected).length
      const i = this.metaTagList.findIndex(v => v.name == this.clicked)
      if (i < 0 || i >= max - 1) {
        return
      }

      const tmp = this.metaTagList.filter(v => v.isSelected).map(v => v.name)
      tmp.splice(i, 2, tmp[i + 1], tmp[i])
      this.$emit('update-selected-meta-tags', tmp)
    }
  }
}
</script>

<style scoped>
.no-header {
  height: 0;
  padding: 0;
  border-bottom: 0px !important;
}
.selected {
  background-color: gray;
}
</style>