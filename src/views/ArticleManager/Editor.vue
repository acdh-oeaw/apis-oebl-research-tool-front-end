<template>
  <div class="editor-container">
    <v-app-bar app flat>
      <div>
        <h1 class="editor-title text-h5">Version vom {{dateToLocale(dateCreated)}}</h1>
      </div>
      <v-spacer />
      <v-slide-group class="">
        <v-slide-item>
          <v-card
            color="background darken-2"
            elevation="0"
            class="ml-5 rounded-lg pa-1"
          >
            <div class="tb-tooltip caption muted">
              <div>Zuletzt gespeichert</div><div>{{dateToLocale(dateModified)}}</div>
            </div>
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
              @click="insertAnnotation()"
            >
              <v-icon small left>mdi-earth</v-icon>
              Annotation
            </v-btn>
            <v-btn
              class="rounded-lg"
              small
              text
              @click="insertComment()"
            >
              <v-icon small left>mdi-message-outline</v-icon>
              Kommentar
            </v-btn>
          </v-card>
        </v-slide-item>
        <v-slide-item>
          <v-card
            color="background darken-2"
            elevation="0"
            class="rounded-lg pa-1 ml-5 mr-5"
          >
            <v-btn class="rounded-lg" small text @click="save()">
              <v-icon small left>mdi-content-save</v-icon>
              Speichern
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
          class="text-body-2 rounded-lg elevation-0 x-dense"
          dense
          nav
        >
          <v-list-item
            :disabled="!undoPossible"
            @click="undo()"
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
            :disabled="!redoPossible"
            @click="redo()"
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
        <full-text 
          :canEdit="userCanWrite" 
          :documentTextStore="documentContainer.textStore"
          @[annotatedTextSequenceSelectEventType]="reactToTextSelect($event);"
          >
        </full-text>
      </div>
    </v-main>
  </div>
</template>

<script lang='ts'>

import { Component, Prop, Vue } from "vue-property-decorator";


import SelectMenu from "@/views/lib/SelectMenu.vue";

import { ArticleStoreInterface, } from "@/store/article";
import { AnnotatedTextSequenceSelectEventType, DocumentTextStore } from '@/store/textEditor/texts';
import  {DocumentContainer, createDocumentContainerFromBackendMarkup } from '@/store/textEditor/documents';
import { LemmaArticleVersion } from "@/api";
import FullText from "./FullText.vue";

/**
 * Edits a single version of an article.
 */
@Component({
  components: {
    SelectMenu,
    FullText,
  },
})
export default class Editor extends Vue {

  @Prop({required: true}) articleStore!:  ArticleStoreInterface;
  @Prop({required: true}) version!:  LemmaArticleVersion;

  @Prop({required: true}) userCanAnnotate!: boolean;
  @Prop({required: true}) userCanComment!: boolean;
  @Prop({required: true}) userCanWrite!: boolean;

  documentContainer: DocumentContainer = createDocumentContainerFromBackendMarkup(this.version.markup);
  annotatedTextSequenceSelectEventType = AnnotatedTextSequenceSelectEventType;
  dateCreated?: string = this.version.date_created;
  dateModified?: string = this.version.date_modified;


  dateToLocale(isoDate?: string): string {
      return isoDate === undefined ? '(Das Datum konnte nicht ermittelt werden)' : (new Date(isoDate)).toLocaleString('de');
  }

  reactToTextSelect(event: any): void {
    console.warn('TODO: Not implemented');
  }

  async save(): Promise<void> {
    await this.articleStore.updateMarkup(this.documentContainer);
    this.dateModified = this.articleStore.newestVersion?.date_modified;
    return;
  }

  insertAnnotation(): void {
    console.error('NOT IMPLEMENTED!');
  }

  insertComment(): void {
    console.error('NOT IMPLEMENTED!');
  }

  get undoPossible(): boolean {
    console.warn('NOT IMPLEMENTED!');
    return false;
  }

  undo(): void {
    console.error('NOT IMPLEMENTED!');
  }

  redoPossible(): boolean {
    console.warn('NOT IMPLEMENTED!');
    return false;
  }

  redo(): void {
    console.error('NOT IMPLEMENTED!');
  }

}
</script>