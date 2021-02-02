<template>
  <div class="fill-height" ref="container">
    <v-menu
      :value="Object.keys(lobidPreviewHtmlFragments).length > 0"
      @input="lobidPreviewHtmlFragments = {}"
      :position-x="previewPopupCoords[0]"
      :close-on-content-click="false"
      absolute
      offset-y
      offset-x
      content-class="soft-shadow"
      :position-y="previewPopupCoords[1]">
      <lobid-preview-card :fragments="lobidPreviewHtmlFragments" />
    </v-menu>
    <drag-image
      ref="dragGhost"
      :max-items="5"
      :rows="selectedRows" />
    <v-dialog
      :value="addLemmaDialog === true"
      scrollable
      @input="addLemmaDialog = $event"
      max-width="1000px">
      <lemma-add
        v-if="addLemmaDialog"
        @confirm="addLemma"
        @cancel="addLemmaDialog = false"
      />
    </v-dialog>
    <v-dialog
      :value="fileToImport.file !== null"
      @input="addLemmaDialog = $event"
      scrollable
      overlay-color="#000"
      max-width="1000px">
      <lemma-importer
        v-if="fileToImport.file !== null"
        :file-type="fileToImport.file.type"
        :file-name="fileToImport.file.name"
        :buffer="fileToImport.buffer"
        @cancel="fileToImport = { file: null, buffer: null }"
        @confirm="log"
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
      <div class="d-flex full-width flex-row align-stretch align-self-start mt-4">
        <v-btn style="margin-top: -7px" @click="toggleDrawer" tile class="rounded-lg" icon>
          <v-icon>mdi-dock-left</v-icon>
        </v-btn>
        <v-flex shrink align-self-start class="mr-5">
          <h1
            v-bind="{ contenteditable: store.settings.selectedLemmaFilter !== '-1'}"
            v-text="title"
            @input="updateLemmaFilterName($event)"
            class="mb-0 editable-title" />
          <div class="caption mt-1 text-no-wrap">
            <span style="opacity: .7">{{ filteredData.length }} Ergebnisse</span>
            <v-btn style="margin-top: -2px" rounded class="ml-2 pl-0 pr-2" small text @click="scrollToNextSelectedLemma" v-if="selectedRows.length > 0">
              <v-badge class="ml-0" :content="selectedRows.length" inline></v-badge> ausgewählt
            </v-btn>
          </div>
        </v-flex>
        <v-flex align-self-start class="rounded-lg pa-1 flex-nowrap background darken-2">
          <div
            v-for="(filter, i) in filterItems"
            :key="i">
            <v-card
              flat
              color="transparent"
              class="text-body-2 row row--dense input-no-stroke px-3 py-0">
              <div style="max-width: 120px" class="col col-2">
                <v-select
                  single-line
                  flat
                  hide-details
                  return-object
                  :items="columns.filter(c => c.filterable === true)"
                  @input="filterData"
                  item-text="name"
                  append-icon="mdi-chevron-down"
                  item-value="value"
                  class="text-body-2"
                  v-model="filter.column"
                  dense
                />
              </div>
              <v-divider class="my-1 mr-2" vertical />
              <div style="max-width: 120px" class="col-2">
                <v-select
                  single-line
                  flat
                  dense
                  hide-details
                  @input="filterData"
                  item-text="name"
                  item-value="value"
                  append-icon="mdi-chevron-down"
                  class="text-body-2"
                  v-model="filter.comparator"
                  :items="comparators"
                />
              </div>
              <v-divider class="my-1 mr-2" vertical />
              <div class="flex-grow-1">
                <v-text-field
                  @keydown.esc="filter.query = ''"
                  placeholder="Abfrage…"
                  class="text-body-2 mt-1 ml-2"
                  v-model="filter.query"
                  @input="filterDataDebounced"
                  dense
                  hide-details
                />
              </div>
              <div style="margin-top: 3px">
                <v-btn @click="removeFilterItem(i)" :disabled="filterItems.length === 1 && (filter.query === '' || filter.query === null)" icon small>
                  <v-icon v-if="filterItems.length === 1 && filter.query !== null && filter.query !== ''" style="transform: rotate(45deg)">mdi-plus-circle-outline</v-icon>
                  <v-icon v-else>mdi-minus-circle-outline</v-icon>
                </v-btn>
                <v-btn @click="addFilterItem" icon small>
                  <v-icon>mdi-plus-circle-outline</v-icon>
                </v-btn>
              </div>
            </v-card>
            <v-divider class="mx-2" v-if="filterItems.length > 1 && i !== filterItems.length - 1" />
          </div>
        </v-flex>
        <v-flex shrink align-self-start class="pl-4 pr-1" style="margin-top: -3px">
          <v-menu
            min-width="150"
            offset-y
            left
            content-class="soft-shadow scrollable">
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
            <v-list color="background lighten-1 elevation-0" class="text-body-2" dense nav>
              <v-list-item @click="addLemmaDialog = true" dense>
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
                v-if="store.settings.selectedLemmaFilter === '-1'"
                :disabled="usableFilterItems.length === 0"
                @click="saveFilter" dense>
                <v-list-item-avatar size="15">
                  <v-icon small>mdi-card-search-outline</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  Abfrage sichern…
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-else
                @click="deleteFilter(store.settings.selectedLemmaFilter)" dense>
                <v-list-item-avatar size="15">
                  <v-icon small>mdi-delete-outline</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  Diese Abfrage löschen
                </v-list-item-content>
              </v-list-item>
              <v-subheader>Spalten anzeigen</v-subheader>
              <v-list-item @click.prevent.stop="column.show = !column.show" v-for="column in columns" :key="column.value" dense>
                <v-list-item-avatar size="15">
                  <v-icon v-if="column.show" small>mdi-check</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  {{ column.name }}
                </v-list-item-content>
              </v-list-item>
              <v-subheader>Farbschema</v-subheader>
              <theme-toggle />
            </v-list>
          </v-menu>
        </v-flex>
        <v-flex
          v-if="!showSideBar"
          shrink
          align-self-start
          class="pl-0 ml-0 pr-3"
          style="margin-top: -3px">
          <v-btn
            @click="showSideBar = !showSideBar"
            v-if="!showSideBar"
            tile
            class="rounded-lg"
            icon>
            <v-icon>mdi-dock-right</v-icon>
          </v-btn>
        </v-flex>
      </div>
    </v-app-bar>
    <resizable-drawer
      :card="true"
      :right="true"
      :value="showSideBar">
      <v-overlay
        v-if="selectedRows.length === 0"
        absolute
        color="background">
        <span style="opacity: .7">Kein Lemma ausgewählt</span>
      </v-overlay>
      <v-overlay
        v-else-if="selectedRows.length > 1"
        absolute
        color="background">
        <span style="opacity: .7">{{ selectedRows.length }} Lemmata ausgewählt</span>
      </v-overlay>
      <lemma-detail
        @close="showSideBar = false"
        v-else
        :value="selectedRows[0]" />
    </resizable-drawer>
    <v-main class="full-width fill-height transition-padding">
      <virtual-table
        ref="vTable"
        class="virtual-table text-body-2"
        :columns="columns"
        :sortable-columns="true"
        :row-height="40"
        @keyup.native.delete="deleteSelectedLemmas"
        @drag:row="dragListener"
        @dblclick:row="showSideBar = !showSideBar"
        @click:cell="onClickCell"
        @click:header="sortLemmas"
        @mouseover:cell="onHoverCellDebounced"
        @change-selection="selectedRows = $event"
        @update-columns="columns = $event"
        :height="tableHeight"
        :data="filteredData">
        <template v-slot:cell="{ item, index, column, value }">
          <!-- the star column -->
          <template v-if="column.value === 'starred'">
            <span v-if="value === true" style="color: var(--v-primary-base)">★</span>
            <span v-if="value === false" style="opacity: .5">☆</span>
          </template>
          <!-- the gnd column -->
          <template v-else-if="column.value === 'gnd'">
            <span style="opacity: .5" v-if="item.gnd.length === 0">
              n. v.
            </span>
            <template v-else-if="item.gnd.length > 0">
              {{ item.gnd[0] }}
            </template>
            <span
              class="badge blue-grey"
              v-if="item.gnd.length > 1"
              v-text="'+' + (item.gnd.length - 1)"
            />
          </template>
          <!-- all others -->
          <template v-else>
            {{ item[column.value] }}
          </template>
        </template>
      </virtual-table>
    </v-main>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import _, { clone } from 'lodash'
