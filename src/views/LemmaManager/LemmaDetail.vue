<template>
  <v-card
    class="transparent flex-column d-flex fill-height lemma-detail"
    flat
    v-if="value !== undefined && value !== null">
    <v-card-title class="pb-2">
      <v-btn
        style="position: absolute; left: 5px; top: 5px; font-size: 100%; z-index: 1"
        width="48"
        height="48"
        tile
        @click="$emit('update', { selected: !value.selected })"
        class="rounded-lg mr-2"
        icon>
        <span style="color: var(--v-primary-base)" v-if="value.selected">★</span>
        <span style="opacity: .5" v-else>☆</span>
      </v-btn>
      <v-container style="position: relative" class="pa-0">
        <div :key="value.id" class="text-center px-5" style="width: 100%">
          {{ value.lastName }}, {{ value.firstName }}
        </div>
        <v-row no-gutters>
          <v-col cols="12" class="text-caption text-center">
            {{ value.birthYear || '?' }} - {{ value.deathYear || '?' }}
          </v-col>
        </v-row>
      </v-container>
      <v-btn-toggle
        class="mx-auto mt-2 mb-0"
        max
        v-model="detailPage"
        borderless
        dense
        color="primary"
        background-color="background">
        <v-btn class="rounded-lg" small>
          Details
        </v-btn>
        <v-btn class="rounded-lg mx-1" small>
          Externe Ressourcen <template v-if="countScrapedResources(value.columns_scrape) > 0">({{ countScrapedResources(value.columns_scrape) }})</template>
        </v-btn>
        <v-btn class="rounded-lg" small>Workflow</v-btn>
      </v-btn-toggle>
    </v-card-title>
    <v-divider />
    <div class="overflow-y-auto flex-grow-1">
      <v-window reverse :value="detailPage">
        <v-window-item>
          <h4
            class="py-2 px-5 background d-flex"
            :style="{
              zIndex: 1,
              position: 'sticky',
              top: 0,
              background: ''
            }">
            Basisdaten
            <v-spacer />
            <select-menu
              btn-class="px-2 background darken-2"
              prepend-icon="mdi-format-list-bulleted"
              search-placeholder="Liste suchen …"
              :show-caret="true"
              :value="value.list || null"
              :items="store.lemma.lemmaLists"
              @input="updateList"
              key-name="title"
              key-description="editor.name"
              key-value="id"
            />
          </h4>
          <v-card-text>
            <text-field
              :required="true"
              label="Vorname"
              :value="value.firstName"
              @input="debouncedUpdateData({ firstName: $event })"
            />
            <text-field
              :required="true"
              label="Nachname"
              :value="value.lastName"
              @input="debouncedUpdateData({ lastName: $event })"
            />
            <text-field
              label="Geburtsjahr"
              :value="value.birthYear"
              placeholder="YYYY"
              :rules="[ (e) => (e === null || e.toString().length !== 4 || isNaN(e)) && 'ungültiges Jahr' ]"
              @input="debouncedUpdateData({ birthYear: $event })"
            />
            <text-field
              label="Sterbejahr"
              :value="value.deathYear"
              placeholder="YYYY"
              :rules="[ (e) => (e === null || e.toString().length !== 4 || isNaN(e)) && 'ungültiges Jahr' ]"
              @input="debouncedUpdateData({ deathYear: $event })"
            />
            <v-divider class="my-4" />
            <text-field
              style="min-height: 100px"
              label="Verwandtschaft"
              :allow-new-line="true"
            />
            <text-field
              style="min-height: 100px"
              label="Lebenslauf"
              :allow-new-line="true"
            />
          </v-card-text>
          <h4
            class="py-2 px-5 background"
            :style="{
              zIndex: 1,
              position: 'sticky',
              top: 0,
              background: ''
            }">
            Erweiterte Daten
          </h4>
          <v-card-text class="pt-0">
            <text-field
              v-for="(userValue, userKey) in value.columns_user"
              :key="userKey"
              :value="userValue"
              @input="debouncedUpdateUserColumns(userKey, $event)"
              :label="userKey"
            />
          </v-card-text>
        </v-window-item>
        <v-window-item>
          <h4
            class="py-2 px-5 background d-flex"
            :style="{
            zIndex: 1,
            position: 'sticky',
            top: 0,
            background: ''
          }">
            GND: {{ value.gnd[0] }}
            <v-spacer />
            <v-badge color="primary" v-if="value.gnd.length > 1" :content="'+' + (value.gnd.length - 1).toString()" inline />
          </h4>
          <v-card-text class="pt-1">
            <v-window reverse style="overflow: visible !important" :value="showGndSearch ? 1 : 0">
              <v-window-item>
                <lobid-preview-card
                  class="mb-2"
                  v-if="value.gnd.length > 0"
                  @update="log"
                  :limit="1"
                  :gnd="value.gnd" />
                <v-btn
                  @click="showGndSearch = true"
                  small
                  color="background darken-3"
                  class="rounded-lg"
                  block
                  v-if="value.gnd.length === 0"
                  elevation="0">GND hinzufügen…</v-btn>
                <v-btn
                  v-if="value.gnd.length > 0"
                  @click="showGndSearch = true"
                  small
                  class="rounded-lg"
                  color="background darken-3"
                  block
                  elevation="0">GND ändern…</v-btn>
              </v-window-item>
              <v-window-item>
                <lobid-gnd-search
                  :value="value.gnd.length === 1 ? value.gnd[0] : null"
                  :lemma="value"
                  :gnd="value.gnd"
                  @cancel="showGndSearch = false"
                  @input="selectGnd"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
          <v-divider />
          <h4
            class="py-2 px-5 background d-flex"
            :style="{
              zIndex: 1,
              position: 'sticky',
              top: 0,
              background: ''
            }">
            Externe Ressourcen
            <v-spacer />
          </h4>
          <v-card-text class="pt-0">
            <v-list color="transparent" dense nav class="text-body-2 pa-0">
              <template v-if="value.columns_scrape">
                <lemma-scrape-result
                  v-for="(source, sourceName) in value.columns_scrape"
                  :key="sourceName"
                  :value="source"
                  :title="sourceName" />
              </template>
            </v-list>
          </v-card-text>
        </v-window-item>
      </v-window>
    </div>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { LemmaRow } from '@/types/lemma'
