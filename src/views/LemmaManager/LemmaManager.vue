<template>
  <div
    @keydown="onKeyDown"
    tabindex="-1"
    class="fill-height"
    ref="container"
  >
    <!-- GLOBAL SEARCH -->
    <global-search
      v-model="showSearchDialog"
    />
    <!-- LOBID HOVER PREVIEW -->
    <v-menu
      v-if="lobidPreviewGnds.length > 0"
      :value="lobidPreviewGnds.length > 0"
      @input="lobidPreviewGnds = []"
      :position-x="previewPopupCoords[0]"
      :position-y="previewPopupCoords[1]"
      :close-on-content-click="false"
      absolute
      offset-y
      offset-x
      content-class="soft-shadow">
      <v-card color="background lighten-1" class="rounded-lg pr-2 pb-2 pl-2 pt-0">
        <v-card-text class="pb-3 pl-0 pt-4 pr-0">
          <lobid-preview-card :limit="3" :gnd="lobidPreviewGnds" />
        </v-card-text>
      </v-card>
    </v-menu>
    <!-- GHOST IMAGE WHEN DRAGGING -->
    <drag-image
      ref="dragGhost"
      :max-items="5"
      :rows="selectedRows" />
    <!-- ADD LEMMA -->
    <v-dialog
      :value="showAddLemmaDialog === true"
      scrollable
      @input="showAddLemmaDialog = $event"
      max-width="1000px">
      <lemma-add
        color="background"
        v-if="showAddLemmaDialog"
        @confirm="addLemma"
        @cancel="showAddLemmaDialog = false"
      />
    </v-dialog>
    <!-- IMPORT LEMMAS -->
    <v-dialog
      :value="fileToImport.file !== null"
      scrollable
      overlay-color="#000"
      max-width="1000px">
      <lemma-importer
        v-if="fileToImport.file !== null"
        :file-type="fileToImport.file.type"
        :file-name="fileToImport.file.name"
        :buffer="fileToImport.buffer"
        @cancel="fileToImport = { file: null, buffer: null }"
        @confirm="fileToImport = { file: null, buffer: null }"
      />
    </v-dialog>
    <v-app-bar
      data-deskgap-drag="true"
      app
      extended
      style="transition: none"
      :extension-height="filterItems.length * 32 "
      color="background"
      flat>
      <div class="d-flex fill-width flex-row align-stretch align-self-start mt-4">
        <v-btn style="margin-top: -7px" @click="toggleDrawer" tile class="rounded-lg" icon>
          <v-icon>mdi-dock-left</v-icon>
        </v-btn>
        <v-flex shrink align-self-start class="mr-5 lemma-view-title">
          <h1
            v-if="
              store.lemma.selectedLemmaFilterId === null &&
              store.lemma.selectedLemmaIssueId === null &&
              store.lemma.selectedLemmaListId === null">
            Lemmabibliothek
          </h1>
          <h1 v-else-if="store.lemma.selectedLemmaIssueId !== null">
            {{ store.issue.getIssueById(store.lemma.selectedLemmaIssueId).name }}
          </h1>
          <h1
            v-else-if="store.lemma.selectedLemmaListId !== null && store.lemma.getListById(store.lemma.selectedLemmaListId) !== undefined"
            @blur="store.lemma.updateList(store.lemma.selectedLemmaListId, { title: $event.target.textContent })"
            @keyup.enter.prevent.stop="$event.target.blur()"
            @keyup.esc.prevent.stop="cancelUpdateListName"
            v-text="store.lemma.getListById(store.lemma.selectedLemmaListId).title"
            contenteditable="true">
          </h1>
          <h1
            v-else-if="store.lemma.selectedLemmaFilterId !== null"
            @blur="updateLemmaFilterName(store.lemma.selectedLemmaFilterId, $event.target.textContent)"
            @keyup.enter.prevent.stop="$event.target.blur()"
            v-text="store.lemma.getStoredLemmaFilterById(store.lemma.selectedLemmaFilterId).name"
            contenteditable="true">
          </h1>
          <div class="caption mt-1 text-no-wrap">
            <span style="opacity: .7">
              {{ filteredLemmas.length }} Ergebnisse.
              {{ selectedRows.length }} ausgewählt
            </span>
            <v-btn
              v-if="newLemmas.length > 0"
              style="margin-top: -2px"
              rounded
              elevation="0"
              color="primary"
              class="ml-2"
              x-small>
              {{ newLemmas.length }} neu
            </v-btn>
          </div>
        </v-flex>
        <!-- FILTER: TODO: Convert to Component -->
        <v-flex align-self-start class="rounded-lg pa-1 flex-nowrap background darken-2">
          <div
            v-for="(filter, i) in filterItems"
            :key="i">
            <v-card
              flat
              color="transparent"
              class="text-body-2 row row--dense input-no-stroke px-2 py-0 flex-nowrap">
              <div style="max-width: 120px" class="col col-2">
                <v-select
                  :menu-props="{
                    contentClass: 'rounded-lg soft-shadow background darken-2 v-list--nav'
                  }"
                  single-line
                  flat
                  hide-details
                  return-object
                  :items="columns.filter(c => c.filterable === true)"
                  item-text="name"
                  append-icon=""
                  item-value="value"
                  class="text-body-2"
                  v-model="filter.column"
                  dense
                  @input="filterData"
                />
              </div>
              <v-divider class="my-1 mr-1" vertical />
              <div style="max-width: 120px" class="col-2">
                <v-select
                  :menu-props="{
                    contentClass: 'rounded-lg soft-shadow background darken-2 v-list--nav'
                  }"
                  color="background darken-2"
                  single-line
                  flat
                  dense
                  hide-details
                  item-text="name"
                  item-value="value"
                  append-icon=""
                  class="text-body-2"
                  v-model="filter.comparator"
                  :items="comparators"
                  @input="filterData"
                />
              </div>
              <v-divider class="my-1 mr-2" vertical />
              <div
                v-if="isFilterWithInput(filter)"
                class="flex-grow-1">
                <v-select
                  v-if="filter.column.type === 'boolean'"
                  :value="'true'"
                  :items="[ { value: 'true', text: 'Ja' }, { value: 'false', text: 'Nein' } ]"
                  :menu-props="{
                    contentClass: 'rounded-lg soft-shadow background darken-2 v-list--nav'
                  }"
                  color="background darken-2"
                  single-line
                  flat
                  dense
                  hide-details
                  append-icon=""
                  class="text-body-2 mt-1"
                  v-model="filter.query"
                  @input="filterData"
                />
                <v-text-field
                  v-else
                  style="min-width: 60px"
                  @keydown.esc="() => { filter.query = ''; filterData() }"
                  placeholder="Abfrage…"
                  class="text-body-2 mt-1"
                  v-model="filter.query"
                  @input="filterDataDebounced"
                  dense
                  hide-details
                />
              </div>
              <div class="flex-nowrap text-no-wrap" style="margin-top: 3px;">
                <v-btn @click="removeFilterItem(i)" :disabled="filterItems.length === 1 && (filter.query === '' || filter.query === null)" icon small>
                  <v-icon v-if="filterItems.length === 1 && filter.query !== null && filter.query !== ''" style="transform: rotate(45deg)">mdi-plus-circle-outline</v-icon>
                  <v-icon v-else>mdi-minus-circle-outline</v-icon>
                </v-btn>
                <v-btn @click="addFilterItem" icon small>
                  <v-icon>mdi-plus-circle-outline</v-icon>
                </v-btn>
              </div>
            </v-card>
            <v-divider class="mx-1" v-if="filterItems.length > 1 && i !== filterItems.length - 1" />
          </div>
        </v-flex>
        <v-flex
          shrink
          align-self-start
          class="pl-2 pr-0"
          style="margin-top: -3px">
          <v-menu
            min-width="150"
            offset-y
            left
            content-class="soft-shadow scrollable background">
            <template v-slot:activator="{ on, props }">
              <v-btn
                v-on="on"
                v-bind="props"
                tile
                class="rounded-lg"
                icon>
                <v-icon>mdi-dots-horizontal-circle-outline</v-icon>
              </v-btn>
            </template>
            <v-list color="background" class="elevation-0 rounded-lg text-body-2" dense nav>
              <v-list-item @click="showAddLemmaDialog = true" dense>
                <v-list-item-avatar size="15">
                  <v-icon small>mdi-shape-square-plus</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  Lemma hinzufügen…
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="openFileDialog(importFile)" dense>
                <v-list-item-avatar size="15">
                  <v-icon small>mdi-database-import-outline</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  Excel oder CSV importieren…
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-if="store.lemma.selectedLemmaListId !== null"
                @click="deleteList(store.lemma.selectedLemmaListId)">
                <v-list-item-avatar size="15">
                  <v-icon small>mdi-delete-outline</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  Liste löschen
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-if="store.lemma.selectedLemmaFilterId === null && usableFilterItems.length > 0"
                @click="saveFilter" dense>
                <v-list-item-avatar size="15">
                  <v-icon small>mdi-card-search-outline</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  Abfrage sichern…
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-else-if="store.lemma.selectedLemmaFilterId !== null"
                @click="deleteFilter(store.lemma.selectedLemmaFilterId)" dense>
                <v-list-item-avatar size="15">
                  <v-icon small>mdi-delete-outline</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  Diese Abfrage löschen
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-subheader class="pt-0 mt-0">Spalten anzeigen</v-subheader>
            <v-list
              style="max-height: 50vh; overflow: scroll"
              color="background"
              class="elevation-0 rounded-lg text-body-2"
              dense nav>
              <v-list-item
                v-for="column in columns"
                :key="column.value" dense
                @click.prevent.stop="updateColumn(column, { show: !column.show })">
                <v-list-item-avatar size="15">
                  <v-icon v-if="column.show" small>mdi-check</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  {{ column.name }}
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-subheader>Farbschema</v-subheader>
            <theme-toggle class="mx-2 mb-2" />
          </v-menu>
        </v-flex>
        <v-flex shrink align-self-start class="pl-0 ml-0 pr-0" style="margin-top: -3px">
          <v-btn
            @click="showSearchDialog = true"
            tile
            class="rounded-lg"
            icon>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-flex>
        <v-flex
          v-if="!store.lemma.showSideBar"
          shrink
          align-self-start
          class="pl-0 ml-0 pr-3"
          style="margin-top: -3px">
          <v-btn
            v-if="!store.lemma.showSideBar"
            tile
            class="rounded-lg"
            icon
            @click="store.lemma.showSideBar = !store.lemma.showSideBar">
            <v-icon>mdi-dock-right</v-icon>
          </v-btn>
        </v-flex>
      </div>
    </v-app-bar>
    <resizable-drawer
      color="background"
      :card="true"
      :right="true"
      :value="store.lemma.showSideBar">
      <v-btn
        style="position: absolute; right: 0px; top: 5px; z-index: 99"
        width="48"
        height="48"
        tile
        class="rounded-lg mr-2"
        icon
        @click="store.lemma.showSideBar = false">
        <v-icon>mdi-dock-right</v-icon>
      </v-btn>
      <v-overlay
        v-if="selectedRows.length === 0"
        absolute
        color="background">
        <span class="text-body-2">Kein Lemma ausgewählt</span>
      </v-overlay>
      <v-overlay
        v-else-if="selectedRows.length > 1"
        absolute
        color="background">
        <span class="text--background darken-2" style="opacity: .7">{{ selectedRows.length }} Lemmata ausgewählt</span>
      </v-overlay>
      <lemma-detail
        v-else
        :value="selectedRows[0]"
        @close="store.lemma.showSideBar = false"
        @update="updateLemma(selectedRows[0], $event)" />
    </resizable-drawer>
    <v-main class="fill-width fill-height transition-padding">
      <virtual-table
        ref="vTable"
        class="virtual-table text-body-2"
        :columns="columns"
        :sortable-columns="true"
        :row-height="40"
        :height="tableHeight"
        :data="sortedFilteredLemmas"
        @keyup.native.delete="deleteSelectedLemmas"
        @drag:row="dragListener"
        @dblclick:row="store.lemma.showSideBar = !store.lemma.showSideBar"
        @click:cell="onClickCell"
        @click:header="sortLemmas"
        @change-selection="selectedRows = $event"
        @update-columns="columns = $event" >
        <template v-slot:cell="{ item, index, column, value }">
          <template v-if="item[column.value] === 'Not available'"></template>
          <!-- the star column -->
          <template v-else-if="column.value === 'selected'">
            <span v-if="value === true" style="color: var(--v-primary-base)">★</span>
            <span v-if="value === false" style="opacity: .5">☆</span>
          </template>
          <!-- the gnd column -->
          <template v-else-if="column.value === 'gnd'">
            <span style="opacity: .5" v-if="item.gnd.length === 0">
              n. v.
            </span>
            <span
              v-else-if="item.gnd.length > 0"
              @mouseover="onHoverGndCellDebounced($event, item.gnd)">
              {{ item.gnd[0] }}
              <span
                class="badge blue-grey"
                v-if="item.gnd.length > 1"
                v-text="'+' + (item.gnd.length - 1)"
              />
            </span>
          </template>
          <!-- all others -->
          <template v-else-if="value">
            {{ item[column.value] }}
          </template>
          <span style="opacity: .5" v-else-if="!value">
            n. v.
          </span>
        </template>
      </virtual-table>
    </v-main>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import _, { clone } from 'lodash'
