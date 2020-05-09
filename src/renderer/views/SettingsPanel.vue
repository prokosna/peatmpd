<template>
  <div>
    <v-card>
      <v-card-title>Settings</v-card-title>

      <v-divider></v-divider>

      <v-container>
        <v-tabs v-model="tab" grow>
          <v-tabs-slider></v-tabs-slider>
          <v-tab href="#profiles">Profiles</v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
          <v-tab-item value="profiles">
            <v-row>
              <v-col class="col-3">
                <v-card outlined height="100%" width="100%">
                  <v-list shaped>
                    <v-list-item-group v-model="profileIndex" color="primary">
                      <v-list-item v-for="(profile, i) in profilesValue" :key="i">
                        <v-list-item-content>
                          <v-list-item-title v-text="profile.name || 'New Profile'"></v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-card>
              </v-col>

              <v-col class="col-9">
                <v-card outlined class="pa-10">
                  <v-form ref="profileform" v-model="valid" lazy-validation>
                    <v-text-field
                      v-model="edittableProfile.name"
                      label="Name"
                      :rules="[v => !!v || 'Required', v => !localProfiles.filter(a => a.id !== profileId).map(a => a.name).includes(v) || 'This name already exists']"
                      placeholder="New Profile"
                      required
                    ></v-text-field>
                    <v-divider></v-divider>
                    <v-text-field
                      v-model="edittableProfile.host"
                      label="Host"
                      :rules="[v => !!v || 'Required']"
                      placeholder="127.0.0.1"
                      required
                    ></v-text-field>
                    <v-text-field
                      v-model="edittableProfile.port"
                      label="Port"
                      :rules="[v => !isNaN(v) || 'Port must be number']"
                      placeholder="6600"
                      required
                    ></v-text-field>
                    <v-switch v-model="edittableProfile.isDark" label="Dark Theme"></v-switch>
                    <v-btn
                      v-if="profileId !== 'newprofile'"
                      color="error"
                      outlined
                      class="mr-4"
                      @click="deleteProfile(profileId)"
                    >Delete</v-btn>
                    <v-btn color="primary" outlined @click="saveProfile(profileId)">Save</v-btn>
                  </v-form>
                </v-card>
              </v-col>
            </v-row>
          </v-tab-item>
        </v-tabs-items>
      </v-container>

      <v-divider></v-divider>

      <v-card-actions>
        <v-col class="text-right">
          <template v-if="!profileId || profileId === 'newprofile'">
            <template v-if="noProfile">
              <span class="red--text">Select one of the saved profiles.</span>
            </template>
            <v-btn text @click="noProfile = true">Close</v-btn>
          </template>
          <template v-else>
            <v-btn text @click="close">Close</v-btn>
          </template>
        </v-col>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data: () => ({
    valid: false,
    tab: null,
    localProfileId: null,
    localProfiles: [],
    profileIndex: null,
    profileId: null,
    profilesValue: [],
    edittableProfile: {},
    noProfile: false
  }),

  computed: {
    ...mapState(['profiles', 'currentProfileId'])
  },

  watch: {
    localProfileId: function() {
      this.profileIndex = this.localProfiles.findIndex(
        v => v.id === this.localProfileId
      )
    },
    localProfiles: function() {
      this.profilesValue = this.localProfiles.concat([
        {
          id: 'newprofile',
          isDark: false
        }
      ])
    },
    profileIndex: function() {
      this.profileId = this.profilesValue[this.profileIndex].id
    },
    profileId: function() {
      this.edittableProfile = {
        ...this.profilesValue.find(v => v.id === this.profileId)
      }
    }
  },

  mounted: function() {
    this.localProfiles = this.profiles
    this.localProfileId = this.currentProfileId
    this.profileIndex = this.localProfiles.findIndex(
      v => v.id === this.localProfileId
    )
  },

  methods: {
    ...mapActions(['updateCurrentProfile', 'updateProfiles']),
    deleteProfile: function(id) {
      const i = this.profilesValue.findIndex(v => v.id === id)
      const tmp = [...this.profilesValue]
      if (i >= 0) {
        tmp.splice(i, 1)
      }
      tmp.pop()
      this.localProfiles = tmp
      this.profileIndex = 0
    },
    saveProfile: function(id) {
      if (this.$refs.profileform.validate()) {
        const i = this.profilesValue.findIndex(v => v.id === id)

        if (id === 'newprofile') {
          // This is the new profile
          const newid = Math.random()
            .toString(32)
            .substring(2)
          const tmp = [...this.profilesValue]
          tmp.splice(i, 1, {
            ...this.edittableProfile,
            id: newid
          })
          this.localProfiles = tmp
          this.profileId = newid
          return
        }

        if (i >= 0) {
          const tmp = [...this.profilesValue]
          tmp.pop()
          tmp.splice(i, 1, this.edittableProfile)
          this.localProfiles = tmp
        }
      }
    },
    close: function() {
      const p = this.localProfiles.find(v => v.id === this.profileId)
      this.updateProfiles(this.localProfiles)
      this.updateCurrentProfile(p.id)
      this.$emit('close-settings')
    }
  }
}
</script>