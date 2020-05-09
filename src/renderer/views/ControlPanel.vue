<template>
  <div>
    <v-app-bar app color="secondary py-0">
      <v-container class="ma-0 pa-0" fluid fill-height>
        <v-row no-gutters justify="center" align="center">
          <v-col class="col-4 text-left pa-0 d-flex align-center">
            <span class="float-left mr-1">
              <v-icon v-if="playingSong" large>mdi-music-note</v-icon>
            </span>

            <v-tooltip buttom>
              <template v-slot:activator="{on}">
                <span class="text-truncate" v-on="on">
                  <strong>{{ playingSongTitle }}</strong>
                  <template v-if="playingSong">{{ ` / ${playingSongArtist}` }}</template>
                  <br />
                  <template v-if="playingSong">{{ `from ${playingSongAlbum}` }}</template>
                </span>
              </template>
              <span>
                <strong>{{ playingSongTitle }}</strong>
                <template v-if="playingSong">{{ ` / ${playingSongArtist}` }}</template>
                <br />
                <template v-if="playingSong">{{ `from ${playingSongAlbum}` }}</template>
              </span>
            </v-tooltip>
          </v-col>

          <v-col class="col-4 text-center pa-0">
            <div>
              <v-btn class="mx-4" icon text outlined small @click="goPreviousSong()">
                <v-icon>mdi-skip-previous</v-icon>
              </v-btn>

              <v-btn class="mx-4" icon text outlined small @click="stopSong()">
                <v-icon>mdi-stop</v-icon>
              </v-btn>

              <v-btn class="mx-4" icon text outlined small @click="pauseSong()">
                <template v-if="state === 'play'">
                  <v-icon>mdi-pause</v-icon>
                </template>
                <template v-else-if="!playingSong">
                  <v-icon color="grey">mdi-play</v-icon>
                </template>
                <template v-else>
                  <v-icon>mdi-play</v-icon>
                </template>
              </v-btn>

              <v-btn class="mx-4" icon text outlined small @click="goNextSong()">
                <v-icon>mdi-skip-next</v-icon>
              </v-btn>
            </div>
            <div class="mt-1" @click="seekSong()">
              <v-progress-linear
                v-model="elapsedValue"
                height="18"
                reactive
                color="primary"
                rounded
              >{{ `${formatSecond(currentElapsedTime)} / ${formatSecond(totalTime)}` }}</v-progress-linear>
            </div>
          </v-col>

          <v-col class="col-4 px-2 py-0">
            <v-row no-gutters class="pa-0 ma-0" align="center">
              <v-col class="text-left pa-0 ma-0">
                <v-tooltip buttom>
                  <template v-slot:activator="{on}">
                    <v-btn class="mx-0" icon v-on="on" @click="switchRepeat()">
                      <v-icon :color="isRepeat ? null : 'grey'">mdi-restore</v-icon>
                    </v-btn>
                  </template>
                  <span>{{`Repeat is ${isRepeat ? 'ON' : 'OFF'}` }}</span>
                </v-tooltip>

                <v-tooltip buttom>
                  <template v-slot:activator="{on}">
                    <v-btn class="mx-0" icon v-on="on" @click="switchRandom()">
                      <v-icon :color="isRandom ? null : 'grey'">mdi-shuffle</v-icon>
                    </v-btn>
                  </template>
                  <span>{{`Random is ${isRandom ? 'ON' : 'OFF'}` }}</span>
                </v-tooltip>

                <v-tooltip buttom>
                  <template v-slot:activator="{on: onTooltip}">
                    <v-menu
                      open-on-hover
                      :close-on-content-click="false"
                      buttom
                      offset-y
                      :disabled="volumeValue < 0"
                    >
                      <template v-slot:activator="{on: onMenu}">
                        <v-btn class="mx-0" icon v-on="{...onTooltip, ...onMenu}">
                          <template v-if="volumeValue < 0">
                            <v-icon>mdi-volume-variant-off</v-icon>
                          </template>
                          <template v-else-if="volumeValue === 0">
                            <v-icon>mdi-volume-mute</v-icon>
                          </template>
                          <template v-else-if="volumeValue < 30">
                            <v-icon>mdi-volume-low</v-icon>
                          </template>
                          <template v-else-if="volumeValue < 70">
                            <v-icon>mdi-volume-medium</v-icon>
                          </template>
                          <template v-else>
                            <v-icon>mdi-volume-high</v-icon>
                          </template>
                        </v-btn>
                      </template>
                      <v-card>
                        <v-slider
                          class="pa-2"
                          v-model="volumeValue"
                          vertical
                          :label="`${volumeValue}`"
                          max="100"
                          min="0"
                          @end="setVolume"
                        ></v-slider>
                      </v-card>
                    </v-menu>
                  </template>
                  <span>{{ `Volume is ${volumeValue >= 0? volumeValue: 'disabled'}` }}</span>
                </v-tooltip>
              </v-col>

              <v-col class="text-right pa-0 ma-0">
                <v-tooltip buttom>
                  <template v-slot:activator="{on}">
                    <v-btn class="mx-4" icon v-on="on" @click.stop="openSettings()">
                      <v-icon>mdi-cog</v-icon>
                    </v-btn>
                  </template>
                  <span>Open Settings</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
    <v-dialog v-model="settingsPanelDialog" max-width="50%" persistent>
      <settings-panel @close-settings="closeSettings"></settings-panel>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { formatSecond } from '../util/format'
