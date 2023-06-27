<template>
  <div
    @keydown="onKeyDown"
    tabindex="-1"
    class="fill-height"
    ref="container"
  >
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
      content-class="align-self-start"
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
      v-model="importerOpened"
      hide-overlay
      fullscreen
      >
      <lemma-import-manager/>
    </v-dialog>
    <v-app-bar
      data-deskgap-drag="true"
      app
      height="79"
      :style="{transition: 'none', padding: `${toolbarPaddingY}px 0`}"
      color="background darken-1"
      flat>
      <div class="d-flex fill-width flex-row align-stretch align-self-start">
        <v-btn v-if="!store.settings.showNavDrawer" style="margin-top: -7px" @click="toggleDrawer" tile class="rounded-lg" icon>
          <v-icon>mdi-dock-left</v-icon>
        </v-btn>
        <v-flex shrink align-self-start class="mr-5 lemma-view-title">
          <h1
            v-if="
              store.lemma.selectedLemmaFilterId === null &&
              store.lemma.selectedLemmaIssueId === null &&
              lemmaListId === null">
            Lemmabibliothek
          </h1>
          <h1 v-else-if="store.lemma.selectedLemmaIssueId !== null">
            {{ store.issue.getIssueById(store.lemma.selectedLemmaIssueId).name }}
          </h1>
          <h1
            v-else-if="selectedList !== null"
            @blur="updateListName"
            @keyup.enter.prevent.stop="$event.target.blur()"
            @keyup.esc.prevent.stop="cancelUpdateListName"
            v-text="selectedList.title"
            contenteditable="true">
          </h1>
          <h1
            v-else-if="store.lemma.selectedLemmaFilterId !== null"
            @blur="updateLemmaFilterName(store.lemma.selectedLemmaFilterId, $event.target.textContent)"
            @keyup.enter.prevent.stop="$event.target.blur()"
            v-text="store.lemma.getStoredLemmaFilterById(store.lemma.selectedLemmaFilterId).name"
            contenteditable="true">
          </h1>
          <span class="caption text-no-wrap">
            <v-btn
              v-if="newLemmas.length > 0"
              style="margin-top: -2px; letter-spacing: .1em"
              rounded
              elevation="0"
              color="primary"
              class="mr-1 font-weight-bold"
              x-small>
              {{ newLemmas.length }} NEU
            </v-btn>
            <span style="opacity: .7">
              {{ filteredLemmas.length }} Ergebnisse.
              {{ selectedRows.length }} ausgewählt
            </span>
          </span>
        </v-flex>
        <v-spacer />
        <v-flex shrink align-self-start class="pl-0 ml-0 pr-0" style="margin-top: -5px">
          <v-btn
            @click="store.showSearchDialog = true"
            tile
            class="rounded-lg"
            icon>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-flex>
        <v-flex
          shrink
          align-self-start
          class="pl-0 ml-0 pr-0"
          style="margin-top: -5px">
          <v-btn
            tile
            @click="store.settings = { ...store.settings, showLemmaFilter: !store.settings.showLemmaFilter}"
            :color="store.settings.showLemmaFilter ? 'primary' : undefined"
            class="rounded-lg"
            icon>
            <v-icon>mdi-filter-variant</v-icon>
          </v-btn>
        </v-flex>
        <v-flex
          shrink
          align-self-start
          class="pr-0"
          style="margin-top: -5px">
          <v-menu
            min-width="150"
            offset-y
            left
            content-class="soft-shadow scrollable background rounded-lg">
            <template v-slot:activator="{ on, props }">
              <v-btn
                v-on="on"
                v-bind="props"
                tile
                data-testid="lemma_menu_btn"
                class="rounded-lg"
                icon>
                <v-icon>mdi-dots-horizontal-circle-outline</v-icon>
              </v-btn>
            </template>
            <v-list color="background" class="elevation-0 rounded-lg text-body-2 x-dense" dense nav>
              <v-list-item @click="showAddLemmaDialog = true" dense>
                <v-list-item-avatar size="15">
                  <v-icon small>mdi-shape-square-plus</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  Lemma hinzufügen…
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="importerOpened = true" dense>
                <v-list-item-avatar size="15">
                  <v-icon small>mdi-database-import-outline</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  Excel oder CSV importieren…
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                test-id="lemma-list-delete-btn"
                v-if="lemmaListId !== null"
                @click="deleteList(lemmaListId)">
                <v-list-item-avatar size="15">
                  <v-icon small>mdi-delete-outline</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  Liste löschen
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-if="store.lemma.selectedLemmaFilterId === null && Object.keys(store.lemma.currentFilters).length > 0"
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
            <v-divider />
            <div class="caption muted px-3 pt-2">Spalten anzeigen</div>
            <v-list
              style="max-height: 50vh; overflow: scroll"
              color="background"
              class="elevation-0 rounded-lg text-body-2 mb-0 pb-0 x-dense"
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
            <v-divider class="mt-0 pt-0" />
            <div class="caption muted px-3 pt-2">Farbschema</div>
            <theme-toggle class="mx-2 mb-2" />
            <v-divider />
            <v-list color="background" class="elevation-0 rounded-lg text-body-2 x-dense" dense nav>
              <v-list-item @click="() => store.logOut()" dense>
                <v-list-item-avatar size="15">
                  <v-icon small>mdi-power</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  Ausloggen
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-flex>
        <v-flex
          v-if="!store.lemma.showSideBar"
          shrink
          align-self-start
          class="pl-0 ml-0 pr-3"
          style="margin-top: -5px">
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
      color="background darken-1"
      :card="false"
      :right="true"
      :min-width="300"
      :width="store.settings.drawerRightWidth"
      @update:width="store.settings = { ...store.settings, drawerRightWidth: $event}"
      :value="store.lemma.showSideBar">
      <div v-if="selectedRows.length === 0" class="fill-height justify-center d-flex align-center">
        Kein Lemma ausgewählt
      </div>
      <div v-else-if="selectedRows.length > 1" class="fill-height justify-center d-flex align-center">
        {{ selectedRows.length }} Lemmata ausgewählt
      </div>
      <lemma-detail
        v-else
        :value="selectedRows[0]"
        @close="store.lemma.showSideBar = false"
        @update="updateLemma(selectedRows[0], $event)" />
    </resizable-drawer>
    <v-main class="fill-width fill-height transition-none">
      <virtual-table
        ref="vTable"
        data-testid="lemma_table"
        class="virtual-table text-body-3"
        :show-filter="store.settings.showLemmaFilter"
        :columns="columns"
        :sortable-columns="true"
        :row-height="38"
        :scroll-to-row="scrollToRow"
        :editable="true"
        :height="tableHeight"
        :data="sortedFilteredLemmas"
        :selected-rows="selectedRows"
        header-color="background darken-2"
        @keyup.delete="deleteSelectedLemmas"
        @drag:row="dragListener"
        @click:cell="onClickCell"
        @click:header="sortLemmas"
        @dblclick:row="store.lemma.showSideBar = true"
        @dblclick:cell="store.lemma.showSideBar = true"
        @update:selection="selectedRows = $event"
        @update:item="updateLemmaFromTable"
        @update:filter="(f) => store.lemma.setFilter(f)"
        @update:columns="columns = $event" >
        <template v-slot:cell="{ item, index, column, value }">
          <template v-if="item[column.value] === 'Not available'"></template>
          <!-- the star column -->
          <template v-else-if="column.value === 'selected'">
            <span v-if="value === true" style="color: var(--v-primary-base)">★</span>
            <span v-if="value === false" style="opacity: .7">☆</span>
          </template>
          <!-- the gnd column -->
          <template v-else-if="column.value === 'gnd'">
            <span style="opacity: .5" v-if="item.gnd.length === 0">
              ⊘
            </span>
            <span
              style="white-space: nowrap;"
              v-else-if="item.gnd.length > 0"
              @mouseover="onHoverGndCell($event, item.gnd)">
              <span
                class="badge primary"
                v-if="item.gnd.length > 1"
                v-text="(item.gnd.length)"
              />
              {{ item.gnd[0] }}
            </span>
          </template>
          <a
            v-else-if="value && column.value === 'loc'"
            target="_blank"
            :href="'https://id.loc.gov/authorities/names/' + value"
            class="table-external-link background lighten-2">
            {{ value }}
          </a>
          <a
            v-else-if="value && column.value === 'viaf_id'"
            target="_blank"
            :href="'https://viaf.org/viaf/' + value"
            class="table-external-link background lighten-2">
            {{ value }}
          </a>
          <a
            v-else-if="value && column.value === 'wiki_edits'"
            class="table-external-link background lighten-2"
            @click.prevent="openWikipedia(item)">
            {{ value }}
          </a>
          <!-- all others -->
          <template v-else-if="value">
            {{ item[column.value] }}
          </template>
          <span class="muted" v-else-if="!value || value.trim() === '?'">
            ⊘
          </span>
        </template>
      </virtual-table>
    </v-main>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import ResizableDrawer from '../lib/ResizableDrawer.vue'
