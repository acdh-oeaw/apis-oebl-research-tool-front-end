<template>
  <v-container fill-height class="align-stretch">
    <v-dialog v-model="showColumnMatcher" scrollable max-width="1000px">
      <column-matcher
        v-if="file !== null"
        :target-columns="allowedPersonFields"
        @cancel="showColumnMatcher = false"
        @confirm="loadTable"
        :file-type="file.type"
        :file-name="file.name"
        :buffer="fileBuffer" />
    </v-dialog>
    <v-row v-if="searchTable.length === 0" class="pa-3">
      <v-col cols="6">
        <v-card rounded="lg" elevation="0">
          <v-form
            @input="log"
            class="pa-5">
            <v-row>
              <v-col>
                <v-text-field
                  autofocus
                  dense
                  clearable
                  autocomplete="off"
                  @keydown.down.prevent="focusNextOfClass(personListElementClass)"
                  @keydown.up.prevent="focusPrevOfClass(personListElementClass)"
                  hide-details
                  @input="searchPersonDebounced(searchSinglePerson)"
                  v-model="searchSinglePerson.firstName"
                  required
                  label="Name" />
              </v-col>
              <v-col>
                <v-select
                  dense
                  hide-details
                  required
                  label="Berufsfeld"
                  :items="[ 'Politik und Verwaltung' ]"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <date-picker
                  type="year"
                  dense
                  label="Geburtsdatum"
                  @input="searchPersonDebounced(searchSinglePerson)"
                  :v-model="searchSinglePerson.dateOfBirth" />
              </v-col>
              <v-col>
                <date-picker
                  type="year"
                  dense
                  label="Sterbedatum"
                  @input="searchPersonDebounced(searchSinglePerson)"
                  :v-model="searchSinglePerson.dateOfDeath"
                  />
              </v-col>
            </v-row>
            <v-text-field
              dense
              label="GND oder Gideon ID" />
          </v-form>
        </v-card>
        <div class="pa-3 text-center grey--text">
          oder
        </div>
        <v-card rounded="lg" elevation="0" class="pa-4">
          <v-file-input
            accept="text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            dense
            chips
            small-chips
            hide-details
            clearable
            show-size
            @change="updateFile"
            label="CSV oder Excel Datei" />
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-list
          class="rounded-lg"
          nav
          avatar
          three-line>
          <lobid-list-item
            v-for="result in results"
            :key="result.id"
            :person="result"
            :class="personListElementClass" />
        </v-list>
      </v-col>
    </v-row>
    <template v-else>
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
        <v-col class="text-right" cols="6">
          <v-btn elevation="0" color="primary" @click="sendMatches">
            {{ searchTable.filter(r => r.candidateSelected > -1).length }} von {{searchTable.length}} Personen Abfragen
          </v-btn>
        </v-col>
        <v-col cols="12" class="text-center">
          <div class="caption grey--text">
            {{ searchTable.filter(r => r.candidateSelected > -1).length }}
            von {{ searchTable.length }} gefunden,
            {{ searchTable.filter(r => (r.candidateSelected === -1 && r.lobid.length > 1)).length }} mehrdeutig.
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
              <v-virtual-scroll
                class="fill-height v-list--nav"
                :bench="1"
                :item-height="60"
                @keydown.down.prevent="focusNextOfClass(personListElementClass)"
                @keydown.up.prevent="focusPrevOfClass(personListElementClass)"
                :items="searchTableFiltered">
                <template v-slot="{ item }">
                  <v-list-item
                    :key="item.id"
                    tabindex="-1"
                    @keydown.down.prevent="focusNextOfClass(personListElementClass)"
                    @keydown.up.prevent="focusPrevOfClass(personListElementClass)"
                    :input-value="item.id === selectedPersonId"
                    :class="[personListElementClass, 'rounded']"
                    @click="showPersonDetail(item.id)">
                    <v-list-item-avatar>
                      <template v-if="item.lobid && item.lobid.length > 0">
                        <v-img v-if="item.lobid[0].depiction && item.lobid[0].depiction[0]" :src="item.lobid[0].depiction[0].thumbnail" />
                        <v-img v-else src="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" />
                      </template>
                      <template v-else>
                        <v-icon color="grey">mdi-close</v-icon>
                      </template>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title v-if="item.lobid && item.lobid.length > 0">
                        {{ item.lobid[0].preferredName }}
                        ({{ item.lobid[0].dateOfBirth ? item.lobid[0].dateOfBirth[0] : '?' }}
                          {{ item.lobid[0].placeOfBirth ? 'in ' + item.lobid[0].placeOfBirth[0].label : '' }}
                          —
                          {{ item.lobid[0].dateOfDeath ? item.lobid[0].dateOfDeath[0] : '?' }}
                          {{ item.lobid[0].placeOfDeath ? 'in ' + item.lobid[0].placeOfDeath[0].label : '' }})
                      </v-list-item-title>
                      <v-list-item-title v-else>
                        {{ item.firstName }} {{ item.lastName }}
                      </v-list-item-title>
                      <v-list-item-subtitle v-if="item.lobid && item.lobid.length > 0">
                        <span v-if="item.lobid[0].biographicalOrHistoricalInformation"> {{ item.lobid[0].biographicalOrHistoricalInformation[0] }}</span>
                        <span v-if="item.lobid[0].placeOfActivity">; Wirkungsorte:
                          <span v-for="place in item.lobid[0].placeOfActivity" :key="place.id">
                            {{ place.label }}
                          </span>
                        </span>
                      </v-list-item-subtitle>
                      <v-list-item-subtitle v-else>
                        (not found)
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-badge
                        overlap
                        :value="item.lobid.length > 0"
                        :color="item.candidateSelected > -1 ? 'green' : 'red'"
                        :content="item.lobid.length">
                        <v-icon v-if="item.candidateSelected === -1 && item.lobid.length === 1">mdi-account-outline</v-icon>
                        <v-icon v-else-if="item.candidateSelected > -1" color="green">mdi-check</v-icon>
                        <v-icon v-else-if="item.lobid.length > 1">mdi-account-group-outline</v-icon>
                      </v-badge>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </v-virtual-scroll>
            </v-col>
            <v-col class="fill-height py-0" cols="5">
              <v-card class="fill-height d-flex flex-column rounded-lg" scrollable rounded elevation="0">
                <v-card-title class="pb-0">
                  <v-subheader>Eingabe</v-subheader>
                  <search-person-detail
                    class="pl-5"
                    :fields="allowedPersonFields"
                    :value="selectedPerson"
                    @change="searchPersonDebounced($event)"
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
                  <v-list nav v-if="searchingPerson === false">
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
    </template>
  </v-container>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import DatePicker from './DatePicker.vue'
