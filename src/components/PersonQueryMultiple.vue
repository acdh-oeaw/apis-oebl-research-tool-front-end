<template>
  <v-container fill-height class="align-stretch pa-0 pb-5">
    <v-dialog
      persistent
      :max-width="500"
      :value="successId !== null">
      <v-card class="text-center">
        <v-card-title class="text-center overline d-block">
          Daten zur Verarbeitung gesendet
        </v-card-title>
        <v-card-text class="text-center">
          <p>
            Die Lemmaliste wurde zur weiteren Verarbeitung an den Server gesendet.
            Die Ergebnisse werden nach dem Datenabgleich unter dieser Adresse angezeigt:
          </p>
          <p>
            <a :href="'https://'+ host + '/result/' + successId">{{ host }}/result/{{ successId }}</a>
          </p>
          <p>
            Sie erhalten eine E-Mail an <b>{{ eMail }}</b> mit dem Link, sobald die Verarbeitung abgeschlossen ist.
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-form
      class="row flex-shrink-1 px-3"
      ref="form"
      v-model="isFormValid"
      lazy-validation>
      <v-col cols="3">
        <v-text-field
          v-model="eMail"
          label="E-Mail Adresse"
          :rules="[ (e) => this.isNormalEmail(e) || 'ungültige email adresse' ]"
          type="email" />
      </v-col>
      <v-col cols="3" class="text-">
        <v-select
          label="Filter"
          v-model="selectedFilter"
          return-object
          item-value="value"
          :item-text="(i) => i.text + ' (' + i.count + ')'"
          :items="filters" />
      </v-col>
      <v-col class="text-right px-0" cols="6">
        <v-btn
          :loading="isSending"
          :disabled="isSending"
          elevation="0"
          color="primary"
          class="mt-3"
          @click="sendMatches">
          {{ searchTable.filter(r => r.candidateSelected > -1).length }} von {{searchTable.length}} Personen Abfragen …
        </v-btn>
      </v-col>
      <v-col cols="12" class="pr-0 mr-0 text-center">
        <query-progress
          :active-filter="selectedFilter"
          @select-filter="selectFilter"
          :total="searchTable.length"
          :filters="filters" />
      </v-col>
    </v-form>
    <v-divider />
    <v-row class="flex-shrink-0" style="position: relative; height: 85%">
      <v-container class="fill-height pa-0">
        <v-row class="fill-height">
          <v-col
            style="position: relative"
            class="fill-height pa-0 px-3">
            <RecycleScroller
              class="scroller fill-height v-list--nav pl-0"
              :items="searchTableFiltered"
              key-field="id"
              :item-size="60">
              <template v-slot="{ item, index }">
                <research-person-item
                  :tabindex="index"
                  @click="showPersonDetail(item.id)"
                  @keydown.enter="focusDetailQueryField"
                  :selected="item.id === selectedPersonId"
                  :class="[ 'rounded', 'research-list-item', item.id === selectedPersonId && 'selected' ]"
                  :key="item.id"
                  :item="item" />
              </template>
            </RecycleScroller>
          </v-col>
          <v-col class="fill-height py-0 pl-0" cols="5">
            <v-card class="fill-height d-flex flex-column rounded-lg" scrollable rounded elevation="0">
              <v-card-title class="pb-0">
                <v-subheader>Eingabe</v-subheader>
                <div v-if="selectedPerson !== undefined">
                  <search-person-detail
                    v-if="selectedPerson"
                    class="pl-5 search-person-detail"
                    :fields="allowedPersonFields"
                    :value="selectedPerson"
                    @change="searchResultPersonDebounced($event)"
                  />
                  <v-subheader>
                    <v-badge offset-x="-4" offset-y="5" dot left :color="getPersonFilterColor(selectedPerson)" />
                    Ergebnisse ({{ selectedPerson.lobid.length }})
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
                  </v-subheader>
                </div>
              </v-card-title>
              <v-divider />
              <v-card-text style="overflow: auto">
                <div v-if="selectedPerson !== undefined">
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
                </div>
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
// import { saveAs } from 'file-saver'
import { Filter, PersonField, PersonMatchable } from '@/types'
import { postList } from '@/service/backend'
import QueryProgress from './QueryProgress.vue'
import vuetify from '@/plugins/vuetify'
@Component({
  components: {
    LobidListItem, SearchPersonDetail, ResearchPersonItem, RecycleScroller, QueryProgress
  }
})
export default class PersonQueryMultiple extends Vue {

  @Prop() allowedPersonFields: PersonField[]
  @Prop({ default: [] }) searchTable: PersonMatchable[]

  selectedFilter = this.filters[0]
  selectedPersonId = '1'
  searchResultPersonDebounced = _.debounce(this.searchResultPerson, 300)
  searchingLobidPerson = false
  isFormValid = true
  isSending = false
  successId: string|null = null
  host = window.location.host
  eMail = ''
  log = console.log

