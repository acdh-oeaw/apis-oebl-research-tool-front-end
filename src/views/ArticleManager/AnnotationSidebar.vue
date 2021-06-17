<template>
  <v-window :value="page" reverse>
    <v-window-item>
      <lobid-preview-card @click="openAnnotation" :gnd="store.article.annotations.map(a => a.entityId)" />
    </v-window-item>
    <v-window-item>
      <annotation
        style="width: 100%"
        v-if="selectedAnnotation"
        :editor="editor"
        :id="selectedAnnotation.id"
        :cached-entity="cachedEntity"
        :entity-id="selectedAnnotation.entityId"  />
    </v-window-item>
  </v-window>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import store from '@/store'
import LobidPreviewCard from '@/views/LemmaManager/LobidPreviewCard.vue'
import Annotation from './Annotation.vue'
import { Editor } from '@tiptap/vue-2'
import { AnnotationAttributes } from './extensionAnnotation'
import * as lobid from '@/service/lobid'

@Component({
  components: {
    LobidPreviewCard,
    Annotation
  }
})
export default class AnnotationSidebar extends Vue {

  @Prop({ required: true }) editor!: Editor

  page = 0
  store = store
  selectedAnnotation: AnnotationAttributes|null = null
  cachedEntity: any = null

  selectAnnotationByGnd(gnd: string) {
    const x = this.store.article.annotations.find(a => a.entityId === gnd)
    if (x !== undefined) {
      this.selectedAnnotation = x
      return x
    }
  }

  async openAnnotation(gnd: string) {
    this.selectAnnotationByGnd(gnd)
    this.cachedEntity = await lobid.get(gnd)
    this.page = 1
  }

  mounted() {

  }
}
</script>
<style lang="scss" scoped>
</style>
