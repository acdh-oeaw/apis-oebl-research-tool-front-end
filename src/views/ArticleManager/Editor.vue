<template>
  <div class="editor-container">
    <div>
      <div>
        <h1 class="editor-title text-h5">Version vom {{ dateToLocale(version.date_created) }}</h1>
      </div>
      <v-spacer />
      <v-slide-group class="">
        <v-slide-item>
          <v-card color="background darken-2" elevation="0" class="ml-5 rounded-lg pa-1">
            <div class="tb-tooltip caption muted">
              <div>Zuletzt gespeichert</div>
              <div>{{ dateToLocale(version.date_modified) }}</div>
            </div>
          </v-card>
        </v-slide-item>
        <v-slide-item>
          <v-card color="background darken-2" elevation="0" class="ml-5 rounded-lg pa-1">
            <div class="tb-tooltip caption muted">Format</div>
            <select-menu :hide-searchbar="true" :show-chevron="true" class="rounded-lg" btn-class="pl-2"
              style="width: 100px" :items="formattingItems" :value="activeFormatting" @input="onSelectFormatting" />
          </v-card>
        </v-slide-item>
        <v-slide-item>
          <v-card color="background darken-2" elevation="0" class="rounded-lg pa-1 ml-5 mr-5">
            <div class="tb-tooltip caption muted">Einfügen</div>
            <v-btn class="rounded-lg" small text @click="insertAnnotation()">
              <v-icon small left>mdi-earth</v-icon>
              Annotation
            </v-btn>
            <v-btn class="rounded-lg" small text @click="insertComment()">
              <v-icon small left>mdi-message-outline</v-icon>
              Kommentar
            </v-btn>
          </v-card>
        </v-slide-item>
        <v-slide-item>
          <v-card color="background darken-2" elevation="0" class="rounded-lg pa-1 ml-5 mr-5">
            <div class="tb-tooltip caption muted transparent--text">Speichern</div>
            <v-btn class="rounded-lg" small text @click="save()">
              <v-icon small left>mdi-content-save</v-icon>
              Speichern
            </v-btn>
          </v-card>
        </v-slide-item>
        <v-slide-item>
          <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" tile class="rounded-lg ml-5" icon>
            <v-icon>mdi-dots-horizontal-circle-outline</v-icon>
          </v-btn>
        </template>
        <v-list class="text-body-2 rounded-lg elevation-0 x-dense" dense nav>
          <v-list-item :disabled="!undoPossible" @click="undo()">
            <v-list-item-avatar><v-icon small>mdi-undo</v-icon></v-list-item-avatar>
            <v-list-item-content>Rückgängig </v-list-item-content>
            <v-list-item-action-text class="ml-3">STRG+Z</v-list-item-action-text>
          </v-list-item>
          <v-list-item :disabled="!redoPossible" @click="redo()">
            <v-list-item-avatar><v-icon small>mdi-redo</v-icon></v-list-item-avatar>
            <v-list-item-content>Wiederholen</v-list-item-content>
            <v-list-item-action-text class="ml-3">STRG+Y</v-list-item-action-text>
          </v-list-item>
          <v-divider />
        </v-list>
      </v-menu>
        </v-slide-item>
      </v-slide-group>
    </div>
    <v-main class=" px-0">
      <div class="px-5 mt-5 pb-5 mb-5 outer-editor mx-auto">
        <tip-tap-editor-content class="tiptap-editor" :editor="tipTapEditor" />
      </div>
    </v-main>
  </div>
</template>

<script lang='ts'>

import { Component, Prop, Vue } from "vue-property-decorator";

import { Editor as TipTapEditor, EditorContent as TipTapEditorContent } from "@tiptap/vue-2";


import SelectMenu from "@/views/lib/SelectMenu.vue";

import { ArticleStore,  Markup } from "@/store/article";
import { LemmaArticleVersion } from "@/api";

/**
 * Edits a single version of an article.
 */
@Component({
  components: {
    SelectMenu,
    TipTapEditorContent,
  },
})
export default class Editor extends Vue {

  @Prop({ required: true }) articleStore!: ArticleStore;
  @Prop({ required: true }) version!: LemmaArticleVersion;
  @Prop({ required: true }) tipTapEditor!: TipTapEditor;

  @Prop({ required: true }) userCanAnnotate!: boolean;
  @Prop({ required: true }) userCanComment!: boolean;

  dateToLocale(isoDate?: string): string {
    return isoDate === undefined ? '(Das Datum konnte nicht ermittelt werden)' : (new Date(isoDate)).toLocaleString('de');
  }


  formattingItems = [
    {
      name: "Text",
      value: "paragraph",
      isActive: (e: TipTapEditor) => e.isActive("paragraph"),
      onSelect: (e: TipTapEditor) => e.chain().focus().setParagraph().run(),
    },
    {
      name: "Überschrift 1",
      value: "heading-1",
      isActive: (e: TipTapEditor) => e.isActive("heading", { level: 1 }),
      onSelect: (e: TipTapEditor) => e.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
      name: "Überschrift 2",
      value: "heading-2",
      isActive: (e: TipTapEditor) => e.isActive("heading", { level: 2 }),
      onSelect: (e: TipTapEditor) => e.chain().focus().setHeading({ level: 2 }).run(),
    },
  ];

  activeFormatting: any = this.formattingItems[0];

  async save(): Promise<void> {
    const markup = this.tipTapEditor.getJSON();
    if (markup === null) {
      return;
    }
    await this.articleStore.updateMarkup(markup as Markup);
  }

  onSelectFormatting(v: any) {
    v.onSelect(this.tipTapEditor);
  }

  insertAnnotation(): void {
    this.tipTapEditor.chain().focus().toggleAnnotation().run();
  }

  insertComment(): void {
    this.tipTapEditor.chain().focus().toggleComment().run();
  }

  get undoPossible(): boolean {
    return this.tipTapEditor.can().undo();
  }

  undo(): void {
    this.tipTapEditor.chain().focus().undo().run();
  }

  redoPossible(): boolean {
    return this.tipTapEditor.can().redo();
  }

  redo(): void {
    this.tipTapEditor.chain().focus().redo().run();
  }

  beforeDestroy() {
    this.tipTapEditor.destroy();
  }

}
</script>