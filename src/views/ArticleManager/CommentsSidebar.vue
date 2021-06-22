<template>
  <div>
    <comment-thread
      class="comment-thread pt-1 pb-0 mb-1"
      style="width: 100% !important;"
      v-for="thread in visibleComments"
      @click.native="scrollIntoView(thread.threadId)"
      :key="thread.threadId"
      :id="thread.threadId"
      :data-id="thread.threadId"
      :editor="editor"
      :scrollable="false"
      :show-header="false"
      ref="comments"
      @mouseover.native="highlightLine(thread.threadId)"
      @mouseout.native="unhighlightLine(thread.threadId)"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import CommentThread from './CommentThread.vue'
import { CommentThread as CommentThreadType } from '@/store/article'
import store from '@/store'
import LeaderLine from 'leader-line'
import { Editor } from '@tiptap/vue-2'
import _ from 'lodash'
import { Transaction } from 'prosemirror-state'
import { findChildrenByMark } from 'prosemirror-utils'

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

@Component({
  components: {
    CommentThread
  }
})
export default class CommentsSidebar extends Vue {

  @Prop({ default: false }) showLines!: boolean
  @Prop({ required: true }) editor!: Editor

  store = store
  lines: { [id: string]: any } = {}

  visibleComments: CommentThreadType[] = []

  @Watch('showLines', { immediate: true })
  onChangeLineVisibility(sl: boolean) {
    if (sl === true) {
      this.$nextTick(() => {
        Object.values(this.lines).forEach(t => t.show())
      })
    } else {
      Object.values(this.lines).forEach(t => t.hide())
    }
  }

  removeAllLines() {
    Object.values(this.lines).forEach(l => l.remove())
    this.lines = {}
  }

  addAllLines(cs: CommentThreadType[]) {
    this.lines = _(cs).keyBy('threadId').mapValues(c => this.addLine(c.threadId)).value()
  }

  @Watch('visibleComments')
  async onChangeThreads() {
    if (this.showLines) {
      this.removeAllLines()
      await this.$nextTick()
      this.addAllLines(this.visibleComments)
    }
  }

  getCommentElement(id: string) {
    return document.querySelector(`comment[data-id="${ id }"]`)
  }

  scrollIntoView(id: string) {
    const e = this.getCommentElement(id)
    if (e instanceof HTMLElement) {
      e.scrollIntoView({ behavior: 'smooth' })
    }
  }

  highlightLine(id: string) {
    if (this.lines[id] !== undefined) {
      this.lines[id].setOptions({ color: '#f0c26f' })
    }
  }

  unhighlightLine(id: string) {
    if (this.lines[id] !== undefined) {
      this.lines[id].setOptions({ color: '#ffe1ab' })
    }
  }

  addLine(threadId: string) {
    const els = document.querySelectorAll(`[data-id="${ threadId }"]`)
    console.log(els)
    if (els.length === 2) {
      const l = new LeaderLine({
        startPlug: 'disc',
        endPlug: 'disc',
        startSocket: 'left',
        endSocket: 'right',
        path: 'magnet',
        start: els[0],
        end: els[1],
        color: '#ffe1ab'
      })
      return l
    }
  }

  findCommentIdsInDoc() {
    const comments = findChildrenByMark(this.editor.state.doc, this.editor.schema.marks.comment, true)
    return comments.map(c => {
      return c.node.marks[0].attrs.id
    })
  }

  updatePositions() {
    if (this.showLines) {
      Object.values(this.lines).forEach((l: any) => l.position())
    }
  }

  mounted() {
    const m = document.querySelector('.v-main')
    const o = document.querySelector('.sidebar-content')
    if (m instanceof HTMLElement && o instanceof HTMLElement) {
      m.addEventListener('scroll', this.updatePositions)
      o.addEventListener('scroll', this.updatePositions)
    }
    this.visibleComments = this.findCommentIdsInDoc()
      .map((c) => store.article.getThread(c))
      .filter(notEmpty)
    this.editor.on('transaction', ({ transaction }: { transaction: Transaction }) => {
      const hasCommentMarks = transaction.steps.filter(s => {
        const t = s.toJSON()
        return (t.stepType === 'addMark' || t.stepType === 'removeMark') && t.mark.type === 'comment'
      })
      if (hasCommentMarks.length > 0) {
        this.visibleComments = this.findCommentIdsInDoc()
          .map((c) => store.article.getThread(c))
          .filter(notEmpty)
      }
    })
  }

  beforeDestroy() {
    Object.values(this.lines).forEach(l => l.remove())
    this.lines = {}
  }

  hideLine(threadId: string) {
    if (this.lines[threadId]) {
      this.lines[threadId].hide()
    }
  }

}
</script>
<style lang="stylus" scoped>
.comment-thread
  background-color #ffe1aab5
  border-radius 10px
  border 3px solid transparent
  &:hover
    border 3px solid #f0c26f
</style>

<style lang="stylus">
// make sure the leader lines
// don’t get cut off by the 
// navigation bar
.leader-line
  z-index 6
</style>