import ColumnMatcher from './ColumnMatcher.vue'
import LobidListItem from './LobidListItem.vue'
import SearchPersonDetail from './SearchPersonDetail.vue'
import { Person as LdPerson } from 'schema-dts'
import { Table, Person, PersonMatchable, PersonField } from '../types'
import * as lobid from '../service/lobid'
import { saveAs } from 'file-saver'

import _ from 'lodash'

@Component({
  components: {
    DatePicker,
    LobidListItem,
    ColumnMatcher,
    SearchPersonDetail
  }
})
export default class PersonQuery extends Vue {

  fileBuffer: ArrayBuffer|null = null
  file: File|null = null
  log = console.log
  personListElementClass = 'person-result'
  searchingPerson = false
  searchSinglePerson: Person = {
    firstName: null,
    lastName: null,
    dateOfBirth: null,
    dateOfDeath: null,
    placeOfBirth: null,
    placeOfDeath: null,
    gnd: null
  }

  eMail = ''
  searchPersonDebounced = _.debounce(this.searchPerson, 300)
  results: LdPerson[] = []
  showColumnMatcher = false

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

  selectedFilter = this.filterOpts[0]
  searchTable: PersonMatchable[] = []
  selectedPersonId = '1'
  allowedPersonFields: PersonField[] = [
    {
      value: 'firstName',
      text: 'Vorname'
    },
    {
      value: 'lastName',
      text: 'Nachname'
    },
    {
      value: 'dateOfBirth',
      text: 'Geburtsdatum',
      hint: 'YYYY or YYYY-MM-DD',
      rules: [ (e?: string): boolean => e !== undefined && (e.trim() === '' || /^(\d{4}-\d{2}-\d{2})|(\d{4})$/.test(e)) ]
    },
    {
      value: 'dateOfDeath',
      text: 'Sterbedatum',
      hint: 'YYYY or YYYY-MM-DD',
      rules: [ (e?: string): boolean => e !== undefined && (e.trim() === '' || /^(\d{4}-\d{2}-\d{2})|(\d{4})$/.test(e)) ]
    },
    {
      value: 'placeOfDeath',
      text: 'Sterbeort'
    },
    {
      value: 'placeOfBirth',
      text: 'Geburtsort'
    },
    {
      value: 'gnd',
      text: 'GND',
      rules: [ (e: any): boolean => !isNaN(e) ]
    }
  ]

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

