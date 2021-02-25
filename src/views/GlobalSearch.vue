<template>
  <div>
    <v-dialog
      overlay-color="black"
      overlay-opacity=".8"
      transition="fade-transition"
      max-width="1000"
      content-class="elevation-0"
      :value="value"
      @input="$emit('input', $event)">
      <v-card v-if="value" color="transparent" flat>
        <v-card-title>
          <input
            @keydown.down.prevent="selectResult(1)"
            @keydown.up.prevent="selectResult(-1)"
            v-model="searchText"
            @keydown.esc.capture.prevent.stop="onEsc"
            ref="input"
            class="pa-4 rounded-lg global-search background darken-1"
            placeholder="Suchen…"
            type="text" />
        </v-card-title>
        <v-card-text class="rounded-lg overflow-hidden" style="height: 450px; position: relative">
          <div v-if="searchText !== ''" class="d-flex flex-row rounded-lg background darken-2 fill-height">
            <v-list ref="list" style="width: 60%" class="overflow-y-auto fill-height pa-0" color="background darken-2" dense>
              <v-subheader class="sticky px-2 ma-0" style="z-index: 1; background: var(--v-background-darken2)">
                Lemmata
              </v-subheader>
              <v-list-item
                @click="selectedResult = i"
                :input-value="i === selectedResult"
                v-for="(result, i) in results"
                :key="i">
                <v-list-item-content>
                  <v-list-item-title>
                    {{ result.firstName }} {{ result.lastName }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ result.birthYear }} - {{ result.deathYear }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action-text style="white-space: nowrap; overflow: hidden; max-width: 100px">
                  {{ Object.values(result.columns_user).join(', ') }}
                </v-list-item-action-text>
              </v-list-item>
            </v-list>
            <div style="width: 40%" class="preview-panel background">
              <lemma-detail v-if="selectedLemma !== null" :value="selectedLemma" />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import store from '@/store'
import _ from 'lodash'
import LemmaDetail from './LemmaManager/LemmaDetail.vue'

@Component({
  components: {
    LemmaDetail
  }
})
export default class GlobalSearch extends Vue {

  @Prop({ default: false }) value!: boolean
  selectedResult = 0
  searchText = ''

  get selectedLemma() {
    return this.results[this.selectedResult] || null
  }

  async selectResult(dir: 1|-1) {
    if (dir === -1) {
      this.selectedResult = Math.max(this.selectedResult - 1, 0)
    } else {
      this.selectedResult = Math.min(this.selectedResult + 1, this.results.length - 1)
    }
    await this.$nextTick();
    (this.$refs.list as Vue).$el.scrollBy({top: 50 * dir, behavior: 'smooth'})
  }

  @Watch('value')
  async onChangeVisibility() {
    await this.$nextTick()
    if (this.$refs.input instanceof HTMLInputElement) {
      await this.$nextTick()
      this.$refs.input.focus()
      this.$refs.input.select()
    }
  }

  onEsc() {
    if (this.searchText !== '') {
      this.searchText = ''
    } else {
      this.$emit('input', false)
    }
  }

  get results() {
    console.time('search')
    const sts = this.searchText.split(' ').map(s => s.toLowerCase().replaceAll('*', ''))
    const r = _(store.lemma.lemmaSearchIndex).filter((s) => {
      return sts.every(st => s.searchIndex.includes(st))
    }).take(40).value()
    console.timeEnd('search')
    return r
  }

}
</script>
<style lang="stylus" scoped>
.global-search
  font-size: 1.7em
  width: 100%
  outline: 0
</style>
<style lang="stylus">
.theme--dark .global-search
  color white
</style>