import DragImage from './DragImage.vue'
import LobidPreviewCard from './LobidPreviewCard.vue'
import ThemeToggle from '../ThemeToggle.vue'
import VirtualTable from '../lib/VirtualTable.vue'
import LemmaDetail from './LemmaDetail.vue'
import LemmaAdd from './LemmaAdd.vue'
import DataFilter from '../lib/DataFilter.vue'

import _ from 'lodash';

import store from '@/store'

import { LemmaRow, LemmaFilterItem, LemmaColumn } from '@/types/lemma'
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
    DataFilter,
    LemmaImportManager: () => import('./LemmaImporter/LemmaImportManager.vue'),
  }
})
export default class LemmaManager extends Vue {

  @Prop({ default: null }) lemmaListId!: number|null
  @Prop({ default: null }) highlightId!: number|null

  scrollToRow: number|null = null;
  store = store;
  tableHeight = 0;
  toolbarMinHeight = 80;
  toolbarPaddingY = 15;
  showAddLemmaDialog = false;
  log = console.log;

  filterItems: LemmaFilterItem[] = [];

  previewPopupCoords: [number, number] = [0, 0];
  lobidPreviewGnds: string[] = [];
  filteredLemmas: LemmaRow[] = this.store.lemma.lemmas;

  importerOpened: boolean = false;