import LemmaScrapeResult from './LemmaScrapeResult.vue'
import LobidPreviewCard from './LobidPreviewCard.vue'
import LobidGndSearch from './LobidGndSearch.vue'
import TextField from '../lib/TextField.vue'
import SelectMenu from '../lib/SelectMenu.vue'
import store from '@/store'
import _ from 'lodash'
import { List } from '@/api'

@Component({
  components: {
    LemmaScrapeResult,
    LobidPreviewCard,
    LobidGndSearch,
    TextField,
    SelectMenu
  }
})
export default class LemmaDetail extends Vue {

  @Prop({ required: true }) value!: LemmaRow
  log = console.log
  store = store
  showGndSearch = false
  detailPage = 0

  countScrapedResources(r: LemmaRow['columns_scrape']) {
    if (r === undefined) {
      return 0
    } else {
      return Object.values(r).filter(r => r !== undefined && !(Array.isArray(r))).length
    }
  }

  selectGnd(gnd: string|null) {
    this.showGndSearch = false
    if (gnd === null) {
      this.$emit('update', { gnd: [] })
    } else {
      this.$emit('update', { gnd: [ gnd ] })
    }
  }

  updateUserColumns(userKey: string, $event: string) {
    this.$emit('update', {
      // eslint-disable-next-line @typescript-eslint/camelcase
      columns_user: {
        ...this.value.columns_user,
        [ userKey ]: $event
      },
      [ userKey ]: $event
    })
  }

  debouncedUpdateUserColumns = _.debounce(this.updateUserColumns, 300)

  updateList(l: List) {
    this.updateData({
      list: {
        id: l.id!,
        title: l.title,
        editor: l.editor?.userId,
      }
    })
  }

  updateData(u: Partial<LemmaRow>) {
    this.$emit('update', u)
  }

  debouncedUpdateData = _.debounce(this.updateData, 300)

}
</script>
<style lang="stylus" scope>
// tell the browser not to cache this.
.lemma-detail
  will-change contents
</style>
