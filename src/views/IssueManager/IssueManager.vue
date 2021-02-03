<template>
  <div class="fill-height">
    <v-app-bar
      app
      color="background"
      class="elevation-0 pt-2 pr-3">
        <v-btn @click="toggleDrawer" tile class="rounded-lg" icon>
          <v-icon>mdi-dock-left</v-icon>
        </v-btn>
        <h1>{{ store.issue.activeIssue ? store.issue.activeIssue.name : '…' }}</h1>
      <v-spacer />
      <v-autocomplete
        single-line
        style="max-width: 50%"
        class="rounded-lg ml-5 mr-1 text-body-2"
        background-color="background darken-2"
        dense
        multiple
        clearable
        hide-details
        :menu-props="{
          maxWidth: `calc(50% - ${ store.settings.drawerLeftWidth + store.settings.drawerRightWidth }px)`,
          rounded: 'lg',
          contentClass: 'soft-shadow'
        }"
        return-object
        :items="autocompleteItems"
        placeholder="Filter…"
        @keyup.esc="searchText = ''"
        @change="searchText = ''"
        v-model="searchItems"
        :search-input.sync="searchText"
        prepend-inner-icon="mdi-magnify"
        @click:append-inner="searchItems = []"
        solo
        flat>
        <template v-slot:append>
          <v-btn
            x-small
            elevation="0"
            rounded
            color="background"
            @click.stop.prevent="log">
            {{
              searchItems.length > 0
                ? filteredIssues.length + '/' + issueLemmas.length
                : issueLemmas.length
            }}
          </v-btn>
        </template>
        <template v-slot:item="{ item, on, props }">
          <v-list-item
            v-ripple="false"
            class="filter-autocomplete-item mx-2 mb-1"
            v-bind="props"
            :key="item.type + '__' + item.id"
            v-on="on"
            :class="{
              selected: searchItems.find(i => i.id === item.id && i.type === item.type) !== undefined
            }">
            <v-list-item-avatar>
              <img v-if="item.type === 'editor' && item.image !== undefined" :src="item.image" :key="item.type + '__' + item.id" />
              <v-icon v-if="item.type === 'author'">mdi-account-edit-outline</v-icon>
              <v-icon v-if="item.type === 'label' && item.color !== undefined" :color="item.color">mdi-checkbox-blank-circle</v-icon>
              <v-icon v-if="item.type === 'text'">mdi-card-text-outline</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.text }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ item.description }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action width="20" v-if="searchItems.find(i => i.id === item.id && i.type === item.type) !== undefined">
              <v-icon small>mdi-check</v-icon>
            </v-list-item-action>
          </v-list-item>
        </template>
      </v-autocomplete>
      <v-menu
        content-class="soft-shadow"
        offset-y
        left
        bottom
        :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            tile
            class="rounded-lg"
            icon>
            <v-icon>mdi-dots-horizontal-circle-outline</v-icon>
          </v-btn>
        </template>
        <!-- <v-card class="pa-3 pt-1 rounded-lg soft-shadow"> -->
          <v-list color="background lighten-2" class="text-body-2 rounded-lg elevation-0s" dense nav>
            <v-subheader>
              Layout
            </v-subheader>
            <v-list-item class="pa-1 rounded-lg">
              <switch-button
                :items="[
                  { icon: 'mdi-chart-box-outline', value: 'board' },
                  { icon: 'mdi-format-list-bulleted', value: 'list' }
                ]"
                v-model="viewAs"
              />
            </v-list-item>
            <v-list-item @click="store.settings = {...store.settings, issueViewOptions: { ...store.settings.issueViewOptions, showDescription: !store.settings.issueViewOptions.showDescription }}">
              <v-list-item-avatar size="15">
                <v-icon v-if="store.settings.issueViewOptions.showDescription">mdi-check</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  Beschreibung anzeigen
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="store.settings = {...store.settings, issueViewOptions: { ...store.settings.issueViewOptions, showAuthor: !store.settings.issueViewOptions.showAuthor }}">
              <v-list-item-avatar size="15">
                <v-icon v-if="store.settings.issueViewOptions.showAuthor">mdi-check</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  Autor anzeigen
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="store.settings = {...store.settings, issueViewOptions: { ...store.settings.issueViewOptions, showEditor: !store.settings.issueViewOptions.showEditor }}">
              <v-list-item-avatar size="15">
                <v-icon v-if="store.settings.issueViewOptions.showEditor">mdi-check</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  Redakteur anzeigen
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider />
            <v-subheader>
              Farbschema
            </v-subheader>
            <v-list-item :style="{backgroundColor: 'var(--v-background-darken-2)'}" class="pa-1 rounded-lg">
              <theme-toggle />
            </v-list-item>
          </v-list>
        <!-- </v-card> -->
      </v-menu>
      <v-btn
        @click="showSideBar = !showSideBar"
        v-if="!showSideBar"
        tile
        class="rounded-lg"
        icon>
        <v-icon>mdi-dock-right</v-icon>
      </v-btn>
    </v-app-bar>
    <resizable-drawer
      :card="true"
      :right="true"
      :color="$vuetify.theme.currentTheme.sidebar"
      :value="showSideBar"
      @close="showSideBar = false">
      <lemma-detail
        :lemma="selectedLemma"
        :value="selectedLemma !== null"
        @update-status="updateLemmaStatus"
        @close="showSideBar = false" />
    </resizable-drawer>
    <v-main class="fill-height rounded-lg">
      <lemma-board
        v-if="store.settings.issueLayout === 'board'"
        class="fill-height"
        :columns="columns"
        :animate="animateLemmas"
        :selected-lemma="selectedLemma"
        @update-column="onUpdateColumn"
        @select-lemma="openLemma"
        @dblclick.native="showSideBar = !showSideBar"
        :view-options="viewOptions"
      />
      <lemma-list
        v-if="store.settings.issueLayout === 'list'"
        class="fill-height"
        :columns="columns"
        :animate="animateLemmas"
        :selected-lemma="selectedLemma"
        @update-column="onUpdateColumn"
        @select-lemma="openLemma"
        @dblclick.native="showSideBar = !showSideBar"
        :view-options="viewOptions"
      />
    </v-main>
    <!-- <v-divider class="ml-5 mr-5 my-0" />
    <v-footer class="pa-0" color="background" app>
      <div>
        status
      </div>
    </v-footer> -->
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { WithId } from '../../types'
import { LemmaStatus, IssueLemma, LemmaLabel } from '../../api/index'
import _ from 'lodash'
import ThemeToggle from '../ThemeToggle.vue'
import LemmaBoard from './IssueLemmaBoard.vue'
import ResizableDrawer from '../lib/ResizableDrawer.vue'
import LemmaDetail from './IssueLemmaDetail.vue'
import LoadingSpinner from '../lib/LoadingSpinner.vue'
import LemmaList from './IssueLemmaList.vue'
import SwitchButton from '../lib/SwitchButton.vue'
import store from '@/store'

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