import ResizableDrawer from '../lib/ResizableDrawer.vue'
import LemmaImporter from './LemmaImporter.vue'
import DragImage from './DragImage.vue'
import LobidPreviewCard from './LobidPreviewCard.vue'
import ThemeToggle from '../ThemeToggle.vue'
import VirtualTable from '../lib/VirtualTable.vue'
import LemmaDetail from './LemmaDetail.vue'
import LemmaAdd from './LemmaAdd.vue'

import { fileToArrayBuffer } from '../../util'
import store from '../../store'
import { Lemma } from '../../api'
import { LemmaFilterComparator, LemmaRow, LemmaFilterItem, LemmaColumn } from '@/types/lemma'
import { v4 as uuid } from 'uuid'
import * as lobidService from '../../service/lobid'
import prompt from '@/store/prompt'
import confirm from '@/store/confirm'

@Component({
  components: {
    ResizableDrawer,
    LemmaImporter,
    ThemeToggle,
    DragImage,
    LemmaAdd,
    LemmaDetail,
    LobidPreviewCard,
    VirtualTable
  }
})
export default class LemmaManager extends Vue {

  @Prop({ default: null }) listId!: string|null

  store = store
  log = console.log

  tableHeight = 0
  addLemmaDialog = false
  showSideBar = false

  previewPopupCoords: [number, number] = [0, 0]
  lobidPreviewHtmlFragments: { [gnd: number]: {html: string, selected: boolean} } = {}

