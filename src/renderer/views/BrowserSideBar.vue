<template>
  <div>
    <v-menu transition="slide-y-transition" bottom right>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" block>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="metaTag  in metaTags.filter(v => !sideBarMetaTags.includes(v))"
          :key="metaTag"
          @click="addMetaTagRow(metaTag)"
        >
          <v-list-item-title>{{ metaTag }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-expansion-panels accordion multiple>
      <v-expansion-panel v-for="sideBarMetaTag in sideBarMetaTags" :key="sideBarMetaTag">
        <v-expansion-panel-header class="ma-0 py-0 px-6">
          <v-row align="center">
            <v-col class="ma-0 py-0 px-4">
              <strong>{{ sideBarMetaTag }}</strong>
            </v-col>
            <v-col class="ma-0 py-0 px-4 text-right">
              <v-btn class="mx-0" icon @click="removeMetaTagRow(sideBarMetaTag)">
                <v-icon dense>mdi-trash-can</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-header>

        <v-expansion-panel-content class="ma-0 pa-0">
          <v-simple-table dense height="25vh">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="no-header"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="metaValue in sideBarMetaValues[sideBarMetaTag]" :key="metaValue">
                  <td
                    :class="{selected: sideBarMetaValuesSelected.filter(v => v.metaTag === sideBarMetaTag).map(v=>v.metaValue).includes(metaValue)}"
                    @click="selectMetaValue({metaTag: sideBarMetaTag, metaValue})"
                  >{{ metaValue }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'BrowserSideBar',

  data: () => ({}),

  computed: {
    ...mapState(['metaTags']),
    ...mapState('browser', [
      'isLoading',
      'sideBarMetaTags',
      'sideBarMetaValues',
      'sideBarMetaValuesSelected'
    ])
  },

  methods: {
    ...mapActions('browser', [
      'refreshCurrentSongs',
      'addMetaTagRow',
      'removeMetaTagRow',
      'selectMetaValue'
    ])
  }
}
</script>

<style scoped>
.no-header {
  height: 0;
  padding: 0;
  border-bottom: 0px !important;
}
.center-panel {
  text-align: center;
}
.selected {
  color: var(--v-primary-base);
}
.v-expansion-panel-header {
  height: 48px;
}
.v-expansion-panel-content >>> .v-expansion-panel-content__wrap {
  margin: 0px;
  padding: 0px 4px;
}
</style>
