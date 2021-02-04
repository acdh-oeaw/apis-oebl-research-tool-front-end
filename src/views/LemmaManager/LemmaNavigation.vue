<template>
  <div class="d-flex fill-height flex-column overflow-y-hidden">
    <div class="background darken-2" :style="{ zIndex: 1}">
      <v-text-field
        placeholder="Lemmalisten suchen…"
        solo
        autofocus
        background-color="background lighten-1"
        class="text-body-2 rounded-lg search-field"
        dense
        prepend-inner-icon="mdi-magnify"
        @keydown.esc="onEscSearch"
        v-model="searchQuery"
        hide-details
        clearable
        flat />
      <v-divider class="mt-3" />
    </div>
    <div style="flex: 1" class="overflow-y-auto">
      <v-list
        subheader
        class="mt-4 pr-0 pl-0"
        color="transparent"
        @dragleave.prevent="highlightedKey = null"
        nav dense>
        <v-list-item
          dense
          :input-value="store.lemma.selectedLemmaListId === null && store.lemma.selectedLemmaFilterId === null && store.lemma.selectedLemmaIssueId === null"
          @click="store.lemma.selectedLemmaListId = null"
          class="rounded-lg">
          <v-list-item-avatar tile size="15">
            <v-icon small>mdi-bookshelf</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              Lemmabibliothek
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-badge content="10,000+" color="blue-grey" inline />
          </v-list-item-action>
        </v-list-item>
        <v-subheader
          class="sticky background darken-2"
          :style="{ zIndex: 1}">
          Abgaben
        </v-subheader>
        <v-list-item
          dense
          @dragenter.prevent="highlightedKey = 'issue_' + issue.id"
          @dragover.prevent=""
          @drop.prevent="addLemmaToIssue(issue.id, $event)"
          class="rounded-lg mb-0"
          :input-value="store.lemma.selectedLemmaIssueId === issue.id"
          @click="loadIssueLemmas(issue.id || null)"
          :class="[highlightedKey === 'issue_' + issue.id && 'drag-over']"
          v-for="issue in store.issue.issues"
          :key="'issue-' + issue.id">
          <v-list-item-avatar size="15" tile>
            <v-icon small class="rotate-180">mdi-chart-box-outline</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ issue.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-subheader
          @dragenter.prevent="highlightedKey = 'create-list'"
          @dragover.prevent=""
          @drop.prevent="createLemmaList($event)"
          class="sticky background darken-2"
          :style="{ zIndex: 1}">
          Meine Listen
          <v-spacer />
          <v-btn
            style="box-shadow: none"
            @click="createLemmaList"
            rounded
            :class="[highlightedKey === 'create-list' && 'drag-over']"
            x-small>Liste erstellen
          </v-btn>
        </v-subheader>
        <v-list-item
          dense
          v-for="list in filteredLemmaLists"
          @dragenter.prevent="highlightedKey = 'my-list_' + list.id"
          @dragover.prevent=""
          @drop.prevent="copyLemmasToList(list.id, $event)"
          :input-value="store.lemma.selectedLemmaListId === list.id"
          :class="['rounded-lg', 'mb-0', highlightedKey === 'my-list_' + list.id && 'drag-over']"
          @click="store.lemma.selectedLemmaListId = list.id || null"
          :key="list.id">
          <v-list-item-avatar size="15" tile>
            <v-icon small>mdi-format-list-bulleted</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <input v-if="editingNameKey === 'my-list_' + list.id" v-model="list.title">
            <v-list-item-title v-else>
              {{ list.title }}
            </v-list-item-title>
          </v-list-item-content>
          <!-- <v-list-item-action>
            <transition name="roll">
              <v-badge :key="list.items.length" inline color="blue-grey" :content="list.items.length" />
            </transition>
          </v-list-item-action> -->
        </v-list-item>
        <v-subheader
          class="sticky"
          :style="{ background: $vuetify.theme.currentTheme.inset, zIndex: 1}">
          Gesicherte Abfragen
        </v-subheader>
        <v-list-item
          dense
          class="rounded-lg mb-0"
          :input-value="filter.id === store.lemma.selectedLemmaFilterId"
          @click="selectLemmaFilter(filter.id)"
          v-for="(filter, i) in filteredStoredLemmas"
          :key="'l' + i">
          <v-list-item-avatar size="15" tile>
            <v-icon small>mdi-card-search-outline</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ filter.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import store from '../../store'
import { v4 as uuid } from 'uuid'
import { LemmaRow } from '@/types/lemma'
import _ from 'lodash'
import confirm from '@/store/confirm'
import prompt from '@/store/prompt'
import { List as LemmaList } from '@/api/models/List'

