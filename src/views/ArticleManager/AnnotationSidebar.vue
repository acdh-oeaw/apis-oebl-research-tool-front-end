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
      <v-btn
        v-else
        block
        color="background darken-3"
        elevation="0"
        class="mb-2 mt-2 rounded-lg"
        @click="openAnnotation(annotation)">
        <v-icon color="green" small left>mdi-progress-question</v-icon>
        … {{ getTextFromNode(annotation) }} …
      </v-btn>
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
import LeaderLine from 'leader-line'

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

  showLine(e: HTMLElement, a: AnnotatedNode) {
    const id = this.getAttrsFromNode(a).id
    const e2 = document.querySelector(`mark[data-id="${ id }"]`)
    if (e && e2) {
      const l = new LeaderLine({
        start: e,
        end: e2,
        dash: {
          animation: true
        },
        startPlug: 'disc',
        endPlug: 'disc',
        startSocket: 'left',
        showEffectName: 'draw',
        endSocket: 'right',
        // path: 'magnet',
        color: '#89dfa3'
      })
      e.addEventListener('mouseleave', function onLeave() {
        l.hide('fade')
        e.removeEventListener('mouseleave', onLeave)
        setTimeout(() => l.remove(), 300)
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
    console.log(n)
    this.editor.commands.focus()
    this.editor.commands.setTextSelection({from: n.pos, to: n.pos + n.node.textContent.length })
    this.editor.commands.scrollIntoView()
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

  // updatePositions() {
  //   if (this.showLines) {
  //     Object.values(this.lines).forEach((l: any) => l.position())
  //   }
  // }

  // upsertLines(ids: string[]) {
  //   ids.forEach(id => {
  //     // it’s new
  //     if (this.lines[id] === undefined) {
  //       const e1 = this.$el.querySelector(`[data-id="${ id }"]`)
  //       const e2 = document.querySelector(`mark[data-id="${ id }"]`)
  //       if (e1 !== null && e2 !== null) {
  //         this.lines[id] = new LeaderLine({
  //           start: e1,
  //           end: e2,
  //           startPlug: 'disc',
  //           endPlug: 'disc',
  //           startSocket: 'left',
  //           endSocket: 'right',
  //           path: 'magnet',
  //           color: '#89dfa3'
  //         })
  //       }
  //     } else {
  //       this.lines[id].position()
  //     }
  //   })
  // }

  // removeUnusedLines(ids: string[]) {
  //   Object.keys(this.lines).forEach(id => {
  //     if (!ids.includes(id)) {
  //       this.lines[id].remove()
  //       Vue.delete(this.lines, id)
  //     }
  //   })
  // }

  // @Watch('showLines')
  // onChangeShowLines() {
  //   if (this.showLines === true) {
  //     this.showAllLines()
  //   } else {
  //     this.hideAllLines()
  //   }
  // }

  // async showAllLines() {
  //   Object.values(this.lines).forEach(l => l.show())
  // }

  // async hideAllLines() {
  //   Object.values(this.lines).forEach(l => l.hide())
  // }

  // async updateLines(ns: AnnotatedNode[]) {
  //   // await this.$nextTick()
  //   const ids = ns.map(n => this.getAttrsFromNode(n).id)
  //   this.removeUnusedLines(ids)
  //   this.upsertLines(ids)
  // }

  mounted() {
    this.annotationsInEditor = this.findAnnotationIdsInDoc()
    this.editor.on('transaction', ({ transaction }: { transaction: Transaction }) => {
      const changedAnnotations = transaction.steps.filter(s => {
        const t = s.toJSON()
        return (t.stepType === 'addMark' || t.stepType === 'removeMark') && t.mark.type === 'annotation'
      })
      if (changedAnnotations.length > 0) {
        this.annotationsInEditor = this.findAnnotationIdsInDoc()
        // this.$nextTick(() => {
        //   this.updateLines(this.annotationsInEditor)
        // })
      }
    })
    // const m = document.querySelector('.v-main')
    // const o = document.querySelector('.sidebar-content')
    // if (m instanceof HTMLElement && o instanceof HTMLElement) {
    //   m.addEventListener('scroll', this.updatePositions)
    //   o.addEventListener('scroll', this.updatePositions)
    // }
  }
}
</script>
<style lang="stylus" scoped>
.confirm-btns
  right 0
  position absolute
  transform translateY(-100%)
</style>
