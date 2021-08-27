<template>
  <div v-if="cachedItem !== null">
    {{ getAuthors(cachedItem) }} ({{ cachedItem.data.date }}): {{ cachedItem.data.title }}. {{ quotedRange }}
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import zotero, { ZoteroItem } from '@/service/zotero'
import _ from 'lodash'

@Component
export default class CitationDisplay extends Vue {

  @Prop({ required: true }) zoteroKey!: string
  @Prop({ required: true }) quotedRange!: string|null

  readonly maxAuthors = 3
  cachedItem: ZoteroItem|null = null

  @Watch('zoteroKey', { immediate: true })
  async onChangeZoteroKey(newV: string, oldV: string) {
    if (newV !== null && oldV !== newV) {
      this.cachedItem = await zotero.getItem(newV)
    }
  }

  getAuthors(i: ZoteroItem) {
    return (
      _.take(i.data.creators, this.maxAuthors)
        .map(a => `${ a.lastName }, ${ a.firstName }`)
        .join(' / ')
    ) + (i.data.creators.length > this.maxAuthors ? 'et al.' : '')
  }

}
</script>

<style lang="scss" scoped>
</style>
