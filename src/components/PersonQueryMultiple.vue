<template>
  <v-container fill-height class="align-stretch">
    <v-row style="height: 20%; overflow: auto" class="flex-shrink-1">
      <v-col cols="3">
        <v-text-field v-model="eMail" label="E-Mail Adresse" type="email" />
      </v-col>
      <v-col cols="3" class="text-">
        <v-select
          label="Filter"
          v-model="selectedFilter"
          return-object
          item-value="value"
          :item-text="(i) => i.text + ' (' + searchTable.filter(i.filter).length + ')'"
          :items="filterOpts" />
      </v-col>
      <v-col class="text-right px-0" cols="6">
        <v-btn elevation="0" color="primary" @click="sendMatches">
          {{ searchTable.filter(r => r.candidateSelected > -1).length }} von {{searchTable.length}} Personen Abfragen
        </v-btn>
      </v-col>
      <v-col cols="12" class="text-center">
        <div class="caption grey--text">
          {{ searchTable.filter(r => r.candidateSelected > -1).length }} gefunden,
          {{ searchTable.filter(r => r.loaded === true && r.lobid.length === 0).length }} nicht gefunden,
          {{ searchTable.filter(r => (r.candidateSelected === -1 && r.lobid.length > 1)).length }} mehrdeutig
          (von {{ searchTable.length }})
        </div>
        <v-progress-linear
          class="px-0"
          color="green"
          :stream="true"
          :buffer-value="progress[0]"
          :value="progress[1]" />
      </v-col>
    </v-row>
    <v-divider />
    <v-row class="flex-shrink-0" style="position: relative; height: 80%">
      <v-container class="fill-height pa-0">
        <v-row class="fill-height">
          <v-col style="position: relative" class="fill-height pa-0 px-3">
            <RecycleScroller
              class="scroller fill-height v-list--nav"
              :items="searchTableFiltered"
              key-field="id"
              :item-size="60">
              <template v-slot="{ item }">
                <research-person-item
                  @click="showPersonDetail(item.id)"
                  :selected="item.id === selectedPersonId"
                  class="rounded"
                  :key="item.id"
                  :item="item" />
              </template>
            </RecycleScroller>
          </v-col>
          <v-col class="fill-height py-0" cols="5">
            <v-card class="fill-height d-flex flex-column rounded-lg" scrollable rounded elevation="0">
              <v-card-title class="pb-0">
                <v-subheader>Eingabe</v-subheader>
                <search-person-detail
                  class="pl-5"
                  :fields="allowedPersonFields"
                  :value="selectedPerson"
                  @change="searchResultPersonDebounced($event)"
                />
                <v-subheader>
                  Ergebnisse ({{ selectedPerson.lobid.length }})
                </v-subheader>
                <v-spacer />
                <v-btn
                  color="red"
                  small
                  rounded
                  text
                  v-if="selectedPerson.candidateSelected > -1"
                  @click="selectedPerson.candidateSelected = -1"
                  elevation="0">
                  nichts auswählen
                </v-btn>
              </v-card-title>
              <v-divider />
              <v-card-text style="overflow: auto">
                <v-list nav v-if="searchingLobidPerson === false">
                  <lobid-list-item
                    v-for="(person, i) in selectedPerson.lobid"
                    :show-action="true"
                    @click="selectLobidPerson(selectedPersonId, i)"
                    :selected="i === selectedPerson.candidateSelected"
                    :key="person.id"
                    :person="person" />
                </v-list>
                <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-avatar-three-line" v-else>
                </v-skeleton-loader>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { RecycleScroller } from 'vue-virtual-scroller'
import LobidListItem from './LobidListItem.vue'
import ResearchPersonItem from './ResearchPersonItem.vue'
import SearchPersonDetail from './SearchPersonDetail.vue'
import _ from 'lodash'
import * as lobid from '../service/lobid'
import { saveAs } from 'file-saver'
import { PersonField, PersonMatchable } from '@/types'

@Component({
  components: {
    LobidListItem, SearchPersonDetail, ResearchPersonItem, RecycleScroller
  }
})
export default class PersonQueryMultiple extends Vue {

  @Prop() allowedPersonFields: PersonField[]
  @Prop({ default: [] }) searchTable: PersonMatchable[]
  selectedFilter = this.filterOpts[0]
  selectedPersonId = '1'
  searchResultPersonDebounced = _.debounce(this.searchResultPerson, 300)
  searchingLobidPerson = false
  eMail = ''
  // the ones that have been loaded and the ones that have exactly one
  get progress(): [number, number] {
    const loaded = this.searchTable.filter(r => r.loaded).length / this.searchTable.length * 100
    const selected = this.searchTable.filter(r => r.candidateSelected > -1).length / this.searchTable.length * 100
    return [loaded, selected]
  }

  get filterOpts(): Array<{text: string, value: string, filter: (e: PersonMatchable) => boolean}> {
    return [
      {
        text: 'alle',
        value: 'all',
        filter: () => true
      },
      {
        text: 'nicht gefunden',
        value: 'not found',
        filter: (e: PersonMatchable) => e.lobid.length === 0 && e.loaded === true
      },
      {
        text: 'ambig',
        value: 'ambiguous',
        filter: (e: PersonMatchable) => e.lobid.length > 1
      },
      {
        text: 'disambiguiert',
        value: 'found',
        filter: (e: PersonMatchable) => e.lobid.length === 1 || e.candidateSelected > -1
      }
    ]
  }

  get selectedPerson(): PersonMatchable {
    const i = this.findIndexById(this.selectedPersonId)
    return this.searchTableFiltered[i]
  }

  get searchTableFiltered(): PersonMatchable[] {
    return this.searchTable.filter(this.selectedFilter.filter)
  }

  showPersonDetail(i: string): void {
    console.log(document.activeElement)
    this.selectedPersonId = i
  }

  async searchResultPerson(person: PersonMatchable): Promise<void> {
    this.searchingLobidPerson = true
    const res = await lobid.findPerson(person) || []
    this.searchTableFiltered[this.findIndexById(person.id)].lobid = res
    this.searchingLobidPerson = false
  }

  selectLobidPerson(personId: string, lobidPersonIndex: number): void {
    const i = this.findIndexById(personId)
    this.searchTable[i].candidateSelected = lobidPersonIndex
  }

  sendMatches(): void {
    const res = this.searchTable
      .filter(p => p.candidateSelected > -1)
      .map(p => {
        return {
          firstName: p.firstName,
          lastName: p.lastName,
          gnd: (p.lobid[p.candidateSelected] as any).gndIdentifier as string
        }
      })
    console.log(res)
    saveAs(new Blob([JSON.stringify({email: this.eMail, lemmas: res}, undefined, 4)]), 'research-list-matched.json')
  }

  findIndexById(id: string): number {
    return this.searchTableFiltered.findIndex(r => r.id === id)
  }

  mounted() {
    
  }
}
</script>
<style lang="scss" scoped>
</style>
