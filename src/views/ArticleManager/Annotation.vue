<template>
  <div class="pb-1" style="width: 320px; min-height: 250px;">
    <v-overlay opacity=".9" style="border-radius: 11px" color="background darken-1" v-if="showOverlay">
      <v-btn @click="removeAnnotation" elevation="0" class="mb-1 rounded-lg" block color="red">Annotation
        entfernen</v-btn>
      <v-btn block @click="showOverlay = false" outlined class="rounded-lg" color="grey">Abbrechen</v-btn>
    </v-overlay>
    <v-window reverse v-model="page">
      <v-window-item>
        <div class="d-flex flex-row align-self-stretch">
          <v-btn icon tile class="rounded-lg" small>
          </v-btn>
          <div class="text-center muted caption mb-1 flex-grow-1 align-self-end">
            Annotation
          </div>
          <v-btn @click="showOverlay = true" icon tile class="rounded-lg" small>
            <v-icon>mdi-dots-horizontal</v-icon>
          </v-btn>
        </div>
        <div v-if="entityTypes" class="d-flex flex-row rounded-lg background darken-2 px-2 mt-1 mb-1">

          <v-select class="pt-0 custom-v-select" hide-details :items="entityTypes" attach placeholder="Entität"
            v-model="entityType"></v-select>
        </div>
        <div v-if="entityTypes" class="d-flex flex-row rounded-lg background darken-2 px-2 mt-1 mb-1">
          <v-select class="pt-0 custom-v-select" hide-details :items="availableRelations" attach placeholder="Relation"
            item-value="id" v-model="selectedRelationType"></v-select>
        </div>
        {{ searchTerm }}
        <text-field ref="searchTerm" @input="debouncedSearchEntity" v-model="searchTerm" class="flex-grow-1" :clearable="true"
          placeholder="Enität suchen …">
          <template v-slot:prepend>
            <div v-if="loading === true" class="mt-1 ml-2">
              <loading-spinner :size="25" />
            </div>
            <v-icon size="16" class="ml-3" v-else>
              mdi-magnify
            </v-icon>
          </template>
        </text-field>
        <v-list v-if="results.length > 0" dense nav color="transparent" class="pa-0 result-list">
          <v-list-item v-for="result in results" :key="result.id">
            <v-list-item-avatar class="pr-0 mr-2" min-width="30" max-width="30" width="30">
              <template>
                <v-btn @click.stop.prevent.capture="selectEntity(result.id)" tile icon class="rounded-lg" elevation="0">
                  <v-icon v-if="result.id === entityId" color="primary">mdi-check-circle</v-icon>
                  <v-icon v-else>mdi-circle-outline</v-icon>
                </v-btn>
              </template>
            </v-list-item-avatar>
            <v-list-item-content class="cursor-pointer ac-result" v-html="result.name">
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <div class="pa-5 my-5 text-center caption muted"
          v-else-if="results.length === 0 && searchTerm.trim() !== '' && loading === true">
          Suche …
        </div>
        <div class="pa-5 my-5 text-center caption muted" v-else-if="results.length === 0 && searchTerm.trim() === ''">
          Suchen Sie nach einer Entität
        </div>
        <div class="pa-5 my-5 text-center caption muted" v-else-if="results.length === 0 && searchTerm.trim() !== ''">
          Nichts gefunden.
        </div>
      </v-window-item>
      <v-window-item>
        <div>
          <v-btn elevation="0" color="primary" text @click="page = 0" class="rounded-lg mb-2" small>
            <v-icon left>mdi-chevron-left</v-icon>Zurück
          </v-btn>
        </div>
        <lobid-preview-card class="mb-3" :gnd="[showDetailsForGnd]" />
      </v-window-item>
    </v-window>
    <div class="d-flex flex-row mt-1">
      <text-field placeholder="YYYY" v-model="relationStartTime" class="mr-1" style="width: 49.5%" label="von" @input="updateProps({ relationStartTime:  $event})" />
      <text-field placeholder="YYYY" v-model="relationEndTime" label="bis" style="width: 49.5%"  @input="updateProps({ relationEndTime:  $event})" />
    </div>
    <div v-if="isConfirmedAnnotation === false">
      <v-divider class="mb-2 mt-1" />
      <v-btn elevation="0" block class="rounded-lg white--text" @click="updateProps({ isConfirmed: 'true' })"
        color="green lighten-1">
        Vorschlag annehmen
      </v-btn>
      <v-btn v-if="isConfirmedAnnotation === false" elevation="0" block class="rounded-lg mt-1"
        @click="removeAnnotation" color="background darken-2">
        Vorschlag ablehen
      </v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import TextField from '../lib/TextField.vue'
import LoadingSpinner from '../lib/LoadingSpinner.vue'
import _, { update } from 'lodash'
import * as lobid from '../../service/lobid'
import * as apis_autocomplete from '../../service/apis_autocomplete'
import { EntityTranslations } from '@/util/labels'
import LobidPreviewCard from '../LemmaManager/LobidPreviewCard.vue'
import { Editor } from '@tiptap/vue-2'
import { AnnotationAttributes } from './extensionAnnotation'

@Component({
  components: {
    TextField,
    LoadingSpinner,
    LobidPreviewCard
  }
})
export default class Annotation extends Vue {

