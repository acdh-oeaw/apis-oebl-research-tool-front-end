<template>
  <div v-if="title !== null">
    <span>
      {{ title.data.creators.map(c => c.lastName + ', ' + c.firstName).join(' / ') }}
    </span>
    <span>
      ({{ title.data.date }}):
    </span>
    <span>
      {{ title.data.title }}.
    </span>
    <span v-if="value.quotedRange !== null">
      {{ value.quotedRange }}.
    </span>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Citation } from '@/store/article'

@Component
export default class CitationDisplay extends Vue {
  @Prop({ required: true }) value!: Citation
  get title() {
    return this.value.zoteroItemCached
  }
}
</script>
<style lang="stylus" scoped>
</style>
