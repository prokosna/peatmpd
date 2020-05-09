<template>
  <multipane class="custom-resizer" layout="vertical">
    <div class="pane" :style="{ width: '20%', maxWidth: '50%', minWidth: '15%' }">
      <div :is="flexBar">
        <h6 class="title is-6">Pane 1</h6>
      </div>
    </div>
    <multipane-resizer></multipane-resizer>
    <div class="pane flex-grow-1">
      <div :is="flexContent">
        <h6 class="title is-6">Pane 3</h6>
      </div>
    </div>
  </multipane>
</template>

<script>
import { Multipane, MultipaneResizer } from 'vue-multipane'
export default {
  props: {
    flexBar: Object,
    flexContent: Object
  },
  components: {
    Multipane,
    MultipaneResizer
  },
  methods: {}
}
</script>

<style lang="scss">
.custom-resizer {
  width: 100%;
  height: 100%;
}
.custom-resizer > .pane {
  text-align: left;
  padding: 0px;
  overflow: auto;
  border: 1px solid #ccc;
  margin-bottom: 0em;
}
.custom-resizer > .multipane-resizer {
  margin: 0;
  left: 0;
  position: relative;
  &:before {
    display: block;
    content: '';
    width: 3px;
    height: 40px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -20px;
    margin-left: -1.5px;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
  }
  &:hover {
    &:before {
      border-color: #999;
    }
  }
}
</style>