  onKeyDown(e: KeyboardEvent) {
    if (e.key.toLowerCase() === 'enter') {
      e.preventDefault()
      if (store.lemma.showSideBar === false) {
        store.lemma.showSideBar = true
      }
    }
  }

  get selectedRows() {
    return store.lemma.selectedLemmas
  }

  set selectedRows(ls) {
    store.lemma.selectedLemmas = ls
  }

  get newLemmas(): LemmaRow[] {
    if (this.lemmaListId !== null) {
      return Object.values(store.lemma.newLemmasInUserList[this.lemmaListId] || {}).map(e => e.item)
    } else {
      return []
    }
  }

  @Watch('lemmaListId')
  onUpdateLemmaListId() {
    store.lemma.selectedLemmaListId = this.lemmaListId
  }

  async saveFilter() {
    const name = await prompt.prompt('Filter speichern', { placeholder: 'Filtername eingeben…' })
    if (name !== null) {
      store.lemma.storedLemmaFilters = [ ...store.lemma.storedLemmaFilters, {
        name: name,
        id: uuid(),
        filterItems: this.store.lemma.currentFilters
      }]
    }
  }

  @Watch('highlightId', { immediate: true })
  async onChangeHighlightId() {
    if (this.highlightId !== null) {
      this.store.lemma.setFilter({})
      await this.$nextTick()
      const index = this.sortedFilteredLemmas.findIndex(l => l.id === this.highlightId)
      this.scrollToRow = index > -1 ? index : null
    }
  }

  get selectedList() {
    if (this.lemmaListId !== null) {
      return store.lemma.getListById(this.lemmaListId) || null
    } else {
      return null
    }
  }

  get columns() {
    return store.lemma.columns
  }

  set columns(cs) {
    store.lemma.columns = cs
  }

  openWikipedia(item: LemmaRow) {
    const link = _.get(item, 'columns_scrape.wikidata.wiki_de')
    if (link !== undefined) {
      window.open(link)
    }
  }

  updateColumn(c: LemmaColumn, u: Partial<LemmaColumn>) {
    this.columns = this.columns.map(cl => {
      return cl.value === c.value ? { ...cl, ...u } : cl
    })
  }

  cancelUpdateListName(event: KeyboardEvent) {
    if (
      this.lemmaListId !== null &&
      event.target instanceof HTMLElement
    ) {
      event.target.textContent = store.lemma.getListById(this.lemmaListId)?.title || 'Listenname'
      event.target.blur()
    }
  }

  updateListName(event: Event) {
    if (
      event.currentTarget instanceof HTMLElement &&
      this.lemmaListId !== null &&
      event.currentTarget.textContent !== null
    ) {
      store.lemma.updateList(this.lemmaListId, { title: event.currentTarget.textContent })
      event.currentTarget.scrollLeft = 0
    }
  }

  updateLemmaFromTable(lemma: LemmaRow, tableUpdate: Partial<LemmaRow>) {
    this.updateLemma(lemma, tableUpdate)
  }

  async updateLemma(l: LemmaRow, u: Partial<LemmaRow>) {
    // update selected lemma (cached)
    if (this.selectedRows.length > 0 && this.selectedRows[0].id === l.id) {
      this.selectedRows[0] = { ...l, ...u }
    }
    // update store, server and local storage
    await store.lemma.updateLemmas([ l ], u)
  }

  async deleteList(id: number|null) {
    if (id !== null) {
      const list = store.lemma.getListById(id)
      if (list !== undefined) {
        if (await confirm.confirm(
          `Wollen Sie die Liste ”${ list.title }” wirklich löschen?\nDie Lemmata in dieser Liste werden nicht gelöscht, sondern bleiben in der Lemmabibliothek.`,
          { icon: 'mdi-delete-outline' }
        )) {
          await store.lemma.deleteLemmaList(id)
        }
      }
    }
  }

