<template>
  <div class="outer-bar text-left">
    <div :title="progress.found + ' gefunden'" class="bar" :style="{width: progress.found / this.searchTable.length * 100 + '%', background: '#4caf50'}">
      {{ progress.found }} gefunden
    </div>
    <div :title="progress.ambiguous + ' mehrdeutig'" class="bar" :style="{width: progress.ambiguous / this.searchTable.length * 100 + '%', background: '#f44236'}">
      {{ progress.ambiguous }} mehrdeutig
    </div>
    <div :title="progress.notFound + ' nicht gefunden'" class="bar" :style="{width: progress.notFound / this.searchTable.length * 100 + '%', background: '#ababab'}">
      {{ progress.notFound }} nicht gefunden
    </div>
  </div>
</template>
<script lang="ts">
import { PersonMatchable } from '@/types'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class Progress extends Vue {

  @Prop() searchTable: PersonMatchable[]

  get progress(): {found: number, notFound: number, ambiguous: number} {
    return {
      found: this.searchTable.filter(r => r.loaded === true && r.candidateSelected > -1).length,
      notFound: this.searchTable.filter(r => r.loaded === true && r.lobid.length === 0).length,
      ambiguous: this.searchTable.filter(r => r.loaded === true && r.candidateSelected === -1 && r.lobid.length !== 0).length,
    }
  }

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
