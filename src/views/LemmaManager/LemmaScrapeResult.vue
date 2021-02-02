<template>
  <v-list-group
    :class="[
      ((Array.isArray(value) && value.length === 0) || value === undefined) && 'list-disabled',
      'scrape-result'
    ]"
    >
    <template v-slot:activator>
      <v-list-item-title
        style="text-transform: uppercase; letter-spacing: .1em">
        {{ title }}
      </v-list-item-title>
    </template>
    <v-list-item
      dense
      v-for="(scrapeDataValue, key) in value" :key="key"
      v-if="!Array.isArray(scrapeDataValue)">
      <v-list-item-content class="list-item-label">{{ key }}</v-list-item-content>
      <v-list-item-action-text
        :class="[
          'list-item-value',
          (typeof scrapeDataValue === 'string' && scrapeDataValue.length > 300) && 'longform-text'
        ]">
        {{ scrapeDataValue }}
      </v-list-item-action-text>
    </v-list-item>
    <v-list-group
      sub-group
      v-for="(scrapeDataValue, key) in value" :key="key"
      v-if="Array.isArray(scrapeDataValue)"
      :class="[scrapeDataValue.length === 0 && 'list-disabled']">
      <template v-slot:activator>
        <v-list-item-title>{{ key }}</v-list-item-title>
        <v-list-item-action-text>{{ scrapeDataValue.length }}</v-list-item-action-text>
      </template>
      <v-list-item dense v-for="(obvDataV, key) in scrapeDataValue" :key="key">
        <v-list-item-content v-if="typeof key !== 'number'" class="list-item-label">{{ key }}</v-list-item-content>
        <v-list-item-action-text
          :class="[
            'list-item-value',
            (typeof obvDataV === 'string' && obvDataV.length > 300) && 'longform-text'
          ]">
            {{ obvDataV }}
        </v-list-item-action-text>
      </v-list-item>
    </v-list-group>
  </v-list-group>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { ServerResearchLemma } from '@/types/lemma'

@Component
export default class LemmaScrapeResult extends Vue {
  @Prop({ required: true }) value!: ServerResearchLemma['columns_scrape'][keyof ServerResearchLemma['columns_scrape']]
  @Prop({ required: true }) title!: string
}
</script>
<style lang="stylus" scoped>
.list-disabled
  pointer-events none
  opacity .5

.list-item-label
  overflow: visible

.longform-text
  text-align justify !important
  font-size 15px !important
</style>
<style lang="stylus">
.scrape-result .v-list-item--active
  background var(--v-background-base)
  position sticky
  z-index 1
  top: -16px
</style>
