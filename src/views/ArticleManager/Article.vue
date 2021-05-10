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
      <div v-if="issueLemma">
        <h1 style="margin-bottom: -3px">{{ issueLemma.lemma.lastName }}, {{ issueLemma.lemma.firstName }} </h1>
        <div class="caption text-no-wrap muted">
          Biographie
        </div>
      </div>
      <v-spacer />
      <div v-if="editor">
        <select-menu
          :hide-searchbar="true"
          :show-caret="true"
          class="rounded-lg"
          btn-class="pl-2"
          :value="store.settings.articleZoomFactor"
          :return-value="true"
          @input="store.settings = { ...store.settings, articleZoomFactor: $event }"
          :items="zoomSteps" />
        <select-menu
          :hide-searchbar="true"
          :show-caret="true"
          class="rounded-lg"
          btn-class="pl-2"
          :items="formattingItems"
          :value="activeFormatting"
          @input="onSelectFormatting"
        />
        <v-tooltip transition="none" bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="rounded-lg"
              tile
              v-on="on"
              v-bind="attrs"
              icon
              @click="editor.chain().focus().toggleCitation().run()">
              <v-icon>mdi-book-open-page-variant-outline</v-icon>
            </v-btn>
            </template>
          <span>Zitat einfügen</span>
        </v-tooltip>
        <v-btn
          class="rounded-lg"
          tile
          icon
          @click="editor.chain().focus().toggleComment().run()">
          <v-icon>mdi-message-outline</v-icon>
        </v-btn>
        <!-- <v-btn class="rounded-lg" tile icon @click="editor.chain().focus().undo().run()">
          <v-icon>mdi-undo</v-icon>
        </v-btn>
        <v-btn class="rounded-lg" tile icon @click="editor.chain().focus().redo().run()">
          <v-icon>mdi-redo</v-icon>
        </v-btn> -->
        <v-menu
          content-class="soft-shadow"
          offset-y
          left
          bottom
          :close-on-content-click="false">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              tile
              class="rounded-lg mr-3"
              icon>
              <v-icon>mdi-dots-horizontal-circle-outline</v-icon>
            </v-btn>
          </template>
          <v-list color="background lighten-2" class="text-body-2 rounded-lg elevation-0s" dense nav>
          </v-list>
          </v-menu>
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
      <issue-lemma-detail v-if="issueLemma !== null" :lemma="issueLemma" />
    </resizable-drawer>
    <v-main style="max-height: calc(100vh - 75px); overflow: auto">
      <div class="px-5 outer-editor mx-auto">
        <div class="px-5" :style="{ fontSize: (16 * store.settings.articleZoomFactor) + 'px' }">
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
import { Citation } from './extensionCitation'
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

  formattingItems = [
    {
      name: 'Text',
      value: 'paragraph',
      isActive: (e: Editor) => e.isActive('paragraph'),
      onSelect: (e: Editor) => e.chain().focus().setParagraph().run(),
    },
    {
      name: 'Überschrift 1',
      value: 'heading-1',
      isActive: (e: Editor) => e.isActive('heading', { level: 1 }),
      onSelect: (e: Editor) => e.chain().focus().setHeading({ level: 1 }).run()
    },
    {
      name: 'Überschrift 2',
      value: 'heading-2',
      isActive: (e: Editor) => e.isActive('heading', { level: 2 }),
      onSelect: (e: Editor) => e.chain().focus().setHeading({ level: 2 }).run()
    }
  ]

  activeFormatting: any = this.formattingItems[0]

  onSelectFormatting(v: any) {
    console.log(v, this.editor)
    v.onSelect(this.editor)
  }

  async mounted() {
    // this.issueLemma = (await this.store.issue.getIssueLemmaById(this.issueLemmaId)) || null
    await store.article.loadArticle(this.issueLemmaId)
    // await store.article.loadComments(this.issueLemmaId)
    const vm = this
    this.editor = new Editor({
      content: store.article.article,
      extensions: [
        Highlight,
        Citation,
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
        vm.activeFormatting = vm.formattingItems.find(fi => fi.isActive(vm.editor!))
      },
      onUpdate() {
      }
    })
  }

  store = store
  toolbarPaddingY = 15

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
  --comment-color: #ffe1ab
  --footnote-color: rgba(0,0,20,.07)
  max-width: 60em
  line-height 1.6
  counter-resset prosemirror-footnote

// .tiptap-editor /deep/ *
//   color #333

.tiptap-editor /deep/ [contenteditable]
  outline 0 !important

.tiptap-editor /deep/ h1
  line-height 1.1em
  padding-bottom .4em

.tiptap-editor /deep/ h2
  padding-bottom .4em

.tiptap-editor /deep/ comment
  border-radius 4px
  background var(--comment-color)
  padding 4px

.tiptap-editor /deep/ footnote
  border-radius 4px
  background var(--footnote-color)
  padding 4px

.tiptap-editor /deep/ footnote:after
  content counter(prosemirror-footnote)
  vertical-align super
  font-size 75%
  counter-increment prosemirror-footnote

.tiptap-editor /deep/ footnote > comment
.tiptap-editor /deep/ comment > footnote
  background: repeating-linear-gradient(
    45deg,
    var(--comment-color),
    var(--comment-color) 10px,
    var(--footnote-color) 10px,
    var(--footnote-color) 20px
  );

</style>
