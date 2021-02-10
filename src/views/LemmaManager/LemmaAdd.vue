<template>
  <v-card min-height="800" :color="color" rounded="lg">
    <v-card-title class="text-center text-caption">
      <v-spacer />
      Lemma hinzufügen
      <v-spacer />
    </v-card-title>
    <!-- <v-divider /> -->
    <v-card-text>
      <v-text-field
        autofocus
        solo
        flat
        hide-details
        background-color="background darken-2"
        class="text-body-2 textarea pb-1 rounded-lg"
        @input="searchPerson"
        v-model="person.firstName">
        <template v-slot:prepend-inner>
          <span style="opacity: .7" class="caption">
            Vorname
          </span>
        </template>
      </v-text-field>
      <v-text-field
        solo
        flat
        hide-details
        background-color="background darken-2"
        class="text-body-2 textarea pb-1 rounded-lg"
        @input="searchPerson"
        v-model="person.lastName">
        <template v-slot:prepend-inner>
          <span style="opacity: .7" class="caption">
            Nachname
          </span>
        </template>
      </v-text-field>
      <v-text-field
        solo
        flat
        hide-details
        background-color="background darken-2"
        class="text-body-2 textarea pb-1 rounded-lg"
        placeholder="YYYY"
        @input="searchPerson"
        v-model="person.dateOfBirth">
        <template v-slot:prepend-inner>
          <span style="opacity: .7" class="caption">
            Geburtsjahr
          </span>
        </template>
      </v-text-field>
      <v-text-field
        solo
        flat
        hide-details
        background-color="background darken-2"
        class="text-body-2 textarea pb-1 rounded-lg"
        @input="searchPerson"
        placeholder="YYYY"
        v-model="person.dateOfDeath">
        <template v-slot:prepend-inner>
          <span style="opacity: .7" class="caption">
            Sterbejahr
          </span>
        </template>
      </v-text-field>
      <!-- alle default fields für ein lemma -->
      <!-- automatische GND suche via LOBID -->
      <!-- automatisch alle bestehenden lemmata mit Furry/Levensthein durchsuchen und als vorschläge ausgeben -->
      <lobid-preview-card
        style="height: 400px; overflow: scroll"
        :cols="2"
        @input="log"
        :gnd="possibleGnds" />
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-btn @click="$emit('cancel')" class="rounded-lg" color="background darken-2" elevation="0">
        Abbrechen
      </v-btn>
      <v-spacer />
      <v-btn @click="addLemma" class="rounded-lg" color="primary" elevation="0">
        Lemma hinzufügen
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import confirm from '../../store/confirm'
import { findPerson } from '@/service/lobid'
import { ImportablePerson } from '@/types/lemma'
import LobidPreviewCard from './LobidPreviewCard.vue'
import _ from 'lodash'

@Component({
  components: {
    LobidPreviewCard
  }
})
export default class LemmaAdd extends Vue {

  @Prop({ default: undefined }) color!: string|undefined

  possibleGnds: string[] = []
  person: ImportablePerson = {
    firstName: null,
    lastName: null,
    dateOfBirth: null,
    dateOfDeath: null,
    gnd: []
  }

  log = console.log

  searchPerson = _.debounce(this.onChangePerson, 300)

  async addLemma() {
    this.$emit('confirm', this.person)
  }

  async onChangePerson() {
    this.possibleGnds = (await findPerson(this.person)).map(p => (p as any).gndIdentifier)
  }

}
</script>
<style lang="scss" scoped>
</style>
