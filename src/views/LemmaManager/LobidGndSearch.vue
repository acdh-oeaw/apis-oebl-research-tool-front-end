<template>
  <div tabindex="-1" @keyup.esc="$emit('cancel')">
    <text-field
      @input="debouncedSearchGnd"
      v-model="localLemma.firstName"
      :label="lemmaRowTranslations.firstName.de">
    </text-field>
    <text-field
      @input="debouncedSearchGnd"
      v-model="localLemma.lastName"
      :label="lemmaRowTranslations.lastName.de">
    </text-field>
    <text-field
      :value="localValue.length > 0 ? localValue[0] : ''"
      @input="useCustomGnd($event)"
      placeholder="manuell wählen…"
      :label="lemmaRowTranslations.gnd.de"
      :color="undefined"
      >
    </text-field>
    <div class="results pt-3">
      <v-overlay
        v-if="loading"
        absolute>
        <loading-spinner
          :color="$vuetify.theme.dark ? 'white' : undefined" />
      </v-overlay>
      <lobid-preview-card
        v-if="resultGnds.length !== 0"
        @input="onSelectGnd"
        :value="localValue"
        :gnd="resultGnds" />
      <div
        v-else
        style="opacity: .7"
        class="caption text-center">
        (Nichts gefunden)
      </div>
    </div>
    <div class="background mt-3 pb-3" style="position: sticky; bottom: 0">
      <v-btn
        @click="$emit('input', localValue)"
        color="secondary"
        class="mb-2 rounded-lg"
        block
        elevation="0">
        {{ localValue.length > 0 ? 'Auswahl speichern' : 'Zurücksetzten'}}
      </v-btn>
      <v-btn
        @click="$emit('cancel')"
        color="background darken-2"
        class="rounded-lg"
        block
        elevation="0">
        abbrechen
      </v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { LemmaRow } from '@/types/lemma'
import { clone, debounce } from 'lodash'
import { findPerson } from '@/service/lobid'
import LobidPreviewCard from './LobidPreviewCard.vue'
import LoadingSpinner from '@/views/lib/LoadingSpinner.vue'
import TextField from '@/views/lib/TextField.vue'
import { lemmaRowTranslations } from '../../util/labels';

@Component({
  components: {
    LobidPreviewCard,
    LoadingSpinner,
    TextField
  }
})
export default class LobidGndSearch extends Vue {

  @Prop({ required: true, }) lemma!: LemmaRow;
  @Prop({ default: () => [], }) gnd!: string[];
  @Prop({ default: Array, }) value!: string[];
  lemmaRowTranslations = lemmaRowTranslations;


  loading = false
  localLemma: LemmaRow = clone(this.lemma)
  localValue: string[] = clone(this.value)
  debouncedSearchGnd = debounce(this.searchGnd, 150)
  resultGnds: string[] = []

  @Watch('value', { immediate: true })
  onChangeValue() {
    this.localValue = this.value;
  }

  onSelectGnd(gnds: string[]) {
    this.localValue = gnds;
  }

  saveGnd(gnd: string) {;
    this.$emit('input', gnd)
  }

  @Watch('gnd', { immediate: true, deep: true })
  onChangeGnd(g: string[]) {
    this.resultGnds = clone(g)
  }

  @Watch('lemma', { immediate: true, deep: true })
  onChangeLemma() {
    this.localLemma = clone(this.lemma)
  }

  useCustomGnd(gnd: string|null) {
    if (gnd === null) {
      return;
    }
    const normalizedGND = gnd.trim();

    if (normalizedGND === '') {
      return;
    }
      this.resultGnds = [ gnd, ];
  }

  async searchGnd() {
    this.loading = true
    this.resultGnds = (await findPerson({
      firstName: this.localLemma!.firstName ?? null,
      lastName: this.localLemma!.lastName,
      dateOfBirth: null,
      dateOfDeath: null,
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
