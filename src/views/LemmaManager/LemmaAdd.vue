<template>
  <v-card :color="color" rounded="lg" class="soft-shadow">
    <v-card-title>
      <v-row no-gutters>
        <v-col>
          <v-btn @click="$emit('cancel')" class="rounded-lg px-4" color="background darken-1" elevation="0">
            Abbrechen
          </v-btn>
        </v-col>
        <v-col class="text-center">
          Lemma anlegen
        </v-col>
        <v-col class="text-right">
          <v-btn @click="addLemma" class="rounded-lg px-4" color="primary" elevation="0">
            Lemma hinzufügen
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider :style="{ opacity: showDivider ? 1 : 0, transition: '.5s opacity' }" />
    <v-card-text class="pa-0 flex-grow-1 overflow-y-hidden fill-height">
      <v-row no-gutters class="fill-height">
        <v-col @scroll.passive="onScroll" class="pa-5 fill-height overflow-y-auto">
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
          <h4 class="py-4 px-1">Zur Liste hinzufügen</h4>
          <v-select
            solo
            background-color="background darken-2"
            dense
            hide-details
            flat
            class="text-body-2"
            :items="lemmaLists"
            v-model="importToList">
            <template v-slot:prepend-inner>
              <div style="opacity: .7" class="caption pr-2">Liste</div>
            </template>
          </v-select>
          <h4 class="py-4 px-1">Erweiterte Daten</h4>
          <text-field
            v-for="column in store.lemma.getAllUserColumns(store.lemma.lemmas)"
            :key="column.value"
            :label="column.name"
          />
        </v-col>
        <v-col cols="5" class="background darken-1 pa-4 fill-height overflow-y-hidden">
          <v-window reverse class="pt-1 fill-height" :value="viewLemmaDetail === null ? 0 : 1">
            <v-window-item class="fill-height" :value="0">
              <div class="d-flex flex-column fill-height">
                <v-btn-toggle :value="window" borderless style="width: 50%" class="mb-4">
                  <v-btn rounded small @click="window = 0" block elevation="0" color="background darken-2">
                    ÖBL <v-badge offset-x="-3" color="secondary" v-if="filteredList.length > 0" :content="filteredList.length.toString()" />
                  </v-btn>
                  <v-btn rounded small @click="window = 1" block elevation="0" color="background darken-2">
                    GND-Suche <v-badge offset-x="-3" color="secondary" v-if="possibleGnds.length > 0" :content="possibleGnds.length.toString()" />
                  </v-btn>
                </v-btn-toggle>
                <v-window class="flex-grow-1 fill-height" reverse :value="window">
                  <v-window-item class="fill-height">
                    <v-overlay
                      v-if="filteredList.length === 0"
                      absolute
                      light
                      style="color: #333"
                      color="background darken-1"
                      >
                      Keine ähnlichen Lemmata gefunden
                    </v-overlay>
                    <v-list
                      dense
                      class="overflow-y-auto fill-height"
                      color="transparent">
                      <v-list-item
                        class="rounded-lg"
                        v-for="lemma in filteredList"
                        :key="lemma.id"
                        dense
                        @click="viewLemmaDetail = lemma">
                        <v-list-item-avatar width="15">
                          <span v-if="lemma.selected === true" style="color: var(--v-primary-base)">★</span>
                          <span v-else style="opacity: .5">☆</span>
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
                  <v-window-item class="fill-height">
                    <lobid-preview-card
                      class="fill-height overflow-y-auto"
                      @input="person.gnd = $event"
                      :gnd="possibleGnds" />
                    <v-overlay v-if="possibleGnds.length === 0" absolute>Keine GNDs bei Lobid gefunden</v-overlay>
                  </v-window-item>
                </v-window>
              </div>
            </v-window-item>
            <v-window-item class="fill-height" :value="1">
              <div class="d-flex flex-column fill-height">
                <v-btn @click="viewLemmaDetail = null" text><v-icon left>mdi-chevron-left</v-icon> Ergebnisse</v-btn>
                <lemma-detail class="flex-grow-1 fill-height background" v-if="viewLemmaDetail !== null" :value="viewLemmaDetail" />
              </div>
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
    </v-card-text>
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

  importToList: number = store.lemma.selectedLemmaListId || store.lemma.lemmaLists[0].id!
  window = 0
  showDivider = false
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

  onScroll(e: MouseEvent) {
    if (e.target instanceof HTMLElement && e.target.scrollTop > 0) {
      this.showDivider = true
    } else {
      this.showDivider = false
    }
  }

  person: ImportablePerson = this.emptyPerson

  log = console.log

  searchPerson = _.debounce(this.onChangePerson, 500)

  get lemmaLists() {
    return this.store.lemma.lemmaLists.map(ll => {
      return {
        text: ll.title,
        value: ll.id
      }
    })
  }

  get filteredList() {
    return store.lemma.lemmas.filter((l) => {
      return l.firstName.toLowerCase().startsWith(this.person.firstName?.toLowerCase() || '~') || l.lastName.toLowerCase().startsWith(this.person.lastName?.toLowerCase() || '~')
    })
  }

  async addLemma() {
    this.$emit('confirm', this.person, this.importToList)
  }

  async onChangePerson() {
    this.possibleGnds = (await findPerson(this.person)).map(p => (p as any).gndIdentifier)
  }

}
</script>
<style lang="scss" scoped>
</style>