  @Prop({ default: null }) id!: string | null
  @Prop({ default: null }) entityId!: string | null
  @Prop({ default: null }) entityType!: string | null
  @Prop({ default: null }) relationTypeId!: string | null
  @Prop({ default: null }) relationEndTime!: string | null
  @Prop({ default: null }) relationStartTime!: string | null
  @Prop({ default: false }) isConfirmed!: string

  @Prop({ required: true }) editor!: Editor
  @Prop({ default: null }) cachedEntity!: { type: string, name: string, id: string } | null

  showOverlay = false
  page = 0
  searchQueries: { [annotationId: string]: string } = {}
  loading = false
  showDetailsForGnd: string | null = null
  results: Array<{ type: string, name: string, id: string }> = []
  availableRelations: Array<{ id: string, text: string }> = []
  annotation: { entityId: null | string } = {
    entityId: null,
  }
  entityTypes = [
    { value: "person", text: EntityTranslations.person.de },
    { value: "place", text: EntityTranslations.place.de },
    { value: "institution", text: EntityTranslations.institution.de },
    { value: "work", text: EntityTranslations.work.de },
    { value: "event", text: EntityTranslations.event.de }
  ]

  //selectedEntityType: any = null;

  selectedRelationType: string | null = null;


  get isConfirmedAnnotation() {
    return this.isConfirmed === 'true'
  }

  get searchTerm(): string {
    // if possible, use the cached search term
    if (
      this.id !== null &&
      this.searchQueries[this.id] !== undefined
    ) {
      return this.searchQueries[this.id]
      // otherwise it’s empty
    } else {
      return ''
    }
  }

  set searchTerm(t: string) {
    // cache it
    this.searchQueries[this.id!] = t
  }

  updateProps(p: Partial<AnnotationAttributes>) {
    console.log(p)
    const res = this.editor.commands.updateAttributes('annotation', {
      entityId: this.entityId,
      entityType: this.entityType,
      id: this.id,
      relationTypeId: this.relationTypeId,
      relationStartTime: this.relationStartTime,
      relationEndTime: this.relationEndTime,
      isConfirmed: this.isConfirmed,
      ...p
    } as AnnotationAttributes)
  }

  selectEntity(id: string) {
    if (this.entityId !== id) {
      this.updateProps({ entityId: id })
    } else {
      this.updateProps({ entityId: null })
    }
  }

  removeAnnotation() {
    this.editor.commands.unsetMark('annotation')
    this.editor.commands.focus()
  }

  @Watch('id', { immediate: true })
  async onChangeId() {
    this.results = []
    this.selectedRelationType = null;
    // update search to the selected text
    if (this.entityId === null && this.relationTypeId === null) {
      const selectedText = this.editor.state.doc.textBetween(this.editor.state.selection.from, this.editor.state.selection.to)
      this.searchTerm = selectedText
    }
    if (this.entityId !== null && this.entityType !== null) {
      //this.results = [await lobid.get(this.entityId)]
      this.results = await apis_autocomplete.searchEntity(this.entityType, this.entityId)
    }
    // reset overlay
    this.showOverlay = false
  }

  @Watch('entityId')
  onChangeEntity(newVal: any, oldVal: any) {
    console.log(newVal, oldVal)
  }

  debouncedSearchEntity = _.debounce(this.searchEntity, 300)

  async searchEntity(v: string | null) {
    if (this.entityType !== null) {
      this.loading = true
      if (v !== null && v?.trim() !== '') {
        this.results = await apis_autocomplete.searchEntity(this.entityType, v)
      } else {
        this.searchTerm = ''
        this.results = []
      }
      this.loading = false
    }
  }

  async getAvailableRelations(relation: string) {
    this.availableRelations = await apis_autocomplete.getAvailableRelationTypes(relation)
  }

  @Watch('results')
  onChangeResults(oldV: Array<any>, newV: Array<any>) {
    if (oldV.length !== newV.length) {
      window.dispatchEvent(new Event('resize'))
    }
  }

  @Watch('entityType', { immediate: true })
  async onChangeselectedEntityType() {
    this.updateProps({entityType: this.entityType})
    const relation = `person${this.entityType}relation`
    if (this.entityType !== null) {
      await this.getAvailableRelations(relation)
      if (this.relationTypeId !== null) {
        this.selectedRelationType = this.availableRelations.find((rel ) => {return rel.id = String(this.relationTypeId)})?.id || null}
    }
  }

  @Watch('selectedRelationType', { immediate: true })
  async onChangeselectedRelationType() {
    if (this.selectedRelationType !== null) {
      this.updateProps({ relationTypeId: this.selectedRelationType });
      const SearchTextField = (this.$refs.searchTerm as TextField)
      if (SearchTextField.value != '') {
        SearchTextField.$emit("input",SearchTextField.localValue)
      }
    }
  }

}
</script>
<style lang="stylus" scoped>
.result-list
  height 300px
  overflow-y auto

.custom-v-select >>> .v-input__slot:after 
  border-style none  

.custom-v-select >>> .v-input__slot
  font-size 0.8rem

.ac-result  >>> *
  display flex
  flex-direction: column

.ac-result > span small:first-child
  order 2
.ac-result > span b
  order 1
</style>
