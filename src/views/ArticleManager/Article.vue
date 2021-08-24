<template>
  <div class="fill-height">
    <v-dialog
      max-width="800"
      transition="dialog-bottom-transition"
      v-model="showSendWindow">
      <v-card class="rounded-lg soft-shadow">
        <v-card-title>
          <v-btn class="rounded-lg" color="background darken-2" elevation="0" @click="showSendWindow = false">
            Abbrechen
          </v-btn>
          <v-spacer />
          Artikel an ”{{ 'Autor Name' }}” schicken
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
      :style="{transition: 'none', zIndex: 7}"
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
        <div class="caption text-no-wrap muted">
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
              :show-chevron="true"
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
              :show-chevron="true"
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
        <v-list
          v-if="editor !== null"
          color="background lighten-2"
          class="text-body-2 rounded-lg elevation-0 x-dense"
          dense
          nav>
          <v-list-item
            :disabled="!editor.can().undo()"
            @click="editor.chain().focus().undo().run()">
            <v-list-item-avatar><v-icon small>mdi-undo</v-icon></v-list-item-avatar>
            <v-list-item-content>Rückgängig </v-list-item-content>
            <v-list-item-action-text class="ml-3">STRG+Z</v-list-item-action-text>
          </v-list-item>
          <v-list-item
            :disabled="!editor.can().redo()"
            @click="editor.chain().focus().redo().run()">
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
        <!-- SEND BUTTON -->
        <v-btn
          @click="showSendWindow = true"
          tile
          class="rounded-lg"
          icon>
          <v-icon>mdi-share</v-icon>
        </v-btn>
        <!-- SHOW SIDEBAR BUTTON -->
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
        <v-card-title class="flex-column pb-4">
          <v-btn-toggle
            class="mx-auto mt-1 mb-0 d-inline-block text-center"
            max
            active-class="background darken-2 black--text"
            mandatory
            v-model="sidebarTab"
            borderless
            dense
            background-color="transparent">
            <v-btn value="info" text class="rounded-lg" small>Info</v-btn>
            <v-btn value="annotations" text class="rounded-lg" small>Annotationen</v-btn>
            <v-btn value="comments" text class="rounded-lg" small>Kommentare</v-btn>
            <v-btn value="person-details" text class="rounded-lg" small>Personen-Details</v-btn>
          </v-btn-toggle>
        </v-card-title>
        <v-card-text class="sidebar-content overflow-y-auto flex-grow-1">
          <v-window :value="sidebarTab">
            <v-window-item value="info">
              <issue-lemma-detail v-if="issueLemma !== null" :lemma="issueLemma" />
            </v-window-item>
            <v-window-item value="annotations">
              <annotation-sidebar
                :editor="editor"
                :show-lines="store.article.showSidebar === true && sidebarTab === 'annotations'"
              />
            </v-window-item>
            <v-window-item value="comments">
              <comments-sidebar
                :editor="editor"
                :show-lines="store.article.showSidebar === true && sidebarTab === 'comments'"
              />
            </v-window-item>
            <v-window-item value="person-details">
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-btn @click="showSendWindow = true" block elevation="0" color="background darken-3" class="rounded-lg">
            <v-icon left>mdi-share</v-icon>
            Artikel absenden …
          </v-btn>
        </v-card-actions>
      </v-card>
    </resizable-drawer>
    <v-main style="height: calc(100vh - 75px); margin-top: 75px; overflow: auto; padding-top: 0; padding-bottom: 20px">
      <div class="px-5 mt-5 pb-5 mb-5 outer-editor mx-auto">
        <div class="px-5" :style="{ fontSize: (16 * store.settings.articleZoomFactor) + 'px' }">
          <editor-content
            spellcheck="false"
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
import { Audio as AudioExtension } from './extensionAudio'
import { Annotation as AnnotationExtension } from './extensionAnnotation'

import applyDevTools from 'prosemirror-dev-tools'

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
  sidebarTab: 'info'|'annotations'|'comments'|'person-details' = 'info'
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
      value: 0.8
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
      // TODO: perform upload here
      const src = URL.createObjectURL(files.item(0))
      if (this.editor !== null) {
        const l = this.editor.commands.setImage({src})
      }
    }
  }

  async insertAudio() {
    const files = await fileDialog({ multiple: false, accept: 'audio/*' })
    if (files.item(0) !== null) {
      // TODO: perform upload here
      const src = URL.createObjectURL(files.item(0))
      if (this.editor !== null) {
        const l = this.editor.commands.setAudio({src})
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
    if (this.editor) {
      this.editor.commands.focus()
      // this.editor.commands.setTextSelection(c.quotedRange)
      this.editor.commands.scrollIntoView()
    }
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const articleComponent = this
    this.editor = new Editor({
      content: store.article.article,
      extensions: [
        CitationExtension,
        CommentExtension,
        ImageExtension,
        AudioExtension,
        AnnotationExtension,
        StarterKit
      ],
      onTransaction(a) {
        articleComponent.activeFormatting = articleComponent.formattingItems.find(fi => fi.isActive(articleComponent.editor!))
      }
    })
    // applyDevTools(this.editor.view)
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
  --annotation-color: rgba(0,200,0,.2)
  max-width: 60em
  line-height 1.6
  counter-reset prosemirror-footnote

.editor-toolbar
  position sticky
  z-index 99
  top 0
// .tiptap-editor /deep/ *
//   color #333

.tiptap-editor /deep/ .ProseMirror
  z-index 7

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
  padding 2px
  background transparent
  border 3px dashed rgba(0,200,0,.5)
  &[data-is-confirmed="false"]:after
    font-weight: bold;
    content: '?';
    position: absolute;
    margin-left: -8px;
    margin-top: -4px;
    font-size: 11px;
    color: rgba(0,0,0,0.5);
    display: inline-block;
    width: 15px;
    line-height: 17px;
    height: 15px;
    text-align: center;
    border-radius: 100%;
    background: #83eaa1;

.tiptap-editor /deep/ mark[data-entity-id]
  background var(--annotation-color)
  border none

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
