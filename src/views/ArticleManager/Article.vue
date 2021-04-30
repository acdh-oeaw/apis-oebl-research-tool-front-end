@@ -0,0 +1,89 @@
<template>
  <div>
    <v-app-bar
      app
      :style="{transition: 'none'}"
      height="75"
      color="background"
      flat>
      <v-btn v-if="!store.settings.showNavDrawer" @click="toggleDrawer" tile class="rounded-lg" icon>
        <v-icon>mdi-dock-left</v-icon>
      </v-btn>
      <h1 v-if="issueLemma">{{ issueLemma.lemma.firstName }} {{ issueLemma.lemma.lastName }}</h1>
      <v-spacer />
      <div v-if="editor">
        <select-menu
          :hide-searchbar="true"
          :show-caret="false"
          prepend-icon="mdi-magnify"
          class="rounded-lg"
          v-model="selectedZoomLevel"
          :items="zoomSteps" />
        <v-btn
          class="rounded-lg"
          tile
          icon
          @click="editor.chain().focus().toggleFootnote().run()">
          <v-icon>mdi-pencil-circle-outline</v-icon>
        </v-btn>
        <v-btn
          class="rounded-lg"
          tile
          icon
          @click="editor.chain().focus().toggleComment().run()">
          <v-icon>mdi-message-outline</v-icon>
        </v-btn>
        <v-btn class="rounded-lg" tile icon @click="editor.chain().focus().undo().run()">
          <v-icon>mdi-undo</v-icon>
        </v-btn>
        <v-btn class="rounded-lg mr-3" tile icon @click="editor.chain().focus().redo().run()">
          <v-icon>mdi-redo</v-icon>
        </v-btn>
      </div>
    </v-app-bar>
    <resizable-drawer
      color="background"
      :card="true"
      :right="true"
      :min-width="300"
      :width="store.settings.drawerRightWidth"
      @update:width="store.settings = { ...store.settings, drawerRightWidth: $event}"
      :value="store.lemma.showSideBar">
      <issue-lemma-detail :lemma="issueLemma" />
    </resizable-drawer>
    <v-main style="max-height: calc(100vh - 75px); overflow: auto">
      <div class="pa-5 outer-editor mx-auto" v-if="issueLemma !== null">
        <div :style="{ fontSize: (16 * this.selectedZoomLevel.value) + 'px' }">
          <editor-content
            class="mt-3 tiptap-editor"
            :editor="editor" />
          <v-divider class="mb-5 mx-5 mt-5" />
          <sup>1</sup> Arnold Graf: A credible Theory of Everything. 2022. Hubris & Sons Publishing.
        </div>
      </div>
    </v-main>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ResizableDrawer from '@/views/lib/ResizableDrawer.vue'
import SelectMenu from '@/views/lib/SelectMenu.vue'

import { Editor, EditorContent } from '@tiptap/vue-2'
import { defaultExtensions } from '@tiptap/starter-kit'
import { Comment } from './extensionComment'
import { Footnote } from './extensionFootnote'
import IssueLemmaDetail from '../IssueManager/IssueLemmaDetail.vue'
// import { findChildrenByMark } from 'prosemirror-utils'
import Highlight from '@tiptap/extension-highlight'

import store from '@/store'
import { IssueLemma } from '@/api'

@Component({
  components: {
    ResizableDrawer,
    SelectMenu,
    EditorContent,
    IssueLemmaDetail
  }
})
export default class Article extends Vue {

  @Prop({ required: true }) issueLemmaId!: number
  issueLemma: IssueLemma|null = null
  editor: Editor|null = null

  async mounted() {
    this.issueLemma = (await this.store.issue.getIssueLemmaById(this.issueLemmaId)) || null
    await store.article.loadArticle(this.issueLemmaId)
    await store.article.loadComments(this.issueLemmaId)
    this.editor = new Editor({
      content: store.article.article,
      extensions: [
        Highlight,
        Footnote,
        Comment,
        ...defaultExtensions()
      ],
      onTransaction(a) {
        // const commentNodes = findChildrenByMark(a.transaction.doc, a.editor.schema.marks.comment)
        // const comments = commentNodes.map((n) => {
        //   return n.node.marks.find((m: any) => m.type.name === 'comment')
        // }).filter(m => m !== undefined)
        // const footnoteNodes = findChildrenByMark(a.transaction.doc, a.editor.schema.marks.footnote)
        // const footnotes = footnoteNodes.map(n => {
        //   return n.node.marks.find((m: any) => m.type.name === 'footnote')
        // }).filter(m => m !== undefined)

        // const $pos = a.transaction.doc.resolve(a.editor.state.selection.$from.pos)
        // const box = a.editor.view.coordsAtPos(a.transaction.selection.$from.pos - $pos.textOffset)
        // const parent = $pos.parent
        // const start = parent.childAfter($pos.parentOffset)
        // const selectedComments = start.node?.marks.find(mark => mark.type.name === 'comment')
        // console.log({ selectedComments })
        // console.log({ box })
        // console.log({ comments, footnotes })
      },
      onUpdate(a) {
        // console.log(a)
      }
    })
  }

  store = store
  toolbarPaddingY = 15
  selectedZoomLevel = {
    name: '100%',
    value: 1
  }

  zoomSteps = [
    {
      name: '80%',
      value: .8
    },
    {
      name: '100%',
      value: 1
    },
    {
      name: '120%',
      value: 1.2
    }
  ]

  toggleDrawer() {
    this.store.settings = { ...this.store.settings, showNavDrawer: !this.store.settings.showNavDrawer }
  }

  beforeDestroy() {
    if (this.editor !== null) {
      this.editor.destroy()
    }
  }
}
</script>
<style lang="stylus" scoped>
.outer-editor
  max-width: 60em
  line-height 1.6

.tiptap-editor /deep/ [contenteditable]
  outline 0 !important

.tiptap-editor /deep/ comment
  border-radius 4px
  background #ffc864
  padding 4px

.tiptap-editor /deep/ footnote
  display inline-block
  position relative
  cursor pointer
  border-bottom 2px dashed rgba(0,0,20, .2)

.tiptap-editor /deep/ footnote::after
  content counter(prosemirror-footnote)
  vertical-align super
  font-size 75%
  counter-increment prosemirror-footnote

</style>