import SettingsPanel from './SettingsPanel'
import { UPDATE_IS_FIRST_LANDING } from '../store/mutation-types'

export default {
  name: 'ControlPanel',

  components: {
    SettingsPanel
  },

  data: () => ({
    elapsedValue: 0,
    currentElapsedTime: 0,
    volumeValue: 30,
    timer: null,
    settingsPanelDialog: false
  }),

  computed: {
    ...mapState(['isFirstLanding']),
    ...mapState('controlPanel', [
      'elapsedTime',
      'totalTime',
      'volume',
      'isRandom',
      'isRepeat',
      'state',
      'playingSong'
    ]),

    playingSongTitle: function() {
      return this.playingSong ? this.playingSong.Title : 'Not Playing'
    },

    playingSongArtist: function() {
      return this.playingSong.Artist ? this.playingSong.Artist : 'No Artist'
    },

    playingSongAlbum: function() {
      return this.playingSong.Album ? this.playingSong.Album : 'No Album'
    }
  },

  watch: {
    elapsedTime: {
      immediate: true,
      handler() {
        if (!this.elapsedTime || !this.totalTime) {
          this.elapsedValue = 0
          this.currentElapsedTime = 0
          return
        }
        this.elapsedValue = (this.elapsedTime / this.totalTime) * 100
        this.currentElapsedTime = this.elapsedTime
      }
    },
    volume: {
      immediate: true,
      handler() {
        this.volumeValue = this.volume
      }
    },
    state: {
      immediate: true,
      handler() {
        if (this.state !== 'play' && this.timer) {
          clearInterval(this.timer)
          this.timer = null

          if (this.state === 'stop') {
            this.currentElapsedTime = 0
            this.elapsedValue = 0
          }

          return
        }

        if (!this.timer) {
          const _self = this
          this.timer = setInterval(() => {
            _self.currentElapsedTime = Math.min(
              _self.totalTime,
              _self.currentElapsedTime + 1.0
            )
            _self.elapsedValue =
              (_self.currentElapsedTime / _self.totalTime) * 100
          }, 1000)
        }
      }
    }
  },

  mounted: function() {
    if (this.isFirstLanding) {
      this.openSettings()
      this.$store.commit(UPDATE_IS_FIRST_LANDING, false)
    }
  },

  methods: {
    ...mapActions('controlPanel', [
      'goPreviousSong',
      'stopSong',
      'pauseSong',
      'goNextSong',
      'setVolume',
      'switchRepeat',
      'switchRandom',
      'seek'
    ]),
    formatSecond,

    seekSong: async function() {
      const newElapsedTime = this.totalTime * this.elapsedValue * 0.01
      await this.seek(newElapsedTime)
    },

    openSettings: function() {
      this.settingsPanelDialog = true
    },

    closeSettings: function() {
      this.settingsPanelDialog = false
    }
  }
}
</script>

<style scoped>
.volume-slider > .v-input {
  max-width: 20%;
}
</style>