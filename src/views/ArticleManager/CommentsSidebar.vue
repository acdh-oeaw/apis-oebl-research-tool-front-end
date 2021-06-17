<template>
  <div>
    <comment-thread
      class="comment-thread pt-1 pb-0 mb-1"
      style="width: 100% !important;"
      v-for="thread in store.article.threads"
      @click.native="scrollIntoView(thread.threadId)"
      :key="thread.threadId"
      :id="thread.threadId"
      :data-id="thread.threadId"
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
import store from '@/store'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import LeaderLine from 'leader-line'

@Component({
  components: {
    CommentThread
  }
})
export default class CommentsSidebar extends Vue {

  @Prop({ default: false }) showLines!: boolean

  store = store
  lines: { [id: string]: any } = {}

  @Watch('showLines', { immediate: true })
  onChangeLineVisibility(sl: boolean) {
    if (sl === true) {
      this.$nextTick(() => {
        store.article.threads.map(t => {
          this.showLine(t.threadId)
        })
      })
    } else {
      store.article.threads.map(t => {
        this.hideLine(t.threadId)
      })
    }
  }

  @Watch('store.article.threads')
  onChangeThreads() {
    if (this.showLines) {
      this.$nextTick(() => {
        store.article.threads.map(t => {
          this.showLine(t.threadId)
        })
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

  showLine(threadId: string) {
    const els = document.querySelectorAll(`[data-id="${ threadId }"]`)
    if (this.lines[threadId]) {
      this.lines[threadId].show()
    } else {
      if (els.length === 2) {
        this.lines[threadId] = new LeaderLine({
          startPlug: 'disc',
          endPlug: 'disc',
          startSocket: 'left',
          endSocket: 'right',
          // path: 'grid',
          start: els[0],
          end: els[1],
          color: '#ffe1ab'
        })
      }
    }
    return this.lines[threadId]
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

  updated() {
    this.updatePositions()
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
