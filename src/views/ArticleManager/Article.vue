<template>
  <div class="fill-height">
    <v-dialog max-width="800" v-model="showSendWindow">
      <v-card class="rounded-lg soft-shadow">
        <v-card-title>
          <v-btn class="rounded-lg" color="background darken-2" elevation="0" @click="showSendWindow = false">
            Abbrechen
          </v-btn>
          <v-spacer />
          Artikel an "Autor" schicken
          <v-spacer />
          <v-btn class="rounded-lg" color="primary" elevation="0" @click="showSendWindow = false">
            <v-icon small left>mdi-send</v-icon>
            Senden
          </v-btn>
        </v-card-title>
        <v-card-text>
          <text-field
            class="pa-3"
            style="min-height: 200px"
            :allowNewLine="true"
            placeholder="Persönliche Nachricht eingeben…" />
        </v-card-text>
        <v-card-actions>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-app-bar
      app
      :style="{transition: 'none'}"
      height="75"
      class="px-2"
      color="background"
      flat>
      <v-btn v-if="!store.settings.showNavDrawer" @click="toggleDrawer" tile class="rounded-lg" icon>
        <v-icon>mdi-dock-left</v-icon>
      </v-btn>
      <div>
        <h1 style="margin-bottom: -3px">
          {{ issueLemma ? issueLemma.lemma.firstName + ' ' + issueLemma.lemma.lastName : 'Lade…' }}</h1>
        <div class="caption text-no-wrap muted pl-1">
          Biographie
        </div>
      </div>
      <v-spacer />
      <v-slide-group class="ml-2">
        <v-slide-item>
          <v-card color="background darken-2" elevation="0" class="rounded-lg pa-1">
            <div class="tb-tooltip caption muted">Zoom</div>
            <select-menu
              :hide-searchbar="true"
              :show-caret="true"
              class="rounded-lg"
              btn-class="pl-2"
              :value="store.settings.articleZoomFactor"
              :return-value="true"
              @input="store.settings = { ...store.settings, articleZoomFactor: $event }"
              :items="zoomSteps" />
          </v-card>
        </v-slide-item>
        <v-slide-item>
          <v-card color="background darken-2" elevation="0" class="ml-5 rounded-lg pa-1">
            <div class="tb-tooltip caption muted">Format</div>
            <select-menu
              :hide-searchbar="true"
              :show-caret="true"
              class="rounded-lg"
              btn-class="pl-2"
              style="width: 100px"
              :items="formattingItems"
              :value="activeFormatting"
              @input="onSelectFormatting"
            />
            <v-btn
              class="rounded-lg"
              small
              text
              icon
              @click="editor.chain().focus().toggleItalic().run()">
              <v-icon small>mdi-format-italic</v-icon>
            </v-btn>
            <v-btn
              class="rounded-lg"
              small
              text
              icon
              @click="editor.chain().focus().toggleBold()">
              <v-icon small>mdi-format-bold</v-icon>
            </v-btn>
          </v-card>
        </v-slide-item>
        <v-slide-item>
          <v-card color="background darken-2" elevation="0" class="rounded-lg pa-1 ml-5 mr-5">
            <div class="tb-tooltip caption muted">Einfügen</div>
            <v-btn
              class="rounded-lg"
              small
              text
              @click="editor.chain().focus().toggleCitation().run()">
              <v-icon small left>mdi-book-open-page-variant-outline</v-icon>
              Zitat
            </v-btn>
            <v-btn
              class="rounded-lg"
              small
              text
              @click="editor.chain().focus().toggleAnnotation().run()">
              <v-icon small left>mdi-earth</v-icon>
              Annotation
            </v-btn>
            <v-btn
              class="rounded-lg"
              small
              text
              @click="editor.chain().focus().toggleComment().run()">
              <v-icon small left>mdi-message-outline</v-icon>
              Kommentar
            </v-btn>
          </v-card>
        </v-slide-item>
      </v-slide-group>
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
            class="rounded-lg ml-5"
            icon>
            <v-icon>mdi-dots-horizontal-circle-outline</v-icon>
          </v-btn>
        </template>
        <v-list color="background lighten-2" class="text-body-2 rounded-lg elevation-0 x-dense" dense nav>
          <v-list-item @click="editor.chain().focus().undo().run()">
            <v-list-item-avatar><v-icon small>mdi-undo</v-icon></v-list-item-avatar>
            <v-list-item-content>Rückgängig </v-list-item-content>
            <v-list-item-action-text class="ml-3">STRG+Z</v-list-item-action-text>
          </v-list-item>
          <v-list-item @click="editor.chain().focus().redo().run()">
            <v-list-item-avatar><v-icon small>mdi-redo</v-icon></v-list-item-avatar>
            <v-list-item-content>Wiederholen</v-list-item-content>
            <v-list-item-action-text class="ml-3">STRG+Y</v-list-item-action-text>
          </v-list-item>
          <v-divider />
          <v-list-item @click="insertImage">
            <v-list-item-avatar><v-icon small>mdi-file-image-outline</v-icon></v-list-item-avatar>
            <v-list-item-content>Bild einfügen…</v-list-item-content>
          </v-list-item>
          <v-list-item @click="insertAudio">
            <v-list-item-avatar><v-icon small>mdi-volume-source</v-icon></v-list-item-avatar>
            <v-list-item-content>Tondatei einfügen…</v-list-item-content>
          </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          @click="store.article.showSidebar = !store.article.showSidebar"
          :color="store.article.showSidebar ? 'primary' : ''"
          tile
          class="rounded-lg"
          icon>
          <v-icon>mdi-information-outline</v-icon>
        </v-btn>
    </v-app-bar>
    <resizable-drawer
      color="background darken-2"
      :card="false"
      :right="true"
      :min-width="300"
      :width="store.settings.drawerRightWidth"
      @update:width="store.settings = { ...store.settings, drawerRightWidth: $event}"
      :value="store.article.showSidebar">
      <v-card
        class="transparent flex-column d-flex fill-height lemma-detail"
        flat>
        <v-card-title class="flex-column pb-2">
          <v-btn-toggle
            class="mx-auto mt-1 mb-0 d-inline-block text-center"
            max
            active-class="white--text primary darken-1"
            mandatory
            v-model="sidebarTab"
            borderless
            dense
            color="primary"
            background-color="transparent">
            <v-btn text class="rounded-lg" small>Info</v-btn>
            <v-btn text class="rounded-lg" small>Annotationen</v-btn>
            <v-btn text class="rounded-lg" small>Kommentare</v-btn>
            <v-btn text class="rounded-lg" small>Versionsgeschichte</v-btn>
            <v-btn text class="rounded-lg" small>Personen-Details</v-btn>
          </v-btn-toggle>
        </v-card-title>
        <v-divider class="mx-5" />
        <v-card-text class="sidebar-content overflow-y-auto flex-grow-1">
          <v-window :value="sidebarTab">
            <v-window-item>
              <issue-lemma-detail v-if="issueLemma !== null" :lemma="issueLemma" />
            </v-window-item>
            <v-window-item>
              <annotation-sidebar :editor="editor" />
            </v-window-item>
            <v-window-item>
              <comments-sidebar
                :show-lines="store.article.showSidebar === true && sidebarTab === 2"
              />
            </v-window-item>
            <v-window-item>
              Versionsgeschichte
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="showSendWindow = true" block elevation="0" color="primary" class="rounded-lg">
            <v-icon left>mdi-share</v-icon>
            Absenden …
          </v-btn>
        </v-card-actions>
      </v-card>
    </resizable-drawer>
    <v-main style="height: calc(100vh - 75px); margin-top: 75px; overflow: auto; padding-top: 0; padding-bottom: 20px">
      <div class="px-5 mt-5 pb-5 mb-5 outer-editor mx-auto">
        <div class="px-5" :style="{ fontSize: (16 * store.settings.articleZoomFactor) + 'px' }">
          <editor-content
            class="tiptap-editor"
            :editor="editor" />
          <v-divider class="mb-5 mx-5 mt-5" />
          <div class="d-flex text-body-1" v-for="(citation, i) in citations" :key="citation.citationId">
            <sup v-text="i + 1" /> <citation-display @click.native="jumpToCitationText" :value="citation" />
          </div>
        </div>
      </div>
    </v-main>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import fileDialog from 'file-dialog'

