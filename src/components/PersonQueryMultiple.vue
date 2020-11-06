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
      class="row flex-shrink-1"
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
          :item-text="(i) => i.text + ' (' + searchTable.filter(i.filter).length + ')'"
          :items="filterOpts" />
      </v-col>
      <v-col class="text-right px-0" cols="6">
        <v-btn
          :loading="isSending"
          :disabled="isSending"
          elevation="0"
          color="primary"
          class="mt-3"
          @click="sendMatches">
          {{ searchTable.filter(r => r.candidateSelected > -1).length }} von {{searchTable.length}} Personen Abfragen
        </v-btn>
      </v-col>
      <v-col cols="12" class="pr-0 mr-0 text-center">
        <query-progress :total="searchTable.length" :progress="progress" />
      </v-col>
    </v-form>
    <v-divider />
    <v-row class="flex-shrink-0" style="position: relative; height: 85%">
      <v-container class="fill-height pa-0">
        <v-row class="fill-height">
          <v-col style="position: relative" class="fill-height pa-0 px-3">
            <RecycleScroller
              class="scroller fill-height v-list--nav pl-0"
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
          <v-col class="fill-height py-0 pl-0" cols="5">
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
// import { saveAs } from 'file-saver'
import { PersonField, PersonMatchable } from '@/types'
import { postList } from '@/service/backend'
import QueryProgress from './QueryProgress.vue'
@Component({
  components: {
    LobidListItem, SearchPersonDetail, ResearchPersonItem, RecycleScroller, QueryProgress
  }
})
export default class PersonQueryMultiple extends Vue {

  @Prop() allowedPersonFields: PersonField[]
  @Prop({ default: [] }) searchTable: PersonMatchable[]
  selectedFilter = this.filterOpts[0]
  selectedPersonId = '1'
  searchResultPersonDebounced = _.debounce(this.searchResultPerson, 300)
  searchingLobidPerson = false
  isFormValid = true
  isSending = false
  successId: string|null = null
  host = window.location.host
  eMail = ''

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
        text: 'mehrdeutig',
        value: 'ambiguous',
        filter: (e: PersonMatchable) => e.lobid.length > 1
      },
      {
        text: 'gefunden',
        value: 'found',
        filter: (e: PersonMatchable) => e.lobid.length === 1 || e.candidateSelected > -1
      }
    ]
  }

  get progress(): {found: number, notFound: number, ambiguous: number} {
    return {
      found: this.searchTable.filter(r => r.loaded === true && r.candidateSelected > -1).length,
      notFound: this.searchTable.filter(r => r.loaded === true && r.lobid.length === 0).length,
      ambiguous: this.searchTable.filter(r => r.loaded === true && r.candidateSelected === -1 && r.lobid.length !== 0).length,
    }
  }

  get selectedPerson(): PersonMatchable {
    const i = this.findIndexById(this.selectedPersonId)
    return this.searchTableFiltered[i]
  }

  get searchTableFiltered(): PersonMatchable[] {
    return this.searchTable.filter(this.selectedFilter.filter)
  }

  showPersonDetail(i: string): void {
    // console.log(document.activeElement)
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
    return this.searchTableFiltered.findIndex(r => r.id === id)
  }
}
</script>
<style lang="scss" scoped>
</style>
