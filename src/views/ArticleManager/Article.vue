<template>
  <div class="fill-height">
    <v-app-bar app flat>
      <div>
        <h1 class="editor-title text-h5">TODO: Title or something</h1>
      </div>
      <v-spacer />
      <v-slide-group class="">
        <v-slide-item>
          <v-card
            color="background darken-2"
            elevation="0"
            class="ml-5 rounded-lg pa-1"
          >
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
              @click="editor.chain().focus().toggleItalic().run()"
            >
              <v-icon small>mdi-format-italic</v-icon>
            </v-btn>
            <v-btn
              class="rounded-lg"
              small
              text
              icon
              @click="editor.chain().focus().toggleBold()"
            >
              <v-icon small>mdi-format-bold</v-icon>
            </v-btn>
          </v-card>
        </v-slide-item>
        <v-slide-item>
          <v-card
            color="background darken-2"
            elevation="0"
            class="rounded-lg pa-1 ml-5 mr-5"
          >
            <div class="tb-tooltip caption muted">Einfügen</div>
            <v-btn
              class="rounded-lg"
              small
              text
              @click="editor.chain().focus().toggleAnnotation().run()"
            >
              <v-icon small left>mdi-earth</v-icon>
              Annotation
            </v-btn>
            <v-btn
              class="rounded-lg"
              small
              text
              @click="editor.chain().focus().toggleComment().run()"
            >
              <v-icon small left>mdi-message-outline</v-icon>
              Kommentar
            </v-btn>
          </v-card>
        </v-slide-item>
      </v-slide-group>
      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" tile class="rounded-lg ml-5" icon>
            <v-icon>mdi-dots-horizontal-circle-outline</v-icon>
          </v-btn>
        </template>
        <v-list
          v-if="editor !== null"
          class="text-body-2 rounded-lg elevation-0 x-dense"
          dense
          nav
        >
          <v-list-item
            :disabled="!editor.can().undo()"
            @click="editor.chain().focus().undo().run()"
          >
            <v-list-item-avatar
              ><v-icon small>mdi-undo</v-icon></v-list-item-avatar
            >
            <v-list-item-content>Rückgängig </v-list-item-content>
            <v-list-item-action-text class="ml-3"
              >STRG+Z</v-list-item-action-text
            >
          </v-list-item>
          <v-list-item
            :disabled="!editor.can().redo()"
            @click="editor.chain().focus().redo().run()"
          >
            <v-list-item-avatar
              ><v-icon small>mdi-redo</v-icon></v-list-item-avatar
            >
            <v-list-item-content>Wiederholen</v-list-item-content>
            <v-list-item-action-text class="ml-3"
              >STRG+Y</v-list-item-action-text
            >
          </v-list-item>
          <v-divider />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <div class="px-5 mt-5 pb-5 mb-5 outer-editor mx-auto">
        <editor-content class="tiptap-editor" :editor="editor" />
      </div>
    </v-main>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Editor, EditorContent } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";

import { Comment as CommentExtension } from "./extensionComment";
import { Annotation as AnnotationExtension } from "./extensionAnnotation";

import SelectMenu from "@/views/lib/SelectMenu.vue";
import TextField from "@/views/lib/TextField.vue";
import AnnotationSidebar from "./AnnotationSidebar.vue";


@Component({
  components: {
    SelectMenu,
    EditorContent,
    AnnotationSidebar,
    TextField,
  },
})
export default class Article extends Vue {
  editor: Editor | null = null;

  formattingItems = [
    {
      name: "Text",
      value: "paragraph",
      isActive: (e: Editor) => e.isActive("paragraph"),
      onSelect: (e: Editor) => e.chain().focus().setParagraph().run(),
    },
    {
      name: "Überschrift 1",
      value: "heading-1",
      isActive: (e: Editor) => e.isActive("heading", { level: 1 }),
      onSelect: (e: Editor) => e.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
      name: "Überschrift 2",
      value: "heading-2",
      isActive: (e: Editor) => e.isActive("heading", { level: 2 }),
      onSelect: (e: Editor) => e.chain().focus().setHeading({ level: 2 }).run(),
    },
  ];

  activeFormatting: any = this.formattingItems[0];

  onSelectFormatting(v: any) {
    v.onSelect(this.editor);
  }

  async mounted() {
    const articleComponent = this;
    this.editor = new Editor({
      content: "This is and was dummy content",
      extensions: [
        CommentExtension,
        AnnotationExtension,
        StarterKit,
      ],
      onTransaction(a) {
        articleComponent.activeFormatting =
          articleComponent.formattingItems.find((fi) =>
            fi.isActive(articleComponent.editor!)
          );
      },
    });
  }

  beforeDestroy() {
    if (this.editor !== null) {
      this.editor.destroy();
    }
  }
}
</script>