@Component({
  components: {
    LemmaDetail,
    LemmaBoard,
    LemmaList,
    ResizableDrawer,
    LoadingSpinner,
    ThemeToggle,
    SwitchButton
  }
})
export default class IssueManager extends Vue {

  @Prop({ default: '-1' }) issueId!: string

  selectedLemma: IssueLemma|null = store.settings.selectedIssueLemma
  searchText: string|null = null
  searchItems: any[] = store.settings.issueLemmaSearchItems
  animateLemmas = false
  store = store
  showSideBar = false

  log = console.log

  get viewAs(): 'board'|'list' {
    return store.settings.issueLayout
  }

  set viewAs(t: 'board'|'list') {
    store.settings = { ...store.settings, issueLayout: t }
  }

  toggleDrawer() {
    this.store.settings = {
      ...this.store.settings,
      issueManagerNavVisible: !this.store.settings.issueManagerNavVisible
    }
  }

  viewOptions = {
    showAuthor: true,
    showEditor: true,
    showDescription: true,
    showLabels: Infinity
  }

  @Watch('searchItems')
  onChangeSearchItems() {
    store.settings = {
      ...store.settings,
      issueLemmaSearchItems: this.searchItems
    }
  }

  labels = [
    {
      name: 'vorläufige zusage',
      id: 1,
      color: 'orange'
    },
    {
      name: 'prioritär',
      id: 2,
      color: 'red'
    },
    {
      name: 'KW 12',
      id: 3,
      color: '#6495ed'
    }
  ]

  convertUnknownStatus(l: WithId<IssueLemma>): WithId<IssueLemma> {
    if (this.issueStatus.find(s => s.id === l.status) === undefined) {
      return {...l, status: this.issueStatus[0]?.id}
    } else {
      return l
    }
  }

  get issueLemmas(): WithId<IssueLemma>[] {
    return store.issue.issueLemmas.map(this.convertUnknownStatus)
  }

  set issueLemmas(ls: WithId<IssueLemma>[]) {
    store.issue.issueLemmas = ls
  }

  get issueStatus() {
    return store.issue.statuses
  }

