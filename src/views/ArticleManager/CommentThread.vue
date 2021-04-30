<template>
  <div>
    <div class="thread-container pa-1" v-if="thread !== undefined">
      <div class="comment-container pa-1" v-for="(comment, i) in thread.comments" :key="comment.commentId">
        <div class="comment-header caption d-flex row no-gutters muted">
        {{ comment.user }} <v-spacer /> {{ formatTimeDistance(comment.date.toString()) }}
        </div>
        {{ comment.text }}
        <v-divider v-if="i !== thread.comments.length - 1" />
      </div>
    </div>
    <text-field
      v-model="newMessage"
      @keydown.meta.enter="appendComment"
      class="py-1 px-2 mt-1"
      :allow-new-line="true"
      placeholder="Nachricht …">
      <v-btn @click="appendComment" icon tile text><v-icon>mdi-check</v-icon></v-btn>
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

  @Prop({ required: true }) id!: string
  newMessage = ''
  store = store

  appendComment() {
    this.store.article.addComment(this.id, {
      commentId: uuid(),
      date: new Date(),
      user: 4,
      text: this.newMessage
    })
    this.newMessage = ''
  }

  mounted() {
    console.log('mounted', this.id)
  }

  get thread() {
    return this.store.article.getThread(this.id)
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
