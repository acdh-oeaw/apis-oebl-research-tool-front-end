<template>
  <v-card
    class="transparent flex-column d-flex fill-height"
    flat
    v-if="value !== undefined">
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
        <transition name="roll">
          <div :key="value.id" class="text-center px-5" style="width: 100%">
            {{ value.lastName }}, {{ value.firstName }}
          </div>
        </transition>
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
        <div v-if="showGndSearch">
          <lobid-gnd-search
            :lemma="value"
            :gnd="value.gnd"
            @cancel="showGndSearch = false"
            @input="selectGnd"
          />
        </div>
        <div v-else>
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
            block
            v-if="value.gnd.length === 0"
            elevation="0">GND hinzufügen…</v-btn>
          <v-btn
            v-if="value.gnd.length > 0"
            @click="showGndSearch = true"
            small
            color="secondary"
            block
            elevation="0">GND ändern…</v-btn>
        </div>
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
        <v-list dense nav class="text-body-2 pa-0">
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
        Importierte Daten <!--<v-badge color="blue-grey" inline :content="countImportedResources(value.columns_scrape)" />-->
      </h4>
      <v-card-text class="pt-0">
        <v-list dense class="text-body-2 pt-0">
          <v-list-item class="px-2" v-for="(userValue, userKey) in value.columns_user" :key="userKey">
            <v-list-item-content>{{ userKey }}</v-list-item-content>
            <v-list-item-action-text>{{ userValue }}</v-list-item-action-text>
          </v-list-item>
        </v-list>
      </v-card-text>
    </div>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { LemmaRow } from '@/types/lemma'
import LemmaScrapeResult from './LemmaScrapeResult.vue'
import LobidPreviewCard from './LobidPreviewCard.vue'
import LobidGndSearch from './LobidGndSearch.vue'
import store from '@/store'

@Component({
  components: {
    LemmaScrapeResult,
    LobidPreviewCard,
    LobidGndSearch
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

}
</script>
<style lang="stylus" scoped>

.roll-enter-active, .roll-leave-active
  position relative
  transition: all .3s ease;

.roll-enter, .roll-leave-to
  width 100%
  position absolute
  opacity: 0

.roll-enter
  transform translateY(20px)
.roll-leave-to
  transform translateY(-20px)

</style>
