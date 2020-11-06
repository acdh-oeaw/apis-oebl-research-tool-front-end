<template>
  <div class="outer-bar text-left">
    <div :title="progress.found + ' gefunden'" class="bar" :style="{width: progress.found / total * 100 + '%', background: '#4caf50'}">
      {{ progress.found }} gefunden
    </div>
    <div :title="progress.ambiguous + ' mehrdeutig'" class="bar" :style="{width: progress.ambiguous / total * 100 + '%', background: '#f44236'}">
      {{ progress.ambiguous }} mehrdeutig
    </div>
    <div :title="progress.notFound + ' nicht gefunden'" class="bar" :style="{width: progress.notFound / total * 100 + '%', background: '#ababab'}">
      {{ progress.notFound }} nicht gefunden
    </div>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class Progress extends Vue {

  @Prop() progress: { found: number, notFound: number, ambiguous: number }
  @Prop() total: number

}
</script>
<style lang="stylus" scoped>
.outer-bar{
  background: repeating-linear-gradient(45deg, #ccc, #ccc 10px, #a5a5a5 10px, #a5a5a5 20px)
  border-radius 5px
  overflow hidden
  position relative
  height: 20px
}
.bar{
  border-right: 1px solid rgba(255,255,255,.15)
  text-overflow: ellipsis
  white-space: nowrap;
  padding: 0 0.5em;
  transition .25s width
  text-align center
  font-size small
  color white
  overflow hidden
  float left
  height: 100%
}
</style>