import ResizableDrawer from '../lib/ResizableDrawer.vue'
import DragImage from './DragImage.vue'
import LobidPreviewCard from './LobidPreviewCard.vue'
import ThemeToggle from '../ThemeToggle.vue'
import VirtualTable from '../lib/VirtualTable.vue'
import LemmaDetail from './LemmaDetail.vue'
import LemmaAdd from './LemmaAdd.vue'

import { fileToArrayBuffer } from '../../util'
import store from '@/store'
import { LemmaFilterComparator, LemmaRow, LemmaFilterItem, LemmaColumn, ImportablePerson } from '@/types/lemma'
import GlobalSearch from '@/views/GlobalSearch.vue'
import { v4 as uuid } from 'uuid'
import prompt from '@/store/prompt'
import confirm from '@/store/confirm'

@Component({
  components: {
    ResizableDrawer,
    ThemeToggle,
    DragImage,
    LemmaAdd,
    LemmaDetail,
    LobidPreviewCard,
    VirtualTable,
    GlobalSearch,
    LemmaImporter: () => import('./LemmaImporter.vue'),
  }
})
export default class LemmaManager extends Vue {

  @Prop({ default: null }) listId!: string|null

  store = store
  tableHeight = 0

  showAddLemmaDialog = false
  showSearchDialog = false

