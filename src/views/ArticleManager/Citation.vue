<template>
  <div style="min-width: 300px; max-height: 500px" class="d-flex flex-column">
    <div class="text-center">
      <v-btn-toggle
        class="mx-auto mt-1 mb-2 text-center"
        max
        v-model="page"
        borderless
        dense
        color="primary"
        background-color="background">
        <v-btn class="rounded-lg" small>
          Stelle wählen
        </v-btn>
        <v-btn class="rounded-lg mx-1" small>
          Werk anlegen
        </v-btn>
      </v-btn-toggle>
    </div>
    <v-window :value="page" class="overflow-y-" reverse>
      <v-window-item>
        <div class="d-flex flex-row fill-width pt-1">
          <text-field
            @input="searchBook"
            class="px-2 pb-1 flex-grow-1"
            placeholder="Werk suchen …">
            <loading-spinner v-if="loading" :size="21" class="mt-2"  />
          </text-field>
          <text-field
            style="width: 100px"
            class="ml-1 px-2"
            @input="updateQuotedRange"
            placeholder="Seite" />
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
                  mdi-arrow-right-bold-circle
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-window-item>
      <v-window-item>
        <zotero-form :value="{ data: { creators: [] } }" />
      </v-window-item>
      <v-window-item>
        <zotero-form @input="updateZoteroTitleDebounced" :value="showTitleDetails" />
      </v-window-item>
    </v-window>
    <div class="py-1" v-if="page === 1">
      <v-btn elevation="0" block class="rounded-lg" color="primary darken-1">Speichern</v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import TextField from '@/views/lib/TextField.vue'
import SelectMenu from '@/views/lib/SelectMenu.vue'
import LoadingSpinner from '@/views/lib/LoadingSpinner.vue'
import zotero, { Title } from '@/service/zotero'
import ZoteroForm from './ZoteroForm.vue'
import store from '@/store'
import confirm from '@/store/confirm'
import _ from 'lodash'
import { version } from 'uuid'

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
  showTitleDetails: Title|null = null
  results: Title[] = []

  showDetails(t: Title) {
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
    if (this.currentCitation !== null && this.currentCitation.zoteroTitleCached !== null) {
      this.results = [ this.currentCitation.zoteroTitleCached ]
    }
  }

  async searchBook(e: string|null) {
    this.loading = true
    if (e !== null && e.trim().length > 0) {
      this.results = await zotero.searchTitle(e)
    }
    this.loading = false
  }

  updateZoteroResultsLocally(t: Title) {
    this.results = this.results.map(r => {
      if (r.key === t.key) {
        return t
      } else {
        return r
      }
    })
  }

  updateZoteroTitleDebounced = _.debounce(this.updateZoteroTitle, 300)

  async updateZoteroTitle(t: Title) {
    this.updateZoteroResultsLocally(t)
    this.showTitleDetails = t
    try {
      const { version } = await zotero.updateTitle(t)
      this.showTitleDetails = { ...t, data: { ...t.data, version } }
    } catch (e) {
      const serverTitle = await zotero.getTitle(t.key)
      this.updateZoteroResultsLocally({ ...t, data: { ...t.data, version: serverTitle.data.version } })
      this.showTitleDetails = { ...t, data: { ...t.data, version: serverTitle.data.version } }
    }
  }

  updateQuotedRange(s: string|null) {
    if (this.id !== null) {
      store.article.updateCitation(this.id, { quotedRange: s })
    }
  }

  selectTitle(zoteroTitle: Title) {
    if (this.id !== null) {
      store.article.updateCitation(this.id, { zoteroKey: zoteroTitle.key, zoteroTitleCached: zoteroTitle })
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
