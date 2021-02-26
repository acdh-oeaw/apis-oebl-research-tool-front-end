<template>
  <v-card
    class="transparent flex-column d-flex fill-height lemma-detail"
    flat
    v-if="value !== undefined && value !== null">
    <v-card-title>
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
    </v-card-title>
    <v-divider />
    <div class="overflow-y-auto flex-grow-1">
      <h4
        class="pt-2 pb-2 pl-5 background"
        :style="{
        zIndex: 1,
        position: 'sticky',
        top: 0,
        background: ''
      }">
        GND: {{ value.gnd[0] }}<v-badge v-if="value.gnd.length > 1" :content="'+' + (value.gnd.length - 1).toString()" color="blue-grey" inline />
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
              color="secondary"
              class="rounded-lg"
              block
              v-if="value.gnd.length === 0"
              elevation="0">GND hinzufügen…</v-btn>
            <v-btn
              v-if="value.gnd.length > 0"
              @click="showGndSearch = true"
              small
              class="rounded-lg"
              color="secondary"
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
        class="pt-2 pb-2 pl-5 background"
        :style="{
          zIndex: 1,
          position: 'sticky',
          top: 0,
          background: ''
        }">
        Externe Ressourcen <v-badge
          color="blue-grey"
          inline
          :content="countScrapedResources(value.columns_scrape).toString()" />
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
      <v-divider />
      <h4
        class="pt-2 pb-2 pl-5 background"
        :style="{
          zIndex: 1,
          position: 'sticky',
          top: 0,
          background: ''
        }">
        Basisdaten
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
      </v-card-text>
      <v-divider />
      <h4
        class="pt-2 pb-2 pl-5 background"
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
    </div>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { LemmaRow, isValidServerResearchLemma } from '@/types/lemma'
import LemmaScrapeResult from './LemmaScrapeResult.vue'
import LobidPreviewCard from './LobidPreviewCard.vue'
import LobidGndSearch from './LobidGndSearch.vue'
import TextField from '../lib/TextField.vue'
import store from '@/store'
import _ from 'lodash'

@Component({
  components: {
    LemmaScrapeResult,
    LobidPreviewCard,
    LobidGndSearch,
    TextField
  }
})
export default class LemmaDetail extends Vue {

  @Prop({ required: true }) value!: LemmaRow
  log = console.log
  store = store
  showGndSearch = false

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

  updateData(u: Partial<LemmaRow>) {
    // console.log(isValidServerResearchLemma(u))
    this.$emit('update', {...this.value, ...u})
  }

  debouncedUpdateData = _.debounce(this.updateData, 300)

}
</script>
<style lang="stylus" scope>
// tell the browser not to cache this.
.lemma-detail
  will-change contents
</style>