import { Comment as CommentExtension } from './extensionComment'
import { Citation as CitationExtension} from './extensionCitation'
import { Image as ImageExtension } from './extensionImage'
import { Annotation as AnnotationExtension } from './extensionAnnotation'

import ResizableDrawer from '@/views/lib/ResizableDrawer.vue'
import SelectMenu from '@/views/lib/SelectMenu.vue'
import TextField from '@/views/lib/TextField.vue'
import AnnotationSidebar from './AnnotationSidebar.vue'

import IssueLemmaDetail from '../IssueManager/IssueLemmaDetail.vue'

import CommentsSidebar from './CommentsSidebar.vue'

import CitationDisplay from './CitationDisplay.vue'

import store from '@/store'
import ArticleStore, { Citation } from '@/store/article'
import { IssueLemma } from '@/api'

@Component({
  components: {
    ResizableDrawer,
    SelectMenu,
    CitationDisplay,
    EditorContent,
    IssueLemmaDetail,
    CommentsSidebar,
    AnnotationSidebar,
    TextField
  }
})
export default class Article extends Vue {

  @Prop({ required: true }) issueLemmaId!: number

  issueLemma: IssueLemma|null = null
  editor: Editor|null = null
  showSendWindow = false
  sidebarTab = 0
  store = store
  toolbarPaddingY = 15
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
    },
    {
      name: '150%',
      value: 1.5
    }
  ]

  @Watch('issueLemmaId', { immediate: true })
  onChangeIssueLemmaId() {
    store.article = new ArticleStore(Number(this.issueLemmaId))
  }

  async insertImage() {
    const files = await fileDialog({ multiple: false, accept: 'image/*' })
    if (files.item(0) !== null) {
      const src = URL.createObjectURL(files.item(0))
      if (this.editor !== null) {
        const l = this.editor?.commands.setImage({src})
      }
    }
  }

  async insertAudio() {
    const files = await fileDialog({ multiple: false, accept: 'audio/*' })
    if (files.item(0) !== null) {
      const src = URL.createObjectURL(files.item(0))
      if (this.editor !== null) {
        // const l = this.editor?.commands.setAudio({src})
      }
    }
  }

  onSelectFormatting(v: any) {
    v.onSelect(this.editor)
  }

  get citations() {
    return store.article.citations
  }

  jumpToCitationText(c: Citation) {
    (this.editor?.chain() as any).focus().setTextSelection({from: c.quotedRange, to: c.quotedRange})!.run()
  }

  logHTML() {
    if (this.editor) {
      console.log(this.editor.getHTML())
    }
  }

  async mounted() {
    this.issueLemma = (await this.store.issue.getIssueLemmaById(this.issueLemmaId)) || null
    await store.article.loadArticle(this.issueLemmaId)
    // await store.article.loadComments(this.issueLemmaId)
    const vm = this
    this.editor = new Editor({
      content: store.article.article,
      extensions: [
        CitationExtension,
        CommentExtension,
        ImageExtension,
        AnnotationExtension,
        StarterKit
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

.tb-tooltip
  z-index 9
  opacity 0
  transform translateY(-110%)
  position absolute
  transition opacity .2s

.v-card:hover .tb-tooltip
  z-index 9
  opacity .7

.outer-editor
  --comment-color: #ffe1ab
  --footnote-color: rgba(0,0,20,.07)
  --annotation-color: rgba(0,200,0,.15)
  max-width: 60em
  line-height 1.6
  counter-reset prosemirror-footnote

.editor-toolbar
  position sticky
  z-index 99
  top 0
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
  padding 2px

.tiptap-editor /deep/ footnote
  border-radius 4px
  background var(--footnote-color)
  padding 2px

.tiptap-editor /deep/ footnote:after
  content counter(prosemirror-footnote)
  vertical-align super
  font-size 75%
  counter-increment prosemirror-footnote

.tiptap-editor /deep/ mark
  border-radius 4px
  background var(--annotation-color)
  padding 2px

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
