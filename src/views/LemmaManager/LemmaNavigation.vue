<template>
  <div class="d-flex fill-height flex-column overflow-y-hidden">
    <div :style="{ zIndex: 1}">
      <div class="d-flex pb-2">
        <v-btn
          @click="toggleDrawer"
          tile
          depressed
          class="rounded-lg mr-2"
          icon>
          <v-icon>mdi-dock-left</v-icon>
        </v-btn>
        <v-text-field
          style="position: relative"
          :placeholder="showLoader ? 'Lade…' : 'Listen filtern…'"
          solo
          autofocus
          background-color="background lighten-1"
          class="text-body-2 rounded-lg search-field"
          dense
          @keydown.esc="onEscSearch"
          v-model="searchQuery"
          hide-details
          clearable
          flat>
          <template v-slot:prepend-inner>
            <div v-if="showLoader === true">
              <loading-spinner
                :size="25"
                :color="$vuetify.theme.dark ? 'white' : 'grey'"
                class="" />
            </div>
            <v-icon v-else>
              mdi-magnify
            </v-icon>
          </template>
        </v-text-field>
      </div>
      <!-- <v-divider class="mt-3" /> -->
    </div>
    <div style="flex: 1" class="overflow-y-auto">
      <!-- Lemma Lib -->
      <v-list
        class="ma-0 mt-4 pa-0 lemma-nav-list"
        color="transparent"
        nav
        dense>
        <v-list-item
          :ripple="false"
          dense
          to="/lemmas"
          exact
          @click="store.lemma.selectedLemmaListId = null">
          <v-list-item-avatar class="mr-2" tile size="15">
            <v-icon small>mdi-bookshelf</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              Lemmabibliothek
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <badge :content="store.lemma.lemmaCount" color="blue-grey" />
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <!-- Abgaben -->
      <v-subheader
        @click="showIssues = !showIssues"
        :class="['pl-1', showIssues && 'active']">
        <v-icon class="mr-1" small>mdi-chevron-down</v-icon>Abgaben
      </v-subheader>
      <v-list
        v-show="showIssues"
        class="pa-0 ma-0 lemma-nav-list"
        color="transparent"
        nav
        dense>
        <v-list-item
          :ripple="false"
          dense
          class="droppable mb-0"
          @dragenter.prevent="onDragEnter($event, true)"
          @dragover.prevent=""
          @drop.prevent="addLemmaToIssue(issue.id, $event)"
          @click="loadIssueLemmas(issue.id || null)"
          :to="'/issue/' + issue.id"
          :input-value="store.lemma.selectedLemmaIssueId === issue.id"
          v-for="issue in store.issue.issues"
          :key="'issue-' + issue.id">
          <v-list-item-avatar class="mr-2" size="15" tile>
            <v-icon small class="rotate-180">mdi-chart-box-outline</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ issue.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-subheader
        @click="showMyLists = !showMyLists"
        :class="['pl-1', 'pr-0', showMyLists && 'active']"
        @dragenter.prevent="onDragEnter($event)"
        @dragover.prevent=""
        @drop.prevent="createLemmaList($event)">
        <v-icon class="mr-1" small>mdi-chevron-down</v-icon>Meine Listen
        <v-spacer />
        <v-btn
          style="box-shadow: none"
          @click.capture.prevent.stop="createLemmaList"
          rounded
          class="droppable"
          @dragenter.prevent="onDragEnter($event)"
          x-small>
          Liste erstellen
        </v-btn>
      </v-subheader>
      <v-list
        class="pa-0 ma-0 lemma-nav-list"
        color="transparent"
        nav
        dense
        v-show="showMyLists"
      >
        <v-list-item
          :ripple="false"
          v-for="list in filteredLemmaListsCurrentUser"
          :key="list.id"
          :input-value="store.lemma.selectedLemmaListId === list.id"
          :to="'/lemmas/list/' + list.id"
          dense
          class="mb-0 droppable"
          @dragenter.prevent="onDragEnter($event, true)"
          @dragover.prevent=""
          @drop.prevent="copyLemmasToList(list, $event)">
          <v-list-item-avatar class="mr-2" size="15" tile>
            <v-icon small>mdi-format-list-bulleted</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ list.title }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <transition name="roll">
              <badge
                :key="list.count"
                :color="list.count !== undefined && list.count > 0 ? 'blue-grey' : 'background'"
                :content="list.count" />
            </transition>
          </v-list-item-action>
          <v-list-item-action class="ml-0" v-if="list.countNew !== 0">
            <badge
              class="font-weight-bold"
              color="primary"
              :content="list.countNew ? '+' + list.countNew.toString() : '0'" />
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-subheader
        @click="showTeamLists = !showTeamLists"
        :class="['pl-1', showTeamLists && 'active']">
        <v-icon class="mr-1" small>mdi-chevron-down</v-icon>Team-Listen
      </v-subheader>
      <v-list
        class="pa-0 ma-0 lemma-nav-list"
        color="transparent"
        nav
        dense
        v-show="showTeamLists"
      >
        <v-list-item
          :ripple="false"
          v-for="list in filteredLemmaListsOtherUsers"
          :key="list.id"
          tabindex="-1"
          :input-value="store.lemma.selectedLemmaListId === list.id"
          dense
          :to="`/lemmas/list/${ list.id }`"
          class="droppable mb-0"
          @dragenter.prevent="onDragEnter($event, true)"
          @dragover.prevent=""
          @drop.prevent="copyLemmasToList(list, $event)">
          <v-list-item-avatar class="mr-2" size="15" tile>
            <v-icon small>mdi-format-list-bulleted</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ list.title }}
            </v-list-item-title>
            <v-list-item-subtitle style="font-size: 75%">
              {{ list.editor ? list.editor.name : '' }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <transition name="roll">
              <badge
                :key="list.count"
                inline
                class="muted"
                :color="list.count !== undefined && list.count > 0 ? 'blue-grey' : 'background'"
                :content="list.count" />
            </transition>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-subheader
        @click="showQueries = !showQueries" :class="['px-0', showQueries && 'active']"
        class="pl-1">
        <v-icon class="mr-1" small>mdi-chevron-down</v-icon>Meine Abfragen
      </v-subheader>
      <v-list
        class="pa-0 ma-0 lemma-nav-list"
        color="transparent"
        nav
        v-show="showQueries"
        dense>
        <v-list-item
          :ripple="false"
          dense
          class="mb-0"
          :input-value="filter.id === store.lemma.selectedLemmaFilterId"
          @click="selectLemmaFilter(filter.id)"
          v-for="(filter, i) in filteredStoredLemmaFilters"
          :key="'l' + i">
          <v-list-item-avatar class="mr-2" size="15" tile>
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
    <div v-if="store.lemma.importStatus.isImporting">
      <v-divider />
      <div class="px-4 pb-5">
        <v-subheader class="pl-1"><div>Importiere …</div> <v-spacer /><div>({{ store.lemma.importStatus.status }} von {{ store.lemma.importStatus.target }})</div></v-subheader>
        <v-progress-linear class="mt-0 rounded" :value="store.lemma.importStatus.progress * 100" />
      </div>
    </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import store from '../../store'
import LoadingSpinner from '@/views/lib/LoadingSpinner.vue'
import { LemmaRow } from '@/types/lemma'
import _ from 'lodash'
import confirm from '@/store/confirm'
import prompt from '@/store/prompt'
import { List as LemmaList, List } from '@/api/models/List'
import { WithId } from '@/types'
import { requestState } from '@/store/fetch'
import Badge from '../lib/Badge.vue'

@Component({
  components: {
    LoadingSpinner,
    Badge
  }
})
export default class LemmaNavigation extends Vue {

  searchQuery: string|null = null
  editingNameKey: string|null = null
  store = store
  log = console.log
  requestState = requestState

  showLoader = false

  showIssues = true
  showMyLists = true
  showTeamLists = true
  showQueries = true

  @Watch('requestState.isLoading')
  onChangeIsLoading(v: boolean, oldV: boolean) {
    if (v !== oldV) {
      setTimeout(() => {
        // if the loading value is still the same after
        // a set time, actually update the value.
        if (requestState.isLoading === v) {
          this.showLoader = v
        }
      }, 300)
    }
  }

  onDragEnter(e: DragEvent, clickAfterLingering = false) {
    if (e.currentTarget instanceof HTMLElement) {
      const target = e.currentTarget
      const timer = setTimeout(() => {
        if (clickAfterLingering) {
          target.click()
        }
      }, 1000)
      target.classList.add('drag-over')
      const onLeaveOrDrop = () => {
        clearTimeout(timer)
        target.classList.remove('drag-over')
        target.removeEventListener('dragleave', onLeaveOrDrop)
        target.removeEventListener('drop', onLeaveOrDrop)
      }
      target.addEventListener('dragleave', onLeaveOrDrop)
      target.addEventListener('drop', onLeaveOrDrop)
    }
  }

  onDrop(e: DragEvent) {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('drag-over')
    }
  }

  selectLemmaFilter(i: string) {
    store.lemma.selectedLemmaFilterId = i
  }

  onEscSearch(e: KeyboardEvent) {
    if (this.searchQuery !== '' && this.searchQuery !== null) {
      this.searchQuery = null
    } else {
      if (e.target instanceof HTMLInputElement) {
        e.target.blur()
      }
    }
  }

  async loadIssueLemmas(issueId: number|null) {
    if (issueId !== null) {
      store.lemma.selectedLemmaIssueId = issueId
      const ls = await store.issue.getIssueLemmas(issueId)
      store.lemma.selectedIssueLemmas = ls
    }
  }

  async deleteList(list: LemmaList) {
    if (list.id !== undefined) {
      if (await confirm.confirm(`Liste ”${list.title}” löschen?`)) {
        store.lemma.deleteLemmaList(list.id)
      }
    }
  }

  async copyLemmasToList(list: WithId<List>, e: DragEvent) {
    const lemmas = JSON.parse(e.dataTransfer?.getData('text/plain') || '[]') as LemmaRow[]
    const listItems = store.lemma.getLemmasByList(list.id)
    const newLemmaList = _.uniq([ ...lemmas.map(l => l.id), ...listItems ])
    const diff = newLemmaList.length - listItems.length
    if (diff !== 0 && await confirm.confirm(`${lemmas.length} Lemma(ta) zu ”${list.title}” hinzufügen?`)) {
      store.lemma.addLemmasToList({
        id: list.id,
        title: list.title,
        editor: store.user.userProfile.userId
      }, lemmas)
    }
  }

  async addLemmaToIssue(issueId: number, e: DragEvent) {
    const lemmas = e instanceof DragEvent ? JSON.parse(e.dataTransfer?.getData('text/plain') || '[]') as LemmaRow[] : []
    store.issue.addLemmaToIssue(issueId, lemmas)
  }

  async createLemmaList(e: DragEvent|MouseEvent) {
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
      const l = await store.lemma.createList(name) as WithId<LemmaList>
      if (lemmas.length) {
        await store.lemma.addLemmasToList({
          id: l.id,
          title: l.title,
          editor: store.user.userProfile.userId
        }, lemmas)
      }
      store.lemma.selectedLemmaListId = l.id || null
    }
  }

  get filteredStoredLemmaFilters() {
    if (this.searchQuery !== null && this.searchQuery.trim() !== '') {
      return store.lemma.storedLemmaFilters.filter(l => l.name.toLocaleLowerCase().includes(this.searchQuery || ''))
    } else {
      return store.lemma.storedLemmaFilters
    }
  }

  get filteredLemmaLists() {
    if (this.searchQuery !== null && this.searchQuery.trim() !== '') {
      return store.lemma.lemmaLists.filter(l => l.title.toLocaleLowerCase().includes(this.searchQuery || ''))
    } else {
      return store.lemma.lemmaLists
    }
  }

  get filteredLemmaListsCurrentUser() {
    return this.filteredLemmaLists.filter(l => l.editor !== undefined && l.editor.userId === store.user.userProfile.userId)
  }

  get filteredLemmaListsOtherUsers() {
    return this.filteredLemmaLists.filter(l => l.editor === undefined || l.editor.userId !== store.user.userProfile.userId)
  }

  toggleDrawer() {
    this.store.settings = {...this.store.settings, showNavDrawer: !this.store.settings.showNavDrawer }
  }

}
</script>
<style lang="stylus">

.droppable *
  pointer-events none !important

</style>
<style lang="stylus" scoped>

.drag-over
  box-shadow inset 0px 0px 0px 3px var(--v-primary-base) !important

.v-subheader
  font-size .75rem
  cursor default
  height 24px
  margin-top 14px
  margin-bottom 3px

.v-subheader .v-icon
  width 0
  opacity 0
  transform rotate(-90deg)

.v-subheader:hover .v-icon
  opacity 1
  width 10px

.v-subheader.active .v-icon
  transform rotate(0deg)

.search-field /deep/ .v-icon.v-icon
  font-size 130%

.v-list-item
  min-height 32px !important

.v-list-item .v-list-item__content
  opacity .8

.v-list-item__action
  margin 0 0

.lemma-nav-list /deep/ .v-list-group__header
  &:before
    opacity 0 !important
  .v-icon
    opacity 0
  &:hover .v-icon
    opacity 1

.lemma-nav-list
.lemma-nav-list /deep/ *
  cursor default !important

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
