<template>
  <div style="min-width: 300px; max-height: 500px" class="d-flex flex-column">
    <v-overlay
      v-if="showOverlay"
      opacity=".9"
      style="border-radius: 11px"
      color="background darken-1">
      <v-btn
        @click="removeCitation"
        elevation="0"
        class="mb-1 rounded-lg"
        block
        color="red">
        Zitat entfernen
      </v-btn>
      <v-btn
        block
        @click="showOverlay = false"
        outlined
        class="rounded-lg"
        color="grey">
        Abbrechen
      </v-btn>
    </v-overlay>
    <div>
      <div
        v-if="page === 0"
        class="d-flex flex-row align-self-stretch">
        <v-btn icon tile class="rounded-lg" small>
        </v-btn>
        <div class="text-center muted caption mb-1 flex-grow-1 align-self-end">
          Zitat
        </div>
        <v-btn icon tile class="rounded-lg" small @click="showOverlay = true">
          <v-icon>mdi-dots-horizontal</v-icon>
        </v-btn>
      </div>
      <v-btn
        v-if="page !== 0"
        elevation="0"
        color="primary"
        text
        @click="page = 0"
        class="rounded-lg mb-2"
        small>
        <v-icon left>mdi-chevron-left</v-icon>Zurück
      </v-btn>
    </div>
    <v-window :value="page" class="overflow-y-auto rounded-lg" reverse>
      <v-window-item>
        <div class="d-flex flex-row fill-width pt-1">
          <text-field
            @input="searchBook"
            class="flex-grow-1"
            :value="searchTerm"
            :clearable="true"
            placeholder="Werk suchen …">
            <template v-slot:prepend>
              <div
                v-if="loading === true"
                class="mt-1 ml-2">
                <loading-spinner :size="25" />
              </div>
              <v-icon size="16" class="ml-3" v-else>
                mdi-magnify
              </v-icon>
            </template>
          </text-field>
          <text-field
            style="width: 100px"
            class="ml-1 px-2"
            @input="updateProps({ quotedRange: $event })"
            placeholder="Seite">
            <template v-slot:prepend>
              <v-icon size="16" class="ml-1 mr-0">
                mdi-book-open-page-variant
              </v-icon>
            </template>
          </text-field>
        </div>
        <v-list dense nav color="background" class="pa-0" v-if="results.length > 0">
          <v-list-item
            dense
            nav
            class="px-0"
            :input-value="result.key === zoteroKey"
            v-for="(result, i) in results"
            :key="i">
            <v-list-item-avatar class="pr-0 mr-2" min-width="30" max-width="30" width="30">
              <template>
                <v-btn
                  @click.stop.prevent.capture="selectTitle(result)"
                  tile
                  icon
                  class="rounded-lg"
                  elevation="0">
                  <v-icon v-if="result.key === zoteroKey" color="primary">mdi-check-circle</v-icon>
                  <v-icon v-else>mdi-circle-outline</v-icon>
                </v-btn>
              </template>
            </v-list-item-avatar>
            <v-list-item-content @click.stop.prevent.capture="showDetails(result)" class="cursor-pointer">
              <v-list-item-title>
                {{ result.data.creators.map(c => c.firstName + ', ' + c.lastName).join(' / ') }} ({{ result.data.date }})
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ result.data.title }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                icon
                class="rounded-lg"
                elevation="0"
                @click.stop.prevent.capture="showDetails(result)"
                tile>
                <v-icon color="primary">
                  mdi-chevron-right
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <div v-if="page === 0">
          <v-divider class="mb-1" />
          <v-btn
            @click="page = 1"
            class="rounded-lg"
            text
            block
            color="primary">
            <v-icon block small class="mr-1">mdi-plus-circle-outline</v-icon>Neues Werk anlegen
          </v-btn>
        </div>
      </v-window-item>
      <v-window-item>
        <zotero-form
          @input="newItem = { ...newItem, data: {...newItem.data, ...$event}}"
          :value="newItem" />
      </v-window-item>
      <v-window-item>
        <zotero-form @input="updateZoteroItem" :value="showTitleDetails" />
      </v-window-item>
    </v-window>
    <div class="py-1" v-if="page === 1">
      <v-btn @click="createZoteroItem" elevation="0" block class="rounded-lg" color="primary">Speichern</v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import TextField from '@/views/lib/TextField.vue'