  previewPopupCoords: [number, number] = [0, 0]
  lobidPreviewGnds: string[] = []
  title = 'Lemmabibliothek'

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      e.stopPropagation()
      this.showSearchDialog = !this.showSearchDialog
    }
  }

  get selectedRows() {
    return store.lemma.selectedLemmas
  }

  set selectedRows(ls) {
    store.lemma.selectedLemmas = ls
  }

  get newLemmas(): LemmaRow[] {
    if (store.lemma.selectedLemmaListId !== null) {
      return Object.values(store.lemma.newLemmasInUserList[store.lemma.selectedLemmaListId] || {})
    } else {
      return []
    }
  }

  filteredLemmas: LemmaRow[] = this.store.lemma.lemmas
  filterDataDebounced = _.debounce(this.filterData, 150)

  fileToImport = {
    file: null as null|File,
    buffer: null as null|ArrayBuffer
  }

  get columns() {
    return store.lemma.columns
  }

  set columns(cs) {
    store.lemma.columns = cs
  }

  updateColumn(c: LemmaColumn, u: Partial<LemmaColumn>) {
    this.columns = this.columns.map(cl => {
      return cl.value === c.value ? { ...cl, ...u } : cl
    })
  }

  comparators: LemmaFilterComparator[] = [
    {
      icon: '∈',
      name: 'enthält',
      value: 'contains',
      predicate: (e: string|number|null, q: string) => String(e).toLocaleLowerCase().indexOf(q) > -1
    },
    {
      name: 'enthält nicht',
      value: 'not-contains',
      icon: '∉',
      predicate: (e: string|number|null, q: string) => String(e).toLocaleLowerCase().indexOf(q) === -1
    },
    {
      name: 'ist',
      value: 'equals',
      icon: '=',
      predicate: (e: string|number|null, q: string|number|null) => String(e).toLocaleLowerCase() === String(q).toLocaleLowerCase()
    },
    {
      name: 'ist nicht',
      value: 'not',
      icon: '≠',
      predicate: (e: string|number|null, q: string|number|null) => String(e).toLocaleLowerCase() !== String(q).toLocaleLowerCase()
    },
    {
      name: 'ist vorhanden',
      value: 'exists',
      icon: '.',
      predicate: (e: string|number|null|number[], q: unknown) => e !== null && e !== undefined && (Array.isArray(e) && e.length !== 0)
    },
    {
      name: 'ist nicht vorhanden',
      value: 'exists-not',
      icon: '.',
      predicate: (e: string|number|null|number[], q: unknown) => e === null || e === undefined || (Array.isArray(e) && e.length === 0)
    },
    {
      name: 'größer als',
      value: 'gt',
      icon: '>',
      predicate: (e: number, q: number) => e > q
    },
    {
      name: 'größer gleich',
      value: 'gte',
      icon: '≥',
      predicate: (e: number, q: number) => e >= q
    },
    {
      name: 'kleiner als',
      value: 'lt',
      icon: '<',
      predicate: (e: number, q: number) => e < q
    },
    {
      name: 'kleiner gleich',
      value: 'lte',
      icon: '≤',
      predicate: (e: number, q: number) => e <= q
    },
  ]

  isFilterWithInput(f: LemmaFilterItem): boolean {
    return f.comparator !== 'exists' && f.comparator !== 'exists-not'
  }

  defaultFilterItem = {
    column: store.lemma.defaultColumns[1],
    comparator: this.comparators[0].value,
    query: ''
  }

  filterItems: LemmaFilterItem[] = [ clone(this.defaultFilterItem) ]

  cancelUpdateListName(event: KeyboardEvent) {
    if (
      store.lemma.selectedLemmaListId !== null &&
      event.target instanceof HTMLElement
    ) {
      event.target.textContent = store.lemma.getListById(store.lemma.selectedLemmaListId)?.title || 'Listenname'
      event.target.blur()
    }
  }

  async updateLemma(l: LemmaRow, u: Partial<LemmaRow>) {
    // update selected lemma (cached)
    if (this.selectedRows.length > 0 && this.selectedRows[0].id === l.id) {
      this.selectedRows[0] = { ...l, ...u }
    }
    // update store and server
    await store.lemma.updateLemmas([ l ], u)
    this.filterData()
  }

  async deleteList(id: number) {
    const list = store.lemma.lemmaLists.find(l => l.id === id)
    if (list !== undefined) {
      if (await confirm.confirm(`Wollen Sie die Liste ”${ list.title }” wirklich löschen? Die Lemmata in dieser Liste werden nicht gelöscht.`)) {
        await store.lemma.deleteLemmaList(id)
      }
    }
  }

  updateTableHeight() {
    this.tableHeight = this.getTableHeight()
  }

  mounted() {
    this.tableHeight = this.getTableHeight()
    window.addEventListener('resize', this.updateTableHeight)
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.updateTableHeight)
  }

  toggleDrawer() {
    this.store.settings = {...this.store.settings, lemmaManagerNavVisible: !this.store.settings.lemmaManagerNavVisible}
  }

  getTableHeight() {
    return (window.innerHeight - 70) - (this.filterItems.length * 35)
  }

  sortLemmas(c: LemmaColumn) {
    const sort = (c.sort === null || c.sort === undefined || c.sort === 'desc')
      ? 'asc'
      : 'desc'
    this.columns = this.columns.map(cO => ({ ...cO, sort: cO.value === c.value ? sort : undefined }))
  }

  get sortedFilteredLemmas(): LemmaRow[] {
    const sortByColumn = this.columns.find(c => c.sort !== undefined && c.sort !== null)
    if (sortByColumn !== undefined) {
      return _.orderBy(this.filteredLemmas, sortByColumn.value, sortByColumn.sort || 'asc')
    } else {
      return this.filteredLemmas
    }
  }

  addLemma(l: ImportablePerson) {
    this.showAddLemmaDialog = false
    this.store.lemma.addLemma(l)
  }

  async removeLemmasFromList(l: LemmaRow[]) {
    // FIXME:
    // backend method missing
    await this.store.lemma.updateLemmas(l, { list: undefined })
  }

  async removeLemmasFromIssue(l: LemmaRow[]) {
    // FIXME:
    // backend method missing
    // await this.store.issue.deleteLemma(l)
  }

  async deleteSelectedLemmas(e: KeyboardEvent) {
    const indexOfLastSelected = this.sortedFilteredLemmas.findIndex(l => _.last(this.selectedRows)?.id === l.id)
    // A list is selected
    // remove from list.
    if (store.lemma.selectedLemmaListId !== null) {
      const msg = `Wollen Sie wirklich ${ this.selectedRows.length } Lemma(ta) aus dieser Liste entfernen?`
      if (await confirm.confirm(msg)) {
        this.removeLemmasFromList(this.selectedRows)
        // select the next row after the deleted ones
        if (indexOfLastSelected > -1) {
          this.selectedRows = [ this.sortedFilteredLemmas[indexOfLastSelected + 1] ]
        }
      }
    // An issue is selected
    // remove from issue
    } else if (store.lemma.selectedLemmaIssueId !== null) {
      const msg = `Wollen Sie wirklich ${ this.selectedRows.length } Lemma(ta) aus dieser Abgabe entfernen?`
      if (await confirm.confirm(msg)) {
        this.removeLemmasFromIssue(this.selectedRows)
        // select the next row after the deleted ones
        if (indexOfLastSelected > -1) {
          this.selectedRows = [ this.sortedFilteredLemmas[indexOfLastSelected + 1] ]
        }
      }
    } else {
    // No issue or list is selected
    // => actually delete it
      const msg = `Wollen Sie wirklich ${ this.selectedRows.length } Lemma(ta) in den Papierkorb legen? Dies kann später rückgängig gemacht werden.`
      if (await confirm.confirm(msg)) {
        await this.store.lemma.deleteLemma(this.selectedRows.map(r => r.id))
        // select the next row after the deleted ones
        if (indexOfLastSelected > -1) {
          this.selectedRows = [ this.sortedFilteredLemmas[indexOfLastSelected + 1] ]
        }
      }
    }
  }

  scrollToNextSelectedLemma() {
    if (this.selectedRows.length > 0) {
      const first = this.selectedRows[0]
      const i = this.sortedFilteredLemmas.findIndex(f => f.id === first.id);
      (this.$refs.vTable as Vue).$el.querySelector('.v-virtual-scroller')!.scrollTo({
        top: i * 42,
        behavior: 'smooth'
      })
    }
  }

  @Watch('store.lemma.selectedLemmaFilterId', { immediate: true })
  async onSelectLemmaFilter(id: string|null) {
    if (id !== null) {
      const l = store.lemma.getStoredLemmaFilterById(id)
      if (l !== undefined) {
        this.filterItems = l.filterItems
        this.filterData()
      }
    } else {
      this.filterItems = [ clone(this.defaultFilterItem) ]
      this.filterData()
    }
  }

  async deleteFilter(id: string|null) {
    if (id !== null) {
      store.lemma.deleteStoredLemmaFilter(id)
    }
  }

  updateLemmaFilterName(id: string, name: string) {
    store.lemma.updateStoredLemmaFilter(id, { name })
  }

  async importFile(f: File) {
    const b = await fileToArrayBuffer(f)
    this.fileToImport = {
      file: f,
      buffer: b
    }
  }

  openFileDialog(cb: (f: File) => unknown) {
    let input: HTMLInputElement|null = document.createElement('input')
    input.type = 'file'
    input.accept = 'text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    input.addEventListener('change', () => {
      if (input !== null) {
        if (input.files !== null && input.files[0] !== undefined) {
          cb(input.files[0])
        }
        input = null
      }
    })
    input.click()
  }

  onClickCell(item: LemmaRow, e: MouseEvent, prop: keyof LemmaRow, index: number) {
    if (prop === 'selected') {
      this.updateLemma(item, { selected: !item.selected })
    }
  }

  // PREVIEW
  async onHoverGndCell(e: MouseEvent, gnd: string[]) {
    if (e.target instanceof HTMLElement) {
      this.previewPopupCoords = [ e.target.getBoundingClientRect().left, e.target.getBoundingClientRect().bottom ]
      this.lobidPreviewGnds = gnd
    }
  }

  onHoverGndCellDebounced = _.debounce(this.onHoverGndCell, 300)

  dragListener(item: LemmaRow, ev: DragEvent) {
    let dragImage: null|HTMLElement = null
    if (this.selectedRows.findIndex(r => r.id === item.id) === -1) {
      this.selectedRows.push(item)
    }
    if (ev.dataTransfer) {
      dragImage = ((this.$refs.dragGhost as Vue).$el) as HTMLElement
      ev.dataTransfer.effectAllowed = 'move'
      ev.dataTransfer.setData('text/plain', JSON.stringify(this.selectedRows))
      if (dragImage !== null) {
        ev.dataTransfer.setDragImage(dragImage, 0, 0)
      }
    }
  }

  async saveFilter() {
    const name = await prompt.prompt('Filter speichern', { placeholder: 'Filtername eingeben…' })
    if (name !== null) {
      store.lemma.storedLemmaFilters = [ ...store.lemma.storedLemmaFilters, {
        name: name,
        id: uuid(),
        filterItems: this.filterItems
      }]
    }
  }

  addFilterItem() {
    this.filterItems.push(clone(this.defaultFilterItem))
  }

  removeFilterItem(i: number) {
    if (this.filterItems.length === 1) {
      this.filterItems[0].query = ''
    } else {
      this.filterItems.splice(i, 1)
    }
    this.filterData()
  }

  get usableFilterItems() {
    return this.filterItems
      .filter(i => i.query.trim() !== '' && i.query !== null)
      .map(i => ({...i, query: i.query.toLocaleLowerCase()}))
  }

  @Watch('store.lemma.lemmas')
  filterData() {
    const comparators = _.keyBy(this.comparators, 'value')
    if (this.usableFilterItems.length === 0) {
      this.filteredLemmas = store.lemma.lemmas
    } else {
      console.time('filter lemmas')
      const filterItemsByColumn = _.groupBy(this.usableFilterItems, (i) => i.column.value + '__' + i.comparator)
      this.filteredLemmas = store.lemma.lemmas.filter(d => {
        return _.every(filterItemsByColumn, (fs) => {
          if (fs.length === 1) {
            // only one filter item for this column
            return comparators[fs[0].comparator].predicate(d[fs[0].column.value], fs[0].query)
          } else {
            // multiple filter items for query => use some (equivalent to "OR")
            return fs.some(f => comparators[f.comparator].predicate(d[f.column.value], f.query))
          }
        })
      })
      console.timeEnd('filter lemmas')
    }
  }

}
</script>
<style lang="stylus">