  @Watch('store.settings.showLemmaFilter', { immediate: true })
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
    this.store.settings = {...this.store.settings, showNavDrawer: !this.store.settings.showNavDrawer }
  }

  get toolbarHeight() {
    return this.store.settings.showLemmaFilter ? 120 : 80
  }

  getTableHeight() {
    return window.innerHeight - this.toolbarHeight
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
      return _.orderBy(this.store.lemma.lemmas, sortByColumn.value, sortByColumn.sort || 'asc')
    } else {
      return this.store.lemma.lemmas
    }
  }

  addLemma(l: LemmaRow, listId: number) {
    this.showAddLemmaDialog = false
    this.store.lemma.addLemma(l, listId)
  }

  async removeLemmasFromList(l: LemmaRow[]) {
    await this.store.lemma.updateLemmas(l, { list: null as any })
  }

  async removeLemmasFromIssue(l: LemmaRow[]) {
    // FIXME:
    // backend method missing
    // await this.store.issue.deleteLemma(l)
  }

  async deleteSelectedLemmas(e: KeyboardEvent) {
    const indexOfLastSelected = this.sortedFilteredLemmas.findIndex(l => _.last(this.selectedRows)?.id === l.id)
    console.log(e)
    // A list is selected
    // remove from list.
    if (this.lemmaListId !== null && !(e.ctrlKey || e.metaKey)) {
      const msg = `Wollen Sie wirklich ${ this.selectedRows.length } Lemma(ta) aus dieser Liste entfernen?`
      if (await confirm.confirm(msg)) {
        this.removeLemmasFromList(this.selectedRows)
        // select the next row after the deleted ones
        if (indexOfLastSelected > -1) {
          this.selectedRows = [ this.sortedFilteredLemmas[indexOfLastSelected] ]
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
          this.selectedRows = [ this.sortedFilteredLemmas[indexOfLastSelected] ]
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
          this.selectedRows = [ this.sortedFilteredLemmas[indexOfLastSelected] ]
        }
      }
    }
  }

  @Watch('store.lemma.selectedLemmaFilterId', { immediate: true })
  async onSelectLemmaFilter(id: string|null) {
    if (id !== null) {
      const l = store.lemma.getStoredLemmaFilterById(id)
      if (l !== undefined) {
        this.store.lemma.currentFilters = l.filterItems
      }
    } else {
      this.store.lemma.setFilter({})
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


  openFileDialog(cb: (f: File) => unknown) {
    const input: HTMLInputElement = document.createElement('input')
    input.type = 'file'
    input.accept = 'text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    input.addEventListener('change', () => {
      console.log('input change', input.files)
      if (input.files !== null && input.files[0] !== undefined) {
        cb(input.files[0])
      }
      input.value = ''
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
      const target = e.target
      const timer = setTimeout(() => {
        this.lobidPreviewGnds = gnd
        this.previewPopupCoords = [
          target.getBoundingClientRect().left,
          target.getBoundingClientRect().bottom
        ]
      }, 500)
      e.target.addEventListener('mouseout', function onMouseOut() {
        clearTimeout(timer)
        target.removeEventListener('mouseout', onMouseOut)
      })
    }
  }

  dragListener(item: LemmaRow, ev: DragEvent) {
    console.log('dragging!')
    let dragImage: null|HTMLElement = null
    if (this.selectedRows.findIndex(r => r.id === item.id) === -1) {
      this.selectedRows.push(item)
    }
    console.log('ev.dataTransfer', ev.dataTransfer, this.selectedRows)
    if (ev.dataTransfer) {
      dragImage = ((this.$refs.dragGhost as Vue).$el) as HTMLElement
      ev.dataTransfer.effectAllowed = 'move'
      ev.dataTransfer.setData('text/plain', JSON.stringify(this.selectedRows))
      if (dragImage !== null) {
        ev.dataTransfer.setDragImage(dragImage, 0, 0)
      }
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
  background var(--v-background-darken1)
  padding-left .75em
  padding-right .75em
  // .v-virtual-scroll

.virtual-table .table-row
  border-radius 5px
  &.selected
    background-color rgba(0,0,0,.15) !important

:focus .table-row.selected
  background-color var(--v-primary-darken1) !important
  color white

.theme--light .virtual-table .table-row.odd
  background var(--v-background-darken2)

.virtual-table .table-cell,
.virtual-table .header-cell
  padding 0 5px

</style>

<style lang="stylus" scoped>
.table-external-link
  display inline-block
  padding 3px 0px
  text-decoration none
  color var(--v-textcolor-base) !important
  padding 3px 5px
  border-radius 5px
  font-size 90%

.lemma-view-title
  min-width 150px
  max-width 250px

[contenteditable="true"]:hover
  border-radius 3px
  box-shadow inset 0px 0px 0px 1px var(--v-secondary-lighten5)
</style>