import SelectMenu from '@/views/lib/SelectMenu.vue'
import LoadingSpinner from '@/views/lib/LoadingSpinner.vue'
import zotero from '@/service/zotero'
import { ZoteroItem } from '@/types/zotero';
import ZoteroForm from './ZoteroForm.vue'
import confirm from '@/store/confirm'
import _ from 'lodash'
import { Editor } from '@tiptap/vue-2'
import { CitationAttributes } from '@/store/article'

const newItem = { data: { creators: [], itemType: 'book' } }

@Component({
  components: {
    TextField,
    LoadingSpinner,
    SelectMenu,
    ZoteroForm,
  }
})
export default class Citation extends Vue {

  @Prop({ default: null }) id!: CitationAttributes['id']
  @Prop({ default: null }) zoteroKey!: CitationAttributes['zoteroKey']
  @Prop({ default: null }) quotedRange!: CitationAttributes['quotedRange']
  @Prop({ required: true}) editor!: Editor

  currentCitation: ZoteroItem|null = null
  searchQueries: {[key: string]: string} = {}
  newItem = _.clone(newItem)
  page = 0
  loading = false
  showTitleDetails: ZoteroItem|null = null
  results: ZoteroItem[] = []
  showOverlay = false

  get searchTerm(): string {
    // if possible, use the cached search term
    if (
      this.id !== null &&
      this.searchQueries[this.id] !== undefined
    ) {
      return this.searchQueries[this.id]
    // otherwise it’s empty
    } else {
      return ''
    }
  }

  set searchTerm(t: string) {
    // cache it
    this.searchQueries[this.id!] = t
  }

  removeCitation() {
    this.editor.commands.unsetMark('citation')
    this.editor.commands.focus()
  }

  showDetails(t: ZoteroItem) {
    this.page = 2
    this.showTitleDetails = t
    console.log({t})
  }

  @Watch('zoteroKey', { immediate: true })
  async onChangeKey() {
    if (this.zoteroKey !== null) {
      this.currentCitation = await zotero.getItem(this.zoteroKey)
    }
  }

  @Watch('id', { immediate: true })
  async onChangeId() {
    if (this.searchTerm === '' && this.currentCitation !== null) {
      this.results = [ this.currentCitation ]
    }
  }

  async searchBook(e: string) {
    this.searchTerm = e
    this.loading = true
    if (e !== null && e.trim().length > 0) {
      this.results = await zotero.searchItem(e)
    } else {
      if (this.currentCitation !== null) {
        this.results = [ this.currentCitation ]
      }
    }
    this.loading = false
  }

  async createZoteroItem() {
    const template = await zotero.getItemTemplate(newItem.data.itemType)
    const i = {
      ...template,
      ...this.newItem.data
    }
    zotero.createItem(i)
  }

  updateZoteroResultsLocally(t: ZoteroItem) {
    this.results = this.results.map(r => {
      if (r.key === t.key) {
        return t
      } else {
        return r
      }
    })
  }

  sendZoteroUpdateRequestDebounced = _.debounce(this.sendZoteroUpdateRequest, 300)

  async sendZoteroUpdateRequest(p: Partial<ZoteroItem['data']>, t: ZoteroItem, v: number) {
    try {
      const { version } = await zotero.updateTitle(t.key, {...p, version: v})
      console.log('got version', version)
      this.showTitleDetails = { ...t, data: { ...t.data, version } }
      this.updateZoteroResultsLocally(this.showTitleDetails)
    } catch (e) {
      const serverTitle = await zotero.getItem(t.key)
      this.updateZoteroResultsLocally({ ...t, data: { ...t.data, version: serverTitle.data.version } })
      this.showTitleDetails = { ...t, data: { ...t.data, version: serverTitle.data.version } }
    }
  }

  updateZoteroItem(p: Partial<ZoteroItem['data']>, curVersion: number) {
    if (this.showTitleDetails !== null) {
      const t = {
        ...this.showTitleDetails,
        data: {
          ...this.showTitleDetails?.data,
          ...p
        }
      }
      this.showTitleDetails = t
      this.updateZoteroResultsLocally(this.showTitleDetails)
      this.sendZoteroUpdateRequestDebounced(p, t, curVersion)
    }
  }

  updateProps(ps: Partial<CitationAttributes>): boolean {
    const res = this.editor.commands.updateAttributes('citation', {
      id: this.id,
      zoteroKey: this.zoteroKey,
      ...ps
    })
    return res
  }

  selectTitle(zoteroItem: ZoteroItem) {
    if (this.id !== null) {
      this.updateProps({
        id: this.id,
        zoteroKey: zoteroItem.key
      })
    } else {
      confirm.confirm('no citation selected')
    }
  }

}
</script>
<style lang="stylus" scoped>
</style>
