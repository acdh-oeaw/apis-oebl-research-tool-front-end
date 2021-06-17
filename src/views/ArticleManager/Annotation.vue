<template>
  <div style="width: 320px; min-height: 250px">
    <v-window reverse v-model="page">
      <v-window-item>
        <div
          class="d-flex flex-row align-self-stretch">
          <v-btn icon tile class="rounded-lg" small>
        </v-btn>
          <div class="text-center muted caption mb-1 flex-grow-1 align-self-end">
            Annotation
          </div>
          <v-btn icon tile class="rounded-lg" small>
            <v-icon>mdi-dots-horizontal</v-icon>
          </v-btn>
        </div>
        <text-field
          @input="debouncedSearchEntity"
          v-model="searchQuery"
          class="flex-grow-1"
          :clearable="true"
          placeholder="Enität suchen …">
          <template v-slot:prepend>
            <div
              v-if="loading === true"
              class="mt-1 ml-2">
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
                <v-btn
                  @click.stop.prevent.capture="selectEntity(result.id)"
                  tile
                  icon
                  class="rounded-lg"
                  elevation="0">
                  <v-icon v-if="result.id === entityId" color="primary">mdi-check-circle</v-icon>
                  <v-icon v-else>mdi-circle-outline</v-icon>
                </v-btn>
              </template>
            </v-list-item-avatar>
            <v-list-item-content class="cursor-pointer" @click="showDetailsForGnd = result.id; page = 1">
              <v-list-item-title>
                {{ result.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ result.type }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                icon
                class="rounded-lg"
                elevation="0"
                @click.stop.prevent.capture="showDetailsForGnd = result.id; page = 1"
                tile>
                <v-icon color="primary">
                  mdi-chevron-right
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <div class="pa-5 my-5 text-center caption muted" v-else-if="results.length === 0 && searchQuery.trim() !== '' && loading === true">
          Suche …
        </div>
        <div class="pa-5 my-5 text-center caption muted" v-else-if="results.length === 0 && searchQuery.trim() === ''">
          Suchen Sie nach einer Entität
        </div>
        <div class="pa-5 my-5 text-center caption muted" v-else-if="results.length === 0 && searchQuery.trim() !== ''">
          Nichts gefunden.
        </div>
      </v-window-item>
      <v-window-item>
        <div>
          <v-btn
            elevation="0"
            color="primary"
            text
            @click="page = 0"
            class="rounded-lg mb-2"
            small>
            <v-icon left>mdi-chevron-left</v-icon>Zurück
          </v-btn>
        </div>
        <lobid-preview-card class="mb-3" :gnd="[ showDetailsForGnd ]" />
      </v-window-item>
      <div class="d-flex flex-row rounded-lg background darken-2 pa-2 mt-1">
        <v-icon small>mdi-chevron-down</v-icon>
        <select
          :value="relationTypeId"
          @input="updateProps({ relationTypeId: $event.target.value })"
          class="flex-grow-1 text-center">
          <option value="null">
            (Beziehung Wählen)
          </option>
          <option value="1">
            wohnte in
          </option>
          <option value="2">
            Befreundet mit
          </option>
          <option value="3">
            Verheiratet mit
          </option>
          <option value="4">
            Arbeitet bei
          </option>
          <option value="5">
            (andere)
          </option>
        </select>
      </div>
      <div class="d-flex flex-row mt-1">
        <text-field
          placeholder="YYYY"
          class="mr-1"
          style="width: 49.5%"
          label="von"
        />
        <text-field
          placeholder="YYYY"
          label="bis"
          style="width: 49.5%"
        />
      </div>
    </v-window>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import TextField from '../lib/TextField.vue'
import LoadingSpinner from '../lib/LoadingSpinner.vue'
import _ from 'lodash'
import { searchAny } from '../../service/lobid'
import LobidPreviewCard from '../LemmaManager/LobidPreviewCard.vue'
import { Editor } from '@tiptap/vue-2'
import { AnnotationAttributes } from './extensionAnnotation'
import store from '@/store'

@Component({
  components: {
    TextField,
    LoadingSpinner,
    LobidPreviewCard
  }
})
export default class Entity extends Vue {

  @Prop({ default: null }) id!: string|null
  @Prop({ default: null }) entityId!: string|null
  @Prop({ default: null }) relationTypeId!: string|null
  @Prop({ required: true }) editor!: Editor
  @Prop({ default: null }) cachedEntity!: {type: string, name: string, id: string}|null

  page = 0
  searchQuery = ''
  loading = false
  showDetailsForGnd: string|null = null
  results: Array<{type: string, name: string, id: string}> = []
  annotation: { entityId: null|string } = {
    entityId: null,
  }

  updateProps(p: Partial<AnnotationAttributes>) {
    this.editor.commands.updateAttributes('annotation', {
      entityId: this.entityId,
      id: this.id,
      relationTypeId: this.relationTypeId,
      ...p
    })
    if (this.id !== null) {
      store.article.updateAnnotation(this.id, p)
    }
  }

  selectEntity(id: string) {
    this.updateProps({ entityId: id })
  }

  @Watch('id', { immediate: true })
  onChangeId() {
    console.log('onChangeId', this.entityId, this.relationTypeId)
    if (this.entityId === null && this.relationTypeId === null) {
      const selectedText = this.editor.state.doc.textBetween(this.editor.state.selection.from, this.editor.state.selection.to)
      this.searchQuery = selectedText
      this.searchEntity(selectedText)
    }
  }

  @Watch('entityId')
  onChangeEntity(newVal: any, oldVal: any) {
    console.log(newVal, oldVal)
  }

  debouncedSearchEntity = _.debounce(this.searchEntity, 300)

  async searchEntity(v: string|null) {
    this.loading = true
    if (v !== null && v?.trim() !== '') {
      this.results = await searchAny(v)
    } else {
      this.results = []
    }
    this.loading = false
  }

  mounted() {
    console.log(this.$props, this.$attrs)
  }

  @Watch('results')
  onChangeResults(oldV: Array<any>, newV: Array<any>) {
    if (oldV.length !== newV.length) {
      window.dispatchEvent(new Event('resize'))
    }
  }

}
</script>
<style lang="stylus" scoped>
.result-list
  height 300px
  overflow-y auto
select
  outline 0
</style>
