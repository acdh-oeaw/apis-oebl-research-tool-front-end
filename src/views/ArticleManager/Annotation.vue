<template>
  <div style="width: 320px">
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
        <v-list dense nav color="background" class="pa-0 result-list">
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
      <v-divider />
        <div>
          <v-icon>mdi-chevron-down</v-icon>
          <select style="width: 100%">
            <option>
              Befreundet mit
            </option>
            <option>
              Verheiratet mit
            </option>
            <option>
              Arbeitet bei
            </option>
            <option>
              (andere)
            </option>
          </select>
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

  page = 0
  searchQuery = ''
  loading = false
  showDetailsForGnd: string|null = null
  results: Array<{type: string, name: string, id: string}> = []
  annotation: { entityId: null|string } = {
    entityId: null,
  }

  selectEntity(id: string) {
    this.editor.commands.updateAttributes('annotation', {
      id: this.id,
      entityId: id,
      releationTypId: 'hello!!!'
    })
  }

  @Watch('entityId')
  onChangeEntity(newVal: any, oldVal: any) {
    console.log(newVal, oldVal)
  }

  debouncedSearchEntity = _.debounce(this.searchEntity, 300)

  async searchEntity(v: string|null) {
    if (v !== null && v?.trim() !== '') {
      this.results = await searchAny(v)
    } else {
      this.results = []
    }
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
  max-height 500px
  overflow-y auto
</style>
