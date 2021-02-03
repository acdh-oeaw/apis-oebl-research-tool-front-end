<template>
  <div>
    <v-row v-for="(fragment, gnd) in fragments" :key="gnd" style="font-size: 120%; line-height: 1.2;" class="fragment" no-gutters>
      <slot />
      <v-col style="height: 100px" v-html="fragment.html" cols="11">
      </v-col>
    </v-row>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import * as lobidService from '../../service/lobid'

type Fragments = {
  [gnd: string]: {
    html: string,
    selected: boolean
  }
}

@Component
export default class LobidPreviewCard extends Vue {

  @Prop({ default: [] }) gnd!: string[]
  @Prop({ default: 10 }) limit!: number

  fragments: Fragments = {}
  loading = false

  async loadPreviews(gnd: string[]) {
    const results = await lobidService.getPreviews(gnd)
    return gnd.reduce((m, e, i) => {
      m[e] = { html: results[i], selected: false }
      return m
    }, {} as Fragments)
  }

  @Watch('gnd', { immediate: true })
  async onChangeGnd(gnd: string[]) {
    this.fragments = await this.loadPreviews(gnd)
  }
}
</script>
<style lang="stylus" scoped>
.fragment /deep/ img
  border-radius 7px

.fragment /deep/ a
  font-weight 700
</style>
