<template>
  <div>
    <v-text-field
      background-color="background darken-2"
      class="text-body-2 mb-1"
      @keyup="debouncedSearchGnd"
      v-model="localLemma.firstName"
      placeholder="Vorname"
      solo
      flat
      dense
      hide-details>
      <template v-slot:prepend-inner>
        <span style="opacity: .7" class="caption">Vorname</span>
      </template>
    </v-text-field>
    <v-text-field
      background-color="background darken-2"
      class="text-body-2 mb-1"
      @keyup="debouncedSearchGnd"
      v-model="localLemma.lastName"
      placeholder="Nachname"
      solo
      flat
      dense
      hide-details>
      <template v-slot:prepend-inner>
        <span style="opacity: .7" class="caption">Nachname</span>
      </template>
    </v-text-field>
    <v-text-field
      background-color="background darken-2"
      class="text-body-2 mb-1"
      v-model="selectedGnd"
      @keyup="useCustomGnd"
      placeholder="manuell wählen…"
      solo
      flat
      dense
      hide-details>
      <template v-slot:prepend-inner>
        <span style="opacity: .7" class="caption">GND</span>
      </template>
    </v-text-field>
    <div class="results pt-3">
      <v-overlay absolute v-if="loading"><loading-spinner /></v-overlay>
      <lobid-preview-card v-if="resultGnds.length !== 0" @input="onSelectGnd" :gnd="resultGnds" />
      <div v-else style="opacity: .7" class="caption text-center">(Nichts gefunden)</div>
    </div>
    <div class="background mt-3 pb-3" style="position: sticky; bottom: 0">
      <v-btn @click="$emit('input', selectedGnd)" class="background lighten-2 mb-2" block elevation="0">{{ selectedGnd !== null ? 'Auswahl speichern' : 'Zurücksetzten'}}</v-btn>
      <v-btn @click="$emit('cancel')" class="background lighten-1" block elevation="0">abbrechen</v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { LemmaRow } from '@/types/lemma'
import _, { clone } from 'lodash'
import { findPerson } from '@/service/lobid'
import LobidPreviewCard from './LobidPreviewCard.vue'
import LoadingSpinner from '@/views/lib/LoadingSpinner.vue'

@Component({
  components: {
    LobidPreviewCard,
    LoadingSpinner
  }
})
export default class LobidGndSearch extends Vue {

  @Prop({ required: true }) lemma!: LemmaRow
  @Prop({ default: () => [] }) gnd!: string[]

  loading = false
  selectedGnd: string|null = null
  localLemma: LemmaRow = clone(this.lemma)
  debouncedSearchGnd = _.debounce(this.searchGnd, 150)
  resultGnds: string[] = []

  onSelectGnd(gnd: string|null) {
    this.selectedGnd = gnd
  }

  saveGnd(gnd: string) {
    this.$emit('input', gnd)
  }

  @Watch('gnd', { immediate: true, deep: true })
  onChangeGnd(g: string[]) {
    this.resultGnds = clone(g)
  }

  @Watch('lemma', { immediate: true, deep: true })
  onChangeLemma() {
    console.log('changed')
    this.localLemma = clone(this.lemma)
  }

  useCustomGnd(gnd: string|null) {
    if (gnd !== null && gnd.trim() !== '') {
      this.resultGnds = [ gnd ]
    }
  }

  async searchGnd() {
    this.loading = true
    this.resultGnds = (await findPerson({
      firstName: this.localLemma!.firstName,
      lastName: this.localLemma!.lastName,
      dateOfBirth: null,
      dateOfDeath: null,
      placeOfBirth: null,
      placeOfDeath: null,
      gnd: this.localLemma!.gnd
    })).map((l: any) => l.gndIdentifier)
    this.loading = false
  }

}
</script>
<style lang="stylus" scoped>
.results
  position: relative;
</style>
