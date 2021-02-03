<template>
  <v-card
    class="transparent flex-column d-flex fill-height"
    flat
    v-if="value !== undefined">
    <v-card-title>
      <v-btn
        style="position: absolute; right: 0px; top: 5px;"
        width="48"
        height="48"
        tile
        class="rounded-lg mr-2"
        @click="$emit('close')"
        icon>
        <v-icon>mdi-dock-right</v-icon>
      </v-btn>
      <v-container class="pa-0">
        <v-row no-gutters>
          <v-col cols="1"></v-col>
          <transition name="roll">
            <v-col :key="value.id" class="text-center" cols="10">
              {{ value.lastName }}, {{ value.firstName }}
            </v-col>
          </transition>
          <v-col class="text-right" cols="1">
          </v-col>
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
      <v-card-text>
        <v-subheader class="px-1">GND: {{ value.gnd[0] }}<v-spacer /><v-btn rounded elevation="0" small>bearbeiten</v-btn></v-subheader>
        <lobid-preview-card @update="log" :limit="1" :gnd="value.gnd" />
      </v-card-text>
      <v-card-text>
        <v-subheader class="px-1">Crawling Ergebnisse</v-subheader>
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
