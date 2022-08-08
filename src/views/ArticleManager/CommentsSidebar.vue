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
      @mouseenter.native="showLine(thread.threadId)"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import CommentThread from './CommentThread.vue'
import store from '@/store'
import { Editor } from '@tiptap/vue-2'
import { Transaction } from 'prosemirror-state'
import { findChildrenByMark } from 'prosemirror-utils'
import { hideAllLines, showLine, hideLine } from '../lib/lines'

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
  visibleComments: any[] = []; // CommentThreadType TODO: remove comment

  showLine(id: string) {
    const els = document.querySelectorAll(`[data-id="${ id }"]`)
    hideAllLines(id)
    if (els.length === 2) {
      showLine({
        key: id,
        start: els[0],
        end: els[1],
        color: '#f0c26f'
      })
      els[0].addEventListener('mouseleave', function onLeave() {
        hideLine(id)
        els[0].removeEventListener('mouseleave', onLeave)
      })
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

  findCommentIdsInDoc() {
    const comments = findChildrenByMark(this.editor.state.doc, this.editor.schema.marks.comment, true)
    return comments.map(c => {
      return c.node.marks[0].attrs.id
    })
  }

  mounted() {
    console.warn('nothing is implemented here. TODO');
    this.visibleComments = []; 
    //this.findCommentIdsInDoc()
    //   .map((c) => store.article.getThread(c))
    //   .filter(notEmpty)
    this.editor.on('transaction', ({ transaction }: { transaction: Transaction }) => {
      // if (transaction.docChanged) {
      //   this.visibleComments = this.findCommentIdsInDoc()
      //     .map((c) => store.article.getThread(c))
      //     .filter(notEmpty)
      // }
      // const hasCommentMarks = transaction.steps.filter(s => {
      //   const t = s.toJSON()
      //   return (t.stepType === 'addMark' || t.stepType === 'removeMark') && t.mark.type === 'comment'
      // })
      // if (hasCommentMarks.length > 0) {
      // }
    })
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