  selectedRows: LemmaRow[] = []
  title = 'Lemmabibliothek'

  filteredData: LemmaRow[] = this.store.lemma.lemmas
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

  defaultFilterItem = {
    column: store.lemma.defaultColumns[0],
    comparator: this.comparators[0].value,
    query: ''
  }

  filterItems: LemmaFilterItem[] = [ clone(this.defaultFilterItem) ]

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

  sortLemmas(l: LemmaColumn) {
    const sort = (l.sort === null || l.sort === undefined || l.sort === 'desc')
      ? 'asc'
      : 'desc'
    this.columns = this.columns.map(c => ({ ...c, sort: c.value === l.value ? sort : undefined }))
    this.filteredData = _.orderBy(this.filteredData, l.value, sort)
  }

  addLemma(l: Lemma) {
    this.store.lemma.addLemma(l)
  }

  async deleteSelectedLemmas() {
    const msg = `Wollen Sie wirklich ${ this.selectedRows.length } Lemma(ta) in den Papierkorb legen? Dies kann später rückgängig gemacht werden.`
    if (await confirm.confirm(msg)) {
      console.log('DELETE!')
    }
  }

  scrollToNextSelectedLemma() {
    if (this.selectedRows.length > 0) {
      const first = this.selectedRows[0]
      const i = this.filteredData.findIndex(f => f.id === first.id);
      (this.$refs.vTable as Vue).$el.querySelector('.v-virtual-scroller')!.scrollTo({
        top: i * 42,
        behavior: 'smooth'
      })
    }
  }

  @Watch('store.settings.selectedLemmaFilter', { immediate: true })
  async onSelectLemmaFilter(id: string) {
    if (id !== '-1') {
      const lf = store.settings.storedLemmaFilters.find(lf => lf.id === id)
      if (lf !== undefined) {
        this.title = lf.name
        this.filterItems = lf.filterItems
        await this.$nextTick()
        this.filterData()
      }
    } else {
      this.title = 'Lemmabibliothek'
      this.filterItems = [ clone(this.defaultFilterItem) ]
      await this.$nextTick()
      this.filterData()
    }
  }

  async deleteFilter(id: string) {
    const lf = store.settings.storedLemmaFilters.find(lf => lf.id === id)
    if (lf !== undefined && await confirm.confirm(`Die Abfrage ”${ lf.name }” löschen?`)) {
      store.settings = {
        ...store.settings,
        selectedLemmaFilter: '-1',
        storedLemmaFilters: store.settings.storedLemmaFilters.filter(lf => lf.id !== id)
      }
    }
  }

  updateLemmaFilterName(e: Event) {
    const t = (e.target as HTMLElement).textContent || ''
    store.settings = {
      ...store.settings,
      storedLemmaFilters: store.settings.storedLemmaFilters.map((f, i) => {
        if (f.id === store.settings.selectedLemmaFilter) {
          return {...f, name: t}
        } else {
          return f
        }
      })
    }
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
    // const s = store.lemma.getMostSimilarLemmas(item)
    // console.log(_.take(s, 10))
    if (prop === 'starred') {
      item.starred = !item.starred
      store.lemma.updateLemmaById(item.id, { starred: !item.starred })
    }
  }

  // PREVIEW
  async onHoverCell(item: LemmaRow, e: MouseEvent, prop: keyof LemmaRow, index: number) {
    if (prop === 'gnd') {
      if (e.target instanceof HTMLElement) {
        this.previewPopupCoords = [ e.target.getBoundingClientRect().left, e.target.getBoundingClientRect().bottom ]
        const fakeIds = _.take([ 118624822, 118540238, 118529579], item.gnd.length)
        const results = await lobidService.getPreview(fakeIds)
        this.lobidPreviewHtmlFragments = fakeIds.reduce((m, e, i) => {
          m[e] = { html: results[i], selected: false}
          return m
        }, {} as { [key: number]: {html: string, selected: boolean} })
      }
    }
  }

  onHoverCellDebounced = _.debounce(this.onHoverCell, 300)

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
      this.store.settings = {
        ...this.store.settings,
        storedLemmaFilters: [
          ...this.store.settings.storedLemmaFilters,
          {
            name: name,
            id: uuid(),
            filterItems: this.filterItems
          }
        ]
      }
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
      this.filteredData = store.lemma.lemmas
    } else {
      console.time('filter lemmas')
      const filterItemsByColumn = _.groupBy(this.usableFilterItems, (i) => i.column.value + '__' + i.comparator)
      this.filteredData = store.lemma.lemmas.filter(d => {
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

[contenteditable="true"]:hover
  border-radius 3px
  box-shadow inset 0px 0px 0px 1px var(--v-secondary-lighten5)

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
  background-color var(--v-background-lighten1) !important
  box-shadow inset 0px 0px 0px 3px var(--v-primary-base) !important

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

.editable-title
  min-width 150px
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:focus
    text-overflow clip
</style>
