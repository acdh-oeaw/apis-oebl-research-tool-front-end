<template>
  <div>
    <v-dialog
      overlay-color="black"
      :overlay-opacity="$vuetify.theme.dark ? '.8' : '.5'"
      transition="fade-transition"
      max-width="1000"
      content-class="elevation-0"
      :value="value"
      @input="$emit('input', $event)">
      <v-card class="pa-0 rounded-lg" color="transparent" v-if="value" flat>
        <v-card-title class="pa-0 background rounded-tl-lg rounded-tr-lg d-flex flex-nowrap">
          <v-icon style="opacity: .5" class="ml-3" large>mdi-magnify</v-icon>
          <input
            @keydown.down.prevent="selectResult(1)"
            @keydown.up.prevent="selectResult(-1)"
            @keydown.esc.capture.prevent.stop="onEsc"
            v-model="searchText"
            @input="onInput"
            ref="input"
            class="pl-2 py-4 rounded-lg global-search"
            placeholder="Suchen…"
            type="text" />
        </v-card-title>
        <v-card-text class="overflow-hidden pa-0" style="height: 450px; position: relative; background: transparent">
          <v-divider />
          <div v-if="searchText !== ''" class="d-flex flex-row rounded-bl-lg rounded-br-lg background darken-2 fill-height">
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
                <v-list-item-action-text style="white-space: nowrap; overflow: hidden; max-width: 40%">
                  {{ Object.values(result.columns_user).join(', ') }}
                </v-list-item-action-text>
              </v-list-item>
            </v-list>
            <div style="width: 40%" class="preview-panel background">
              <lemma-detail
                @update="updateLemma"
                v-if="selectedLemma !== null"
                :value="selectedLemma" />
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
import { LemmaRow } from '@/types/lemma'

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

  updateLemma(u: Partial<LemmaRow>) {
    if (this.selectedLemma !== null) {
      store.lemma.updateLemmas([ this.selectedLemma ], u)
    }
  }

  async resetScroll() {
    await this.$nextTick()
    if (this.$refs.list instanceof Vue) {
      (this.$refs.list as Vue).$el.scrollTop = 0
    }
  }

  async onInput() {
    this.selectedResult = 0
    this.resetScroll()
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
    const r = _(store.lemma.allLemmas)
      .filter((l, i) => {
        const searchIndex = `${l.firstName}|||${l.lastName}|||${l.birthYear}|||${l.deathYear}|||${Object.values(l.columns_user)}`.toLowerCase()
        return sts.every(st => searchIndex.includes(st))
      })
      .take(40)
      .value()
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
