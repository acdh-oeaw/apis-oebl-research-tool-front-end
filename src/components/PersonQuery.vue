<template>
  <v-row class="pa-3">
    <v-dialog v-model="showColumnMatcher" scrollable max-width="1000px">
      <column-matcher
        :target-columns="allowedPersonFields"
        @cancel="showColumnMatcher = false"
        @confirm="loadTable"
        :file="file" />
    </v-dialog>
    <v-col v-if="searchTable.length === 0">
      <v-row>
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
                    @input="updateName"
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
                    v-model="dateOfBirth" />
                </v-col>
                <v-col>
                  <date-picker
                    type="year"
                    dense
                    label="Sterbedatum"
                    v-model="dateOfDeath" />
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
    </v-col>
    <v-col class="pa-5" v-else>
      <v-row class="px-5">
        <v-col cols="7">
          <div class="caption grey--text">
            {{ searchTable.filter(r => r.candidateSelected).length }}
            von {{ searchTable.length }} gefunden,
            {{ searchTable.filter(r => !r.candidateSelected).length }} mehrdeutig.
          </div>
        </v-col>
        <v-col class="text-">
          <v-text-field label="E-Mail Adresse" type="email" />
          <v-btn color="primary">
            {{ searchTable.filter(r => r.candidateSelected).length }} von {{searchTable.length}} Personen Abfragen</v-btn>
          </v-col>
      </v-row>
      <v-row>
        <!-- <v-progress-linear class="px-5" :value="searchTable.filter(r => r.lobid !== undefined).length / searchTable.length * 100" /> -->
        <v-divider />
      </v-row>
      <v-row>
        <v-col cols="7">
          <v-virtual-scroll
            :bench="1"
            max-height="85vh"
            :item-height="60"
            @keydown.down.prevent="focusNextOfClass(personListElementClass)"
            @keydown.up.prevent="focusPrevOfClass(personListElementClass)"
            :items="searchTable">
            <template v-slot="{ item, index }">
              <v-list-item
                tabindex="-1"
                @keydown.down.prevent="focusNextOfClass(personListElementClass)"
                @keydown.up.prevent="focusPrevOfClass(personListElementClass)"
                :class="personListElementClass"
                @click="showPersonDetail(index)">
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
                    {{ item.firstname }} {{ item.lastname }}
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
                    :color="item.candidateSelected ? 'green' : 'red'"
                    :content="item.lobid.length">
                    <v-icon color="green" v-if="item.candidateSelected">mdi-check</v-icon>
                    <v-icon v-else-if="item.lobid.length > 1">mdi-account-group</v-icon>
                  </v-badge>
                </v-list-item-action>
              </v-list-item>
              <v-divider />
            </template>
          </v-virtual-scroll>
        </v-col>
        <v-col class="" cols="5">
          <v-card rounded elevation="0">
            <v-subheader>Eingabe</v-subheader>
            <div class="pl-5">
              <v-text-field
                v-for="(v, i) in allowedPersonFields"
                :key="i"
                dense
                class="detail-text-field caption mr-3"
                flat
                :label="v.text"
                :value="searchTable[selectedPersonIndex][v.value]" />
            </div>
            <v-subheader>Ergebnisse ({{ searchTable[selectedPersonIndex].lobid.length }})</v-subheader>
            <v-list nav>
              <lobid-list-item
                v-for="(person, i) in searchTable[selectedPersonIndex].lobid"
                @click="selectLobidPerson(selectedPersonIndex, i)"
                :input-value="i === 0"
                :key="person.id"
                :person="person" />
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import DatePicker from './DatePicker.vue'
import ColumnMatcher from './ColumnMatcher.vue'
import LobidListItem from './LobidListItem.vue'

import {Table} from '../table'
import _ from 'lodash'

@Component({
  components: {
    DatePicker,
    LobidListItem,
    ColumnMatcher
  }
})
export default class PersonQuery extends Vue {

  file: File|null = null
  dateOfBirth: string|null = null
  dateOfDeath: string|null = null
  name: string|null = ''
  log = console.log
  results = []
  personListElementClass = 'person-result'
  updateNameDebounced = _.debounce(this.updateName, 300)
  showColumnMatcher = false
  searchTable: any[] = []
  selectedPersonIndex: any = 0
  allowedPersonFields = [
    {
      value: 'firstname',
      text: 'Vorname'
    },
    {
      value: 'lastname',
      text: 'Nachname'
    },
    {
      value: 'dateOfBirth',
      text: 'Geburtsdatum'
    },
    {
      value: 'dateOfDeath',
      text: 'Sterbedatum'
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
      text: 'GND'
    }
  ]

  showPersonDetail(i: any) {
    console.log(document.activeElement)
    this.selectedPersonIndex = i
  }

  updateFile(f: File) {
    if (f !== undefined) {
      this.file = f
      this.showColumnMatcher = true
    }
  }

  loadTable(t: Table) {
    this.showColumnMatcher = false
    this.searchTable = t.map(r => ({...r, lobid: []}))
    setTimeout(() => {
      t.forEach((r, i) => {
        this.findLobidPerson(r as any).then((m: any[]) => {
          const newR = { ...r, lobid: m, candidateSelected: m.length === 1 }
          this.$set(this.searchTable, i, newR)
        })
      })
    }, 500)
  }

  selectLobidPerson(personIndex: any, lobidPersonIndex: number) {
    // moves the item to the top of the list
    this.searchTable[personIndex].candidateSelected = true
    this.searchTable[personIndex].lobid.unshift(this.searchTable[personIndex].lobid.splice(lobidPersonIndex, 1)[0])

  }

  async findLobidPerson(p: {firstname: string, lastname: string, dateOfBirth: string|null}): Promise<any> {
    const qp = new URLSearchParams({
      q: `preferredName:${ p.firstname || '' } ${ p.lastname || '' } AND dateOfBirth:${(p.dateOfBirth || '')}* AND dateOfBirth:${ null || '' }*`,
      filter: 'type:Person',
      format: 'json',
      size: '10'
    })
    try {
      const r = await (await fetch('http://lobid.org/gnd/search?' + qp)).json()
      return r.member || []
    } catch (e) {
      console.error(e)
      // this really shouldn’t happen
    }
  }

  focusNextOfClass(elementClass: string) {
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

  focusPrevOfClass(elementClass: string) {
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

  updateName(name: string) {
    this.name = name
    this.loadResults()
  }

  @Watch('dateOfBirth')
  onChangeDate() {
    this.loadResults()
  }

  async loadResults() {
    if (this.name === null || this.name.trim() === '') {
      this.results = []
    } else {
      console.log(this.name)
      // const u = http://lobid.org/gnd/search?q=preferredName%3AFranz*%20AND%20dateOfDeath:1910*&filter=type%3APerson&format=json:preferredName,dateOfDeath,dateOfBirth,%20placeOfDeath,placeOfBirth&size=100
      const qp = new URLSearchParams({
        // TODO:
        q: `preferredName:${ this.name } AND dateOfDeath:${(this.dateOfDeath || '')}* AND dateOfBirth:${ this.dateOfBirth || '' }*`,
        // q: `preferredName:${e}`,
        filter: 'type:Person',
        format: 'json',
        size: '100'
      })
      try {
        const r = await (await fetch('http://lobid.org/gnd/search?' + qp)).json()
        this.results = r.member
        console.log(r)
      } catch (e) {
        console.error(e)
        // this really shouldn’t happen
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
.detail-text-field {
  width: 45%;
  display: inline-block;
  /deep/ label{
    font-size: 13px !important;
  }
}
</style>