@Component
export default class LemmaNavigation extends Vue {

  searchQuery = ''
  highlightedKey: string|null = null
  editingNameKey: string|null = null
  store = store
  log = console.log

  async createList() {
    const name = await prompt.prompt('Geben Sie einen Namen für die Liste ein')
    console.log(name)
  }

  selectLemmaFilter(i: string) {
    store.lemma.selectedLemmaFilterId = i
  }

  onEscSearch(e: KeyboardEvent) {
    if (this.searchQuery !== '') {
      this.searchQuery = ''
    } else {
      if (e.target instanceof HTMLInputElement) {
        e.target.blur()
      }
    }
  }

  async loadIssueLemmas(issueId: number|null) {
    if (issueId !== null) {
      const ls = await store.issue.getIssueLemmas(issueId)
      store.lemma.selectedIssueLemmas = ls
      store.lemma.selectedLemmaIssueId = issueId
    }
  }

  async copyLemmasToList(id: number, e: DragEvent) {
    this.highlightedKey = null
    const lemmas = JSON.parse(e.dataTransfer?.getData('text/plain') || '[]') as LemmaRow[]
    const listIndex = store.lemma.lemmaLists.findIndex(l => l.id === id)
    if (listIndex > -1) {
      const list = store.lemma.lemmaLists[listIndex]
      const listItems = store.lemma.getLemmasByList(list.id as number)
      const newLemmaList = _.uniq([ ...lemmas.map(l => l.id), ...listItems ])
      const diff = newLemmaList.length - listItems.length
      if (diff !== 0 && await confirm.confirm(`${lemmas.length} Lemma(ta) zu ”${list.title}” hinzufügen?`)) {
        // TODO:
        // store.lemma.addLemmasToList(list.id, lemmas)
      }
    }
  }

  async addLemmaToIssue(issueId: number, e: DragEvent) {
    const lemmas = e instanceof DragEvent ? JSON.parse(e.dataTransfer?.getData('text/plain') || '[]') as LemmaRow[] : []
    const issueLemmas = await Promise.all(lemmas.map(l => {
      return store.issue.createIssueLemma(issueId, l)
    }))
  }

  async createLemmaList(e: DragEvent|MouseEvent) {
    this.highlightedKey = null
    const lemmas = e instanceof DragEvent ? JSON.parse(e.dataTransfer?.getData('text/plain') || '[]') as LemmaRow[] : []
    const lemmaNameRules = [
      (n: string|null) => n === null || (typeof n === 'string' && n.trim() === '') ? 'Geben Sie einen Namen ein.' : true,
      (n: string|null) => {
        if (n === null) {
          return 'Geben Sie einen Namen ein'
        } else if (this.filteredLemmaLists.findIndex(ll => ll.title.trim().toLocaleLowerCase() === n.trim().toLocaleLowerCase()) > -1) {
          return 'Name bereits vergeben.'
        } else {
          return true
        }
      }
    ]
    const message = lemmas.length > 0 ? `Neue Liste mit ${lemmas.length} Einträgen erstellen` : 'Neue Liste anlegen'
    const name = await prompt.prompt(message, { placeholder: 'Listenname…', rules: lemmaNameRules })
    if (name !== null) {
      store.settings = {
        ...store.settings,
        storedLemmaLists: [
          ...store.settings.storedLemmaLists,
          {
            name,
            id: uuid(),
            items: lemmas.map(l => l.id)
          }
        ]
      }
    }
  }

  get filteredStoredLemmas() {
    if (this.searchQuery.trim() !== '') {
      return store.settings.storedLemmaFilters.filter(l => l.name.toLocaleLowerCase().includes(this.searchQuery))
    } else {
      return store.settings.storedLemmaFilters
    }
  }

  get filteredLemmaLists(): LemmaList[] {
    if (this.searchQuery.trim() !== '') {
      return store.lemma.lemmaLists.filter(l => l.title.toLocaleLowerCase().includes(this.searchQuery))
    } else {
      return store.lemma.lemmaLists
    }
  }

}
</script>
<style lang="stylus" scoped>

.search-field /deep/ .v-icon.v-icon
  font-size 130%

.v-list-item__action
  margin 10px 0

.drag-over
  box-shadow inset 0px 0px 0px 3px var(--v-primary-base) !important

.roll-enter-active, .roll-leave-active
  position relative
  transition: all .3s ease;

.roll-enter, .roll-leave-to
  position absolute
  opacity: 0

.roll-enter
  transform translateY(20px)
.roll-leave-to
  transform translateY(-20px)

</style>
