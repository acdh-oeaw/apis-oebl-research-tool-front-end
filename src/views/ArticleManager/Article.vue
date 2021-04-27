@@ -0,0 +1,89 @@
<template>
  <div>
    <v-app-bar
      app
      :style="{transition: 'none', padding: `${toolbarPaddingY}px 0`}"
      height="50"
      color="background"
      flat>
      <v-btn v-if="!store.settings.showNavDrawer" @click="toggleDrawer" tile class="rounded-lg" icon>
        <v-icon>mdi-dock-left</v-icon>
      </v-btn>
      <v-spacer />
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
        @click="editor.chain().focus().toggleHighlight().run()">
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
    </v-app-bar>
    <resizable-drawer
      color="background"
      :card="true"
      :right="true"
      :min-width="300"
      :width="store.settings.drawerRightWidth"
      @update:width="store.settings = { ...store.settings, drawerRightWidth: $event}"
      :value="store.lemma.showSideBar">
    </resizable-drawer>
    <v-main>
      <div class="pa-5 outer-editor mx-auto" v-if="issueLemma !== null">
        <div :style="{ zoom: this.selectedZoomLevel.value }">
          <h1>{{ issueLemma.lemma.firstName }} {{ issueLemma.lemma.lastName }}</h1>
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
import Highlight from '@tiptap/extension-highlight'

import store from '@/store'
import { IssueLemma } from '@/api'

@Component({
  components: {
    ResizableDrawer,
    SelectMenu,
    EditorContent
  }
})
export default class Article extends Vue {

  @Prop({ required: true }) issueLemmaId!: number
  issueLemma: IssueLemma|null = null

  editor = new Editor({
    content: `
      <p>Non labore occaecat deserunt dolor aliquip consectetur fugiat laboris velit adipisicing
      laboris aliqua est aliqua. Culpa cupidatat anim qui adipisicing ea consectetur qui Lorem
      culpa excepteur deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.</p>
      
      <p>Non labore occaecat deserunt dolor aliquip consectetur fugiat laboris velit adipisicing
      laboris aliqua est aliqua. Culpa cupidatat anim qui<sup>1</sup> adipisicing ea consectetur qui Lorem
      culpa excepteur deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.</p>`,
    extensions: [
      Highlight,
      Comment,
      ...defaultExtensions()
    ],
  })

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

  async mounted() {
    this.issueLemma = (await this.store.issue.getIssueLemmaById(this.issueLemmaId)) || null
    // this.editor =
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
  border-radius 3px
  background #ffc864
  padding 4px
</style>