  updateLemmaStatus(statusId: LemmaStatus['id'], lemma: IssueLemma) {
    const index = this.issueLemmas.findIndex(i => i.id === lemma.id)
    if (index > -1) {
      this.animateLemmas = true
      this.issueLemmas[index].status = statusId
      setTimeout(() => { this.animateLemmas = false }, 300)
    }
  }

  updateLemmaById(id: number, u: Partial<IssueLemma>) {
    const i = this.issueLemmas.findIndex(l => l.id === id)
    if (i > -1) {
      this.$set(this.issueLemmas, i, { ...this.issueLemmas[i], ...u })
    }
  }

  onUpdateColumn(status: LemmaStatus, lemmas: WithId<IssueLemma>[]) {
    const lemmaIds = lemmas.map(l => l.id)
    const withoutColumn = this.issueLemmas.filter(l => !lemmaIds.includes(l.id))
    const updatedColumn: WithId<IssueLemma>[] = []
    lemmas.forEach((lemma, i) => {
      const order = (lemma.order || 0) <= (updatedColumn[i - 1]?.order || 0)
        ? (updatedColumn[i - 1].order || 0) + 1
        : lemma.order
      updatedColumn.push({
        ...lemma,
        order,
        status: status.id
      })
    })
    this.issueLemmas = [ ...withoutColumn, ...updatedColumn ]
  }

  get columns(): Array<{ name: string, id: number, items: WithId<IssueLemma>[] }> {
    return this.store.issue.statuses.map(s => {
      return {
        ...s,
        items: _(this.filteredIssues)
          .filter(i => i.status === s.id)
          .orderBy('order')
          .value()
      }
    })
  }

  get lemmaEditors() {
    return _(this.issueLemmas)
      .map(l => l.editor)
      .filter(notEmpty)
      .uniqBy('userId')
      .map(id => store.editors.getById(id))
      .filter(notEmpty)
      .value()
  }

  get lemmaAuthors() {
    return _(this.issueLemmas)
      .map(l => l.author)
      .filter(notEmpty)
      .uniqBy('author')
      .map(id => store.authors.getById(id))
      .filter(notEmpty)
      .value()
  }

  get lemmaLabels(): LemmaLabel[] {
    return _(this.issueLemmas)
      .flatMap(l => l.labels)
      .uniq()
      .map(id => store.issue.getLabelById(id || -1))
      .filter(notEmpty)
      .value()
  }

  get lemmaText(): { text: string, description: string, issueLemmaId: string }[] {
    // FIXME:
    return []
    // return this.issueLemmas
    //   .map(l => ({
    //     text: l.lemma + ', ' + l.lemma.firstName,
    //     description: (l.lemma as any).description,
    //     issueLemmaId: l.id
    //   }))
  }

  get autocompleteItems() {
    return [
      ...this.lemmaEditors.map(e => ({
        type: 'editor',
        text: e.name,
        id: e.userId,
        value: 'editor:' + e.userId,
        image: '', // e.profilePicture,
        description: 'Redakteur'
      })),
      ...this.lemmaAuthors.map(e => ({
        type: 'author',
        text: e.name,
        id: e.userId,
        value: 'author:' + e.userId,
        description: 'Autor'
      })),
      ...this.lemmaLabels.map(e => ({
        type: 'label',
        text: e.name,
        id: e.id,
        value: 'label:' + e.id,
        color: (e as any).color || 'orange',
        description: 'Label'
      })),
      ...this.lemmaText.map(e => ({
        type: 'text',
        text: e.text,
        id: e.issueLemmaId,
        value: 'lemma:' + e.issueLemmaId,
        description: e.description
      }))
    ]
  }

  get filteredIssues(): WithId<IssueLemma>[] {
    return this.issueLemmas.filter(issue => {
      return this.searchItems.length === 0 || (
        this.searchItems.find(si => si.type === 'editor' && si.id === issue.editor) !== undefined ||
        this.searchItems.find(si => si.type === 'author' && si.id === issue.author) !== undefined ||
        this.searchItems.find(si => si.type === 'label' && issue.labels !== undefined && issue.labels.find(l => l === si.id) !== undefined) !== undefined ||
        this.searchItems.find(si => si.type === 'text' && si.id === issue.id) !== undefined
      )
    })
  }

  openLemma(l: IssueLemma) {
    store.settings = { ...store.settings, selectedIssueLemma: l }
    this.selectedLemma = l
  }

}
</script>
<style lang="stylus">

</style>
<style lang="stylus" scoped>
.selected
  background rgba(0,0,0,.1)

.filter-autocomplete-item
  border-radius 7px
  &::before
    border-radius 7px

.issue-selector
  height 70vh
</style>