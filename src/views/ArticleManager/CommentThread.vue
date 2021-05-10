<template>
  <div style="min-width: 220px">
    <div class="thread-header row no-gutters pt-1">
      <v-btn class="rounded-lg pl-1 muted" text small><v-icon small>mdi-menu-down</v-icon>Status: offen</v-btn>
      <v-spacer />
      <v-btn class="rounded-lg" tile small icon><v-icon small>mdi-chevron-left</v-icon></v-btn>
      <v-btn class="rounded-lg" tile small icon><v-icon small>mdi-chevron-right</v-icon></v-btn>
    </div>
    <div ref="threadContainer" class="thread-container" v-if="thread !== undefined">
      <div class="comment-container" v-for="(comment, i) in thread.comments" :key="comment.commentId">
        <div class="comment-header caption d-flex row no-gutters muted px-2 mt-1">
          User {{ comment.user }} <v-spacer /> {{ formatTimeDistance(comment.date.toString()) }}
        </div>
        <div class="px-2">
          {{ comment.text }}
        </div>
        <v-divider class="mt-2" v-if="thread !== undefined && i !== thread.comments.length - 1" />
      </div>
    </div>
    <v-divider v-if="thread !== undefined && thread.comments.length > 0" class="my-2" />
    <text-field
      v-model="newMessage"
      @keydown.meta.enter="appendComment"
      class="py-0 px-2 mt-1"
      :allow-new-line="true"
      placeholder="Kommentar hinzufügen …">
      <v-btn class="rounded-lg" @click="appendComment" icon tile text><v-icon small>mdi-send</v-icon></v-btn>
    </text-field>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import TextField from '../lib/TextField.vue'
import store from '@/store'
import formatDistanceToNow from 'date-fns/esm/formatDistanceToNow'
import de from 'date-fns/esm/locale/de'
import { v4 as uuid } from 'uuid'

@Component({
  components: {
    TextField
  }
})
export default class CommentThread extends Vue {

  @Prop({ default: null }) id!: string|null
  newMessage = ''
  store = store

  appendComment() {
    if (this.id !== null) {
      this.store.article.addComment(this.id, {
        commentId: uuid(),
        date: new Date(),
        user: 4,
        text: this.newMessage
      })
      this.newMessage = ''
    } else {
      throw new Error('Can’t append comment. No Thread Id given.')
    }
  }

  @Watch('id')
  onChangeThreadId() {
    console.log('changed', this.id)
    const el = this.$refs.threadContainer
    if (el instanceof HTMLElement) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  mounted() {
    console.log('mounted', this.id)
  }

  get thread() {
    if (this.id !== null) {
      return this.store.article.getThread(this.id)
    }
  }

  formatTimeDistance(d: string|undefined): string {
    if (d !== undefined) {
      return `${ formatDistanceToNow(new Date(d), { locale: de, addSuffix: true }) }`
    } else {
      return ''
    }
  }

}
</script>
<style lang="stylus" scoped>
.thread-container
  max-height 300px
  overflow auto
</style>
