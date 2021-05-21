<template>
  <div style="min-width: 300px; max-height: 500px" class="d-flex flex-column">
    <div>
      <div
        v-if="page === 0"
        class="text-center muted caption mb-1">
        Referenz bearbeiten
      </div>
      <v-btn
        v-else
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
            class="px-2 flex-grow-1"
            :clearable="true"
            placeholder="Werk suchen …">
            <template v-slot:prepend>
            <div
              v-if="loading === true"
              class="mt-1">
              <loading-spinner :size="25" />
            </div>
            <v-icon size="16" class="ml-1" v-else>
              mdi-magnify
            </v-icon>
          </template>
          </text-field>
          <text-field
            style="width: 100px"
            class="ml-1 px-2"
            @input="updateQuotedRange"
            placeholder="Seite">
            <template v-slot:prepend>
              <v-icon size="16" class="ml-1 mr-0">
                mdi-book-open-page-variant
              </v-icon>
            </template>
          </text-field>
        </div>
        <v-list two-line dense nav color="background" class="px-0 x-dense" v-if="results.length > 0">
          <v-list-item
            nav
            :input-value="currentCitation !== null && result.key === currentCitation.zoteroKey"
            v-for="(result, i) in results"
            :key="i"
            @click="selectTitle(result)">
            <v-list-item-avatar style="min-width: 20px" width="15">
              <v-icon v-if="currentCitation !== null && result.key === currentCitation.zoteroKey" small>mdi-check</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
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
                <v-icon size="18" color="primary">
                  mdi-playlist-edit
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <div v-if="page === 0" class="text-right">
          <v-btn
            @click="page = 1"
            class="rounded-lg"
            text
            color="primary">
            <v-icon small class="mr-1">mdi-plus-circle-outline</v-icon>Neue Ressource anlegen
          </v-btn>
        </div>
      </v-window-item>
      <v-window-item>
        <zotero-form :value="{ data: { creators: [] } }" />
      </v-window-item>
      <v-window-item>
        <zotero-form @input="updateZoteroTitleDebounced" :value="showTitleDetails" />
      </v-window-item>
    </v-window>
    <div class="py-1" v-if="page === 1">
      <v-btn elevation="0" block class="rounded-lg" color="primary">Speichern</v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import TextField from '@/views/lib/TextField.vue'
import SelectMenu from '@/views/lib/SelectMenu.vue'
import LoadingSpinner from '@/views/lib/LoadingSpinner.vue'
import zotero, { ZoteroItem } from '@/service/zotero'
import ZoteroForm from './ZoteroForm.vue'
import store from '@/store'
import confirm from '@/store/confirm'
import _ from 'lodash'

@Component({
  components: {
    TextField,
    LoadingSpinner,
    SelectMenu,
    ZoteroForm,
  }
})
export default class Citation extends Vue {

  @Prop({ default: null }) id!: string|null

  page = 0
  loading = false
  showTitleDetails: ZoteroItem|null = null
  results: ZoteroItem[] = []

  showDetails(t: ZoteroItem) {
    this.page = 2
    this.showTitleDetails = t
    console.log({t})
  }

  @Watch('page')
  onChangePage() {
    // so that we can reposition the Pop up after the size has changed.
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 200)
  }

  get currentCitation() {
    if (this.id !== null) {
      return store.article.getCitationById(this.id) || null
    } else {
      return null
    }
  }

  @Watch('id', { immediate: true })
  onChangeId() {
    if (this.currentCitation !== null && this.currentCitation.zoteroItemCached !== null) {
      this.results = [ this.currentCitation.zoteroItemCached ]
    }
  }

  async searchBook(e: string|null) {
    this.loading = true
    if (e !== null && e.trim().length > 0) {
      this.results = await zotero.searchTitle(e)
    } else {
      if (this.currentCitation?.zoteroItemCached !== null && this.currentCitation?.zoteroItemCached !== undefined) {
        this.results = [ this.currentCitation?.zoteroItemCached ]
      }
    }
    this.loading = false
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

  updateZoteroTitleDebounced = _.debounce(this.updateZoteroTitle, 300)

  async updateZoteroTitle(p: Partial<ZoteroItem['data']>, curVersion: number) {
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
      try {
        const { version } = await zotero.updateTitle(this.showTitleDetails.key, {...p, version: curVersion})
        console.log('got version', version)
        this.showTitleDetails = { ...t, data: { ...t.data, version } }
        this.updateZoteroResultsLocally(this.showTitleDetails)
      } catch (e) {
        const serverTitle = await zotero.getTitle(t.key)
        this.updateZoteroResultsLocally({ ...t, data: { ...t.data, version: serverTitle.data.version } })
        this.showTitleDetails = { ...t, data: { ...t.data, version: serverTitle.data.version } }
      }
    }
  }

  updateQuotedRange(s: string|null) {
    if (this.id !== null) {
      store.article.updateCitation(this.id, { quotedRange: s })
    }
  }

  selectTitle(zoteroTitle: ZoteroItem) {
    if (this.id !== null) {
      store.article.updateCitation(this.id, { zoteroKey: zoteroTitle.key, zoteroItemCached: zoteroTitle })
    } else {
      confirm.confirm('not citation selected')
    }
  }

  @Watch('value', { deep: true })
  onChangeValue(v: any) {
    console.log(v)
  }

  mounted() {
  }
}
</script>
<style lang="stylus" scoped>
</style>
