<template>
  <div>
    <v-row
      v-for="(fragment, i) in fragments"
      :key="i"
      @click="selectOrDeselectFragment(fragment.gnd)"
      style="overflow: hidden"
      :class="['fragment', $listeners['input'] !== undefined && 'clickable', 'rounded-lg', 'mt-1' ]"
      no-gutters>
      <slot />
      <div style="flex: 0 0 40px" class="align-self-center text-center" v-if="$listeners['input'] !== undefined">
        <v-icon color="primary" v-if="value.includes(fragment.gnd)">mdi-check-decagram</v-icon>
        <v-icon v-else>mdi-checkbox-blank-circle-outline</v-icon>
      </div>
      <div
        v-if="fragment.html !== null"
        style="height: 100px; overflow: hidden; flex: 0 0 100px;"
        class="pt-1 pb-1 text-center"
        cols="3" >
        <img v-if="fragment.data.picture" :src="fragment.data.picture" />
        <v-icon class="mt-5 ml-5 pt-4 pl-2" v-else>mdi-image-broken-variant</v-icon>
      </div>
      <div style="line-height: 1.2; flex: 1" class="pt-1 pl-2 caption">
        <div class="description">
          <b>{{ fragment.data.name }}</b>
          <br /> {{ fragment.data.description || fragment.data.type }}
        </div>
        <a class="mt-2 d-inline-block text-decoration-none" target="_blank" :href="'https://lobid.org/gnd/' + fragment.gnd">
        &rarr; {{ showFullLink ? `https://lobid.org/gnd/${fragment.gnd}` : fragment.gnd }}</a>
      </div>
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
  data: {
    name: string
    id: string
    type: string
    picture: string|null
    description: string|null
  }
}

@Component
export default class LobidPreviewCard extends Vue {

  @Prop({ default: Array, }) gnd!: string[];
  @Prop({ default: Infinity, }) limit!: number;
  @Prop({ default: Array, }) value!: string[];
  @Prop({ default: false }) showFullLink!: boolean;

  allFragments: Fragment[] = []
  loading = false

  selectOrDeselectFragment(gnd: string) {
    const gnds = new Set(this.value);
    if (gnds.has(gnd)) {
      gnds.delete(gnd);
    } else {
      gnds.add(gnd);
    }
    this.$emit('input', Array.from(gnds));
  }

  get fragments() {
    return _.take(this.allFragments, this.limit)
  }

  async loadPreviews(gnd: string[]) {
    // const results = await lobidService.getPreviews(gnd)
    const results = await Promise.all(gnd.map(g => lobidService.get(g)))
    return gnd.map((e, i) => {
      return {
        gnd: e,
        html: '',
        data: results[i],
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

.fragment img
  border-radius 7px
  max-width 80px
  max-height 100%
  background var(--v-background-lighten2)

.fragment a
  font-weight 700

.fragment .description
  -webkit-line-clamp 5
  -webkit-box-orient vertical
  display -webkit-box
  overflow hidden
</style>
