<template>
  <div>
    <v-row
      v-for="(fragment, i) in fragments"
      :key="i"
      @click="selectOrDeselectFragment(fragment.gnd)"
      style="font-size: 130%; line-height: 1.2; height: 100px"
      :class="['fragment', $listeners['input'] !== undefined && 'clickable' ]"
      no-gutters>
      <slot />
      <v-col class="align-self-center text-center" cols="2" v-if="$listeners['input'] !== undefined">
        <v-icon color="primary" v-if="fragment.gnd === value">mdi-check-decagram</v-icon>
        <v-icon v-else>mdi-checkbox-blank-circle-outline</v-icon>
      </v-col>
      <v-col
        v-if="fragment.html !== null"
        style="height: 100px; overflow: hidden"
        class="pt-1 pb-1"
        v-html="fragment.html"
        cols="10" />
      <v-col style="opacity: .5" class="pa-0 text-center caption" v-else>
        (nicht gefunden)
      </v-col>
    </v-row>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import * as lobidService from '../../service/lobid'
import _ from 'lodash'

type Fragment = {
  html: string | null,
  selected: boolean,
  gnd: string
}

@Component
export default class LobidPreviewCard extends Vue {

  @Prop({ default: [] }) gnd!: string[]
  @Prop({ default: Infinity }) limit!: number
  @Prop({ default: null }) value!: string|null

  allFragments: Fragment[] = []
  loading = false

  selectOrDeselectFragment(gnd: string) {
    this.$emit('click', gnd)
    if (gnd === this.value) {
      this.$emit('input', null)
    } else {
      this.$emit('input', gnd)
    }
  }

  get fragments() {
    return _.take(this.allFragments, this.limit)
  }

  async loadPreviews(gnd: string[]) {
    const results = await lobidService.getPreviews(gnd)
    return gnd.map((e, i) => {
      return {
        gnd: e,
        html: results[i],
        selected: false
      }
    })
  }

  @Watch('gnd', { immediate: true })
  async onChangeGnd(gnd: string[]) {
    this.allFragments = await this.loadPreviews(_.take(gnd, this.limit))
  }
}
</script>
<style lang="stylus" scoped>
.fragment
  position relative
  border-radius 6px
  &.clickable:hover
    background var(--v-background-lighten1)

.fragment /deep/ img
  border-radius 7px
  max-width 80px
  background var(--v-background-lighten2)

.fragment /deep/ a
  font-weight 700
</style>