  async focusSelectedItem(): Promise<void> {
    await this.$nextTick()
    const el = this.$el.querySelector('.research-list-item.selected')
    if (el instanceof HTMLElement) {
      el.focus()
    }
  }

  getPersonFilterColor(p: PersonMatchable): string|undefined {
    // console.log('filterColor', this.filters.find(f => f.value !== 'all' && f.filter(p))?.color)
    return this.filters.find(f => f.value !== 'all' && f.filter(p))?.color
  }

  focusDetailQueryField(): void {
    const el = this.$el.querySelector('.search-person-detail input')
    if (el instanceof HTMLInputElement) {
      el.focus()
      el.select()
    }
  }

  selectFilter(f: Filter): void {
    if (f.value === this.selectedFilter.value) {
      this.selectedFilter = this.filters[0]
    } else {
      this.selectedFilter = f
    }
  }

  selectNextPerson(): void {
    const i = this.searchTableFiltered.findIndex(p => p.id === this.selectedPersonId)
    this.selectedPersonId = this.searchTableFiltered[i + 1].id
    this.focusSelectedItem()
  }

  async selectPreviousPerson(): Promise<void> {
    const i = this.searchTableFiltered.findIndex(p => p.id === this.selectedPersonId)
    this.selectedPersonId = this.searchTableFiltered[i - 1].id
    this.focusSelectedItem()
  }

  keyListener(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp') {
      this.selectPreviousPerson()
    } else if (e.key === 'ArrowDown') {
      this.selectNextPerson()
    }
  }

  mounted(): void {
    document.addEventListener('keydown', this.keyListener)
  }

  beforeDestroy(): void {
    document.removeEventListener('keydown', this.keyListener)
  }

  get filters(): Filter[] {
    const all = () => true
    const notFound = (e: PersonMatchable) => e.lobid.length === 0 && e.loaded === true
    const ambiguous = (e: PersonMatchable) => e.lobid.length > 1 && e.candidateSelected === -1
    const found = (e: PersonMatchable) => e.candidateSelected > -1
    return [
      {
        text: 'alle',
        value: 'all',
        filter: all,
        count: this.searchTable.filter(all).length,
        color: ''
      },
      {
        text: 'gefunden',
        value: 'found',
        filter: found,
        color: '#4caf50',
        count: this.searchTable.filter(found).length
      },
      {
        text: 'mehrdeutig',
        value: 'ambiguous',
        filter: ambiguous,
        count: this.searchTable.filter(ambiguous).length,
        color: '#f44236'
      },
      {
        text: 'nicht gefunden',
        value: 'not found',
        filter: notFound,
        count: this.searchTable.filter(notFound).length,
        color: '#ababab'
      },
    ]
  }

  get selectedPerson(): PersonMatchable|undefined {
    const personInFilteredList = this.searchTableFiltered.find(p => p.id === this.selectedPersonId)
    const personNotInFilteredList = this.searchTable.find(p => p.id === this.selectedPersonId)
    if (personInFilteredList !== undefined) {
      return personInFilteredList
    } else if (personNotInFilteredList !== undefined) {
      return personNotInFilteredList
    } else {
      return undefined
    }
  }

  get searchTableFiltered(): PersonMatchable[] {
    return this.searchTable.filter(this.selectedFilter.filter)
  }

  showPersonDetail(i: string): void{
    this.selectedPersonId = i
  }

  async searchResultPerson(person: PersonMatchable): Promise<void> {
    this.searchingLobidPerson = true
    const res = await lobid.findPerson(person) || []
    this.searchTable[this.findIndexById(person.id)].lobid = res
    this.searchingLobidPerson = false
  }

  selectLobidPerson(personId: string, lobidPersonIndex: number): void {
    const i = this.searchTable.findIndex(p => p.id === personId)
    if (i > -1) {
      this.searchTable[i].candidateSelected = lobidPersonIndex
    } else {
      throw new Error('Can’t find Person with Id ' + personId)
    }
  }

  isNormalEmail(email: string): boolean {
    return email.includes('@') && email.includes('.')
  }

  async sendMatches(): Promise<void> {
    if ((this.$refs.form as any).validate() === true) {
      const res = this.searchTable
        .filter(p => p.candidateSelected > -1)
        .map(p => {
          return {
            firstName: p.firstName as string,
            lastName: p.lastName as string,
            gnd: (p.lobid[p.candidateSelected] as any).gndIdentifier as string
          }
        })
      this.isSending = true
      const s = await postList(res, this.eMail)
      this.successId = s.success
      this.isSending = false
      // saveAs(new Blob([JSON.stringify({email: this.eMail, lemmas: res}, undefined, 4)]), 'research-list-matched.json')
    }
  }

  findIndexById(id: string): number {
    return this.searchTable.findIndex(r => r.id === id)
  }
}
</script>
<style lang="scss" scoped>
</style>
