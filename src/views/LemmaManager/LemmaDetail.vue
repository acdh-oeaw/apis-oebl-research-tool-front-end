<template>
  <v-card
    class="transparent flex-column d-flex fill-height"
    flat
    v-if="value !== undefined">
    <v-card-title>
      <v-btn
        style="position: absolute; left: 5px; top: 5px; font-size: 100%"
        width="48"
        height="48"
        tile
        @click="value.starred = !value.starred"
        class="rounded-lg mr-2"
        icon>
        <span style="color: var(--v-primary-base)" v-if="value.starred">★</span>
        <span style="opacity: .5" v-else>☆</span>
      </v-btn>
      <v-container class="pa-0">
        <v-row no-gutters>
          <v-col cols="1" />
          <transition name="roll">
            <v-col :key="value.id" class="text-center" cols="10">
              {{ value.lastName }}, {{ value.firstName }}
            </v-col>
          </transition>
          <v-col cols="1" />
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" class="text-caption text-center">
            {{ value.birthYear }} - {{ value.deathYear }}
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
        GND: {{ value.gnd[0] }}<v-spacer /><!--<v-btn rounded elevation="0" small>bearbeiten</v-btn>-->
      </h4>
      <v-card-text class="pt-2">
        <lobid-preview-card @update="log" :limit="1" :gnd="value.gnd" />
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
        Externe Ressourcen
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
    </div>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { LemmaRow } from '@/types/lemma'
import LemmaScrapeResult from './LemmaScrapeResult.vue'
import LobidPreviewCard from './LobidPreviewCard.vue'

@Component({
  components: {
    LemmaScrapeResult,
    LobidPreviewCard
  }
})
export default class LemmaDetail extends Vue {

  @Prop({ required: true }) value!: LemmaRow
  log = console.log
}
</script>
<style lang="stylus" scoped>

.roll-enter-active, .roll-leave-active
  position relative
  transition: all .3s ease;

.roll-enter, .roll-leave-to
  position absolute
  opacity: 0

.roll-enter
  transform translateY(20px)
.roll-leave-to
  transform translateY(-20px)

</style>