  async updateFile(f: File): Promise<void> {
    if (f !== undefined) {
      this.file = f
      this.fileBuffer = await f.arrayBuffer()
      this.showColumnMatcher = true
    }
  }

  loadTable(t: Table<Person>): void {
    this.showColumnMatcher = false
    this.searchTable = t.map(r => ({
      ...r,
      lobid: [],
      loaded: false,
      candidateSelected: -1,
      id: _.uniqueId()
    }))
    this.searchTable.forEach((r, i) => {
      lobid.findPerson(r).then(m => {
        if (m !== undefined) {
          const newR = {
            ...r,
            lobid: m,
            candidateSelected: m.length === 1 ? 0 : -1,
            loaded: true
          }
          this.$set(this.searchTable, i, newR)
        }
      })
    })
  }

  selectLobidPerson(personId: string, lobidPersonIndex: number): void {
    const i = this.findIndexById(personId)
    this.searchTable[i].candidateSelected = lobidPersonIndex
  }

  focusNextOfClass(elementClass: string): void {
    const aE = document.activeElement
    if (
      aE instanceof HTMLElement &&
      aE.classList.contains(elementClass) &&
      aE.nextElementSibling instanceof HTMLElement
    ) {
      aE.nextElementSibling.focus()
    } else {
      const e = document.querySelector('.' + elementClass)
      if (e instanceof HTMLElement) {
        e.focus()
      }
    }
  }

  focusPrevOfClass(elementClass: string): void {
    const aE = document.activeElement
    if (
      aE instanceof HTMLElement &&
      aE.classList.contains(elementClass) &&
      aE.previousElementSibling instanceof HTMLElement
    ) {
      aE.previousElementSibling.focus()
    } else {
      const es = document.querySelectorAll('.' + elementClass)
      const last = es[es.length - 1]
      if (last instanceof HTMLElement) {
        last.focus()
      }
    }
  }

  findIndexById(id: string): number {
    return this.searchTableFiltered.findIndex(r => r.id === id)
  }

  async searchPerson(person: PersonMatchable): Promise<void> {
    this.searchingPerson = true
    this.searchSinglePerson = person
    const res = await this.loadResults(person) || []
    this.searchTableFiltered[this.findIndexById(person.id)].lobid = res
    this.searchingPerson = false
  }

  async loadResults(p: Person): Promise<LdPerson[]> {
    if (Object.keys(p).length === 0) {
      this.results = []
    } else {
      this.results = await lobid.findPerson(p)
    }
    return this.results
  }
}
</script>
