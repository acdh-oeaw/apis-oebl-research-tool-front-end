<template>
  <div>
    <div class="muted caption mb-2 text-center">
      {{ annotationsInEditor.length }} Annotation(en)
    </div>
    <div
      v-for="annotation in annotationsInEditor"
      :key="getAttrsFromNode(annotation).id"
      :data-id="getAttrsFromNode(annotation).id"
      @mouseenter="showLine($event.target, annotation)">
      <v-divider class="my-2" />
      <div v-if="getAttrsFromNode(annotation).entityId !== null">
        <lobid-preview-card
          @click="openAnnotation(annotation)"
          :gnd="[ getAttrsFromNode(annotation).entityId ]" />
        <div v-if="getAttrsFromNode(annotation).isConfirmed === 'false'" class="text-right confirm-btns mr-4">
          <v-btn @click="removeAnnotation(annotation)" elevation="0" class="rounded-lg" color="background darken-3 mr-1" small>
            ablehnen
          </v-btn>
          <v-btn @click="updateAttrs(annotation, { isConfirmed: 'true' })" elevation="0" class="white--text rounded-lg" color="green lighten-1" small>
            <v-icon left small>mdi-check</v-icon>annehmen
          </v-btn>
        </div>
      </div>
      <v-row
        @click="openAnnotation(annotation)"
        v-else
        no-gutters>
        <v-col cols="3" class="text-center">
          <v-icon color="green">mdi-progress-question</v-icon>
        </v-col>
        <v-col>
          … {{ getTextFromNode(annotation) }} …
        </v-col>
      </v-row>
    </div>
    <v-divider class="my-2" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import LobidPreviewCard from '@/views/LemmaManager/LobidPreviewCard.vue'
import Annotation from './Annotation.vue'
import { Editor, Mark, NodeWithPos } from '@tiptap/vue-2'
import { AnnotationAttributes } from './extensionAnnotation'
import { findChildrenByMark } from 'prosemirror-utils'
import { Node } from 'prosemirror-model'
import { Transaction } from 'prosemirror-state'
import { showLine, hideLine, removeLine, hideAllLines } from '../lib/lines'

interface AnnotationMark extends Mark {
  attrs: AnnotationAttributes
}

interface AnnotatedNode extends NodeWithPos {
  node: Node<any> & {
    marks: (AnnotationMark)[]
  }
}

@Component({
  components: {
    LobidPreviewCard,
    Annotation
  }
})
export default class AnnotationSidebar extends Vue {

  @Prop({ required: true }) editor!: Editor

  page = 0
  annotationsInEditor: AnnotatedNode[] = []
  selectedAnnotation: AnnotationAttributes|null = null
  cachedEntity: any = null

  getMarkElement(id: string) {
    return document.querySelector(`mark[data-id="${ id }"]`)
  }

  showLine(e: HTMLElement, a: AnnotatedNode) {
    const { id } = this.getAttrsFromNode(a)
    const e2 = this.getMarkElement(id)
    hideAllLines(id)
    showLine({
      key: id,
      start: e,
      end: e2,
      color: '#89dfa3'
    })
    if (e && e2) {
      e.addEventListener('mouseleave', function onLeave() {
        hideLine(id)
        e.removeEventListener('mouseleave', onLeave)
      })
    }
  }

  updateAttrs(a: AnnotatedNode, p: Partial<AnnotationAttributes>) {
    this.editor.commands.updateAttributes('annotation', {
      ...this.getAttrsFromNode(a),
      ...p
    })
  }

  removeAnnotation(a: AnnotatedNode) {
    const { id } = this.getAttrsFromNode(a)
    removeLine(id)
    this.editor.commands.setTextSelection({ from: a.pos, to: a.pos + a.node.textContent.length })
    this.editor.commands.unsetMark(a.node.marks[0].type)
  }

  getAttrsFromNode(n: AnnotatedNode): AnnotationAttributes {
    return n.node.marks[0].attrs
  }

  getTextFromNode(n: AnnotatedNode): string {
    return n.node.textContent
  }

  selectAnnotationByGnd(gnd: string) {
    const x = this.annotationsInEditor.find(a => this.getAttrsFromNode(a).entityId === gnd)
    if (x !== undefined) {
      this.selectedAnnotation = this.getAttrsFromNode(x)
      return x
    }
  }

  openAnnotation(n: AnnotatedNode) {
    const { id } = this.getAttrsFromNode(n)
    this.editor.commands.focus()
    this.editor.commands.setTextSelection({from: n.pos, to: n.pos + n.node.textContent.length })
    const el = this.getMarkElement(id)
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  async openAnnotationByEntityId(id: string) {
    const annotations = findChildrenByMark(this.editor.state.doc, this.editor.schema.marks.annotation, true)
    const selectedAnnotation = annotations.find(n => {
      return n.node.marks.some((m: any) => m.attrs.entityId === id)
    })
    if (selectedAnnotation !== undefined) {
      this.openAnnotation(selectedAnnotation as AnnotatedNode)
    }
  }

  findAnnotationIdsInDoc(): AnnotatedNode[] {
    return findChildrenByMark(this.editor.state.doc, this.editor.schema.marks.annotation, true) as AnnotatedNode[]
  }

  mounted() {
    this.annotationsInEditor = this.findAnnotationIdsInDoc()
    this.editor.on('transaction', this.onTransaction)
  }

  beforeDestroy() {
    this.editor.off('transaction', this.onTransaction)
  }

  onTransaction({ transaction }: { transaction: Transaction }) {
    if (transaction.docChanged) {
      const currentAnnotations = this.findAnnotationIdsInDoc()
      if (JSON.stringify(currentAnnotations) !== JSON.stringify(this.annotationsInEditor)) {
        this.annotationsInEditor = this.findAnnotationIdsInDoc()
      }
    }
  }

}
</script>
<style lang="stylus" scoped>
.confirm-btns
  right 0
  position absolute
  transform translateY(-100%)
</style>