.input-no-stroke .v-text-field>.v-input__control>.v-input__slot:after, .v-text-field>.v-input__control>.v-input__slot:before
  display none

.virtual-table
  border 0 !important
  outline 0 !important
  .v-virtual-scroll
    background var(--v-background-darken1)

.virtual-table .table-row
  transition background-color .1s
  &.selected
    border-radius 5px
    background-color var(--v-background-lighten1) !important
    box-shadow inset 0px 0px 0px 3px var(--v-secondary-lighten5)

.virtual-table:focus .table-row.selected
  // background-color var(--v-background-lighten1) !important
  // box-shadow inset 0px 0px 0px 3px var(--v-primary-base) !important
  background-color var(--v-secondary-base) !important
  color white

.virtual-table .table-row
  border-bottom 1px solid var(--v-background-lighten1) !important

.virtual-table .table-cell,
.virtual-table .header-cell
  padding 0 5px

.status-bar
  overflow hidden
  position fixed
  bottom 10px
  right 0px

.transition-padding
  transition: none

.lemma-view-title
  max-width 50%

.lemma-view-title h1
  font-size 1.7em
  min-width 150px
  max-width 250px
  white-space nowrap
  overflow hidden
  text-overflow ellipsis
  &:focus
    text-overflow clip

[contenteditable="true"]:hover
  border-radius 3px
  box-shadow inset 0px 0px 0px 1px var(--v-secondary-lighten5)
</style>
