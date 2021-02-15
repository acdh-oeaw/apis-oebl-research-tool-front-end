<template>
  <v-card :color="color" rounded="lg" class="soft-shadow">
    <v-card-title class="text-center text-caption">
      <v-spacer />
      Lemma hinzufügen
      <v-spacer />
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-0">
      <v-row no-gutters>
        <v-col style="height: 500px; overflow: scroll" class="pa-5">
          <h4 class="pb-4 px-1">Basisdaten</h4>
          <text-field
            autofocus
            label="Vorname"
            v-model="person.firstName"
            @input="searchPerson"
          />
          <text-field
            label="Nachname"
            v-model="person.lastName"
            @input="searchPerson"
          />
          <text-field
            label="Geburtsjahr"
            v-model="person.dateOfBirth"
            @input="searchPerson"
          />
          <text-field
            label="Sterbejahr"
            v-model="person.dateOfDeath"
            @input="searchPerson"
          />
          <text-field
            label="GND"
            v-model="person.gnd"
          />
          <h4 class="py-4 px-1">Erweiterte Daten</h4>
          <text-field
            v-for="column in store.lemma.getAllUserColumns(store.lemma.lemmas)"
            :key="column.value"
            :label="column.name"
          />
        </v-col>
        <v-col cols="5" class="background darken-1 pa-5" style="height: 500px; position: relative;">
          <v-window reverse :value="viewLemmaDetail === null ? 0 : 1">
            <v-window-item :value="0">
              <v-btn-toggle borderless style="width: 50%" class="mb-4">
                <v-btn rounded small @click="window = 0" block elevation="0" color="background darken-2">
                  ÖBL <v-badge offset-x="-3" color="secondary" v-if="filteredList.length > 0" :content="filteredList.length.toString()" />
                </v-btn>
                <v-btn rounded small @click="window = 1" block elevation="0" color="background darken-2">
                  Lobid <v-badge offset-x="-3" color="secondary" v-if="possibleGnds.length > 0" :content="possibleGnds.length.toString()" />
                </v-btn>
              </v-btn-toggle>
              <v-window reverse :value="window">
                <v-window-item style="position: relative">
                  <v-overlay v-if="filteredList.length === 0" absolute>Keine Ähnlichen Lemmata gefunden</v-overlay>
                  <v-list
                    dense
                    style="overflow: scroll; height: 400px"
                    color="transparent">
                    <v-list-item
                      class="rounded-lg"
                      v-for="lemma in filteredList"
                      :key="lemma.id"
                      dense
                      @click="viewLemmaDetail = lemma">
                      <v-list-item-avatar width="15">
                        <v-icon small v-if="lemma.selected" color="primary">mdi-star</v-icon>
                        <v-icon small v-else>mdi-star-outline</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ lemma.firstName }} {{ lemma.lastName }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ lemma.birthYear }} - {{ lemma.deathYear }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-window-item>
                <v-window-item class="position: relative">
                  <lobid-preview-card
                    style="overflow: scroll; height: 400px"
                    @input="person.gnd = $event"
                    :gnd="possibleGnds" />
                  <v-overlay v-if="possibleGnds.length === 0" absolute>Keine GNDs bei Lobid gefunden</v-overlay>
                </v-window-item>
              </v-window>
            </v-window-item>
            <v-window-item :value="1">
              <v-btn @click="viewLemmaDetail = null" text><v-icon left>mdi-chevron-left</v-icon> Ergebnisse</v-btn>
              <lemma-detail style="overflow: scroll; height: 450px" v-if="viewLemmaDetail !== null" :value="viewLemmaDetail" />
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
      <!-- alle default fields für ein lemma -->
      <!-- automatische GND suche via LOBID -->
      <!-- automatisch alle bestehenden lemmata mit Furry/Levensthein durchsuchen und als vorschläge ausgeben -->
    </v-card-text>
    <!-- <v-divider /> -->
    <v-card-actions class="pa-4 background lighten-2">
      <v-btn @click="$emit('cancel')" class="rounded-lg px-4" color="background lighten-1" elevation="0">
        Abbrechen
      </v-btn>
      <v-spacer />
      <v-btn @click="addLemma" class="rounded-lg px-4" color="primary" elevation="0">
        Lemma hinzufügen
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import confirm from '../../store/confirm'
import { findPerson } from '@/service/lobid'
import { ImportablePerson, LemmaRow } from '@/types/lemma'
import LobidPreviewCard from './LobidPreviewCard.vue'
import LemmaDetail from './LemmaDetail.vue'
import TextField from '../lib/TextField.vue'
import store from '@/store'
import _ from 'lodash'

@Component({
  components: {
    LobidPreviewCard,
    TextField,
    LemmaDetail
  }
})
export default class LemmaAdd extends Vue {

  @Prop({ default: undefined }) color!: string|undefined
  window = 0
  store = store
  possibleGnds: string[] = []
  viewLemmaDetail: LemmaRow|null = null
  emptyPerson = {
    firstName: null,
    lastName: null,
    dateOfBirth: null,
    dateOfDeath: null,
    gnd: []
  }

  person: ImportablePerson = this.emptyPerson

  log = console.log

  searchPerson = _.debounce(this.onChangePerson, 500)

  get filteredList() {
    return store.lemma.lemmas.filter((l) => {
      return l.firstName.toLowerCase().startsWith(this.person.firstName?.toLowerCase() || '~') || l.lastName.toLowerCase().startsWith(this.person.lastName?.toLowerCase() || '~')
    })
  }

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
