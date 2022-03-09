<template>
  <v-card
    class="transparent flex-column d-flex fill-height lemma-detail"
    elevation="0"
    @dragover.prevent=""
    @dragenter.prevent.capture.stop="onDragEnter"
    @dragleave.prevent.capture.stop="onDragLeave"
    @drop.prevent.capture.stop="onDrop"
    v-if="value !== undefined && value !== null">
    <v-card-title class="flex-column pb-2">
      <div class="d-flex flex-row align-self-stretch" v-if="showHeader">
        <v-btn
          style="margin-top: -8px; margin-left: -10px; "
          width="48"
          height="48"
          tile
          @click="$emit('update', { selected: !value.selected })"
          class="rounded-lg"
          icon>
          <span style="color: var(--v-primary-base)" v-if="value.selected">★</span>
          <span style="opacity: .5" v-else>☆</span>
        </v-btn>
        <div :key="value.id" class="text-center flex-grow-1" >
          {{ value.lastName }}, {{ value.firstName }}
        </div>
        <v-btn
          style="margin-top: -8px; margin-right: -10px;"
          width="48"
          height="48"
          tile
          class="rounded-lg"
          icon
          @click="store.lemma.showSideBar = false">
          <v-icon>mdi-dock-right</v-icon>
        </v-btn>
      </div>
      <div style="margin-top: -5px" class="text-caption text-center" v-if="showHeader">
        {{ value.birthYear || '?' }} - {{ value.deathYear || '?' }}
      </div>
      <v-btn-toggle
        max
        class="transparent mx-auto mt-1 mb-0"
        active-class="background darken-3"
        v-model="detailPage"
        mandatory
        borderless>
        <v-btn text class="rounded-lg mx-1" small>
          Details
        </v-btn>
        <v-btn text class="rounded-lg mx-1" small>Dateien {{ files.length > 0 ? `(${files.length})` : '' }}</v-btn>
        <v-btn text class="rounded-lg mx-1" small>Literatur</v-btn>
        <v-btn text class="rounded-lg mx-1" small>
          Externe Ressourcen <template v-if="countScrapedResources(value.columns_scrape) > 0">({{ countScrapedResources(value.columns_scrape) }})</template>
        </v-btn>
      </v-btn-toggle>
    </v-card-title>
    <v-divider />
    <div class="overflow-y-auto flex-grow-1">
      <v-window :value="detailPage">
        <v-window-item>
          <h4
            class="py-2 px-5 background darken-1 d-flex"
            :style="{
              zIndex: 1,
              position: 'sticky',
              top: 0,
              background: ''
            }">
            Basisdaten
            <v-spacer />
            <select-menu
              btn-class="px-2 background darken-2"
              prepend-icon="mdi-format-list-bulleted"
              search-placeholder="Liste suchen …"
              no-selection-text="keine Liste"
              :show-chevron="true"
              :value="value.list || null"
              :items="store.lemma.lemmaLists"
              @input="updateList"
              key-name="title"
              key-description="editor.name"
              key-value="id"
            />
          </h4>
          <v-card-text>
            <text-field
              :required="true"
              label="Vorname"
              :value="value.firstName"
              @input="debouncedUpdateData({ firstName: $event })"
            ></text-field>
            <text-field
              :required="true"
              label="Nachname"
              :value="value.lastName"
              @input="debouncedUpdateData({ lastName: $event })"
            ></text-field>
            <full-name-array-field
              :fullNames="value.alternativeNames"
              :value="value.alternativeNames"
              @input="updateUserColumns('alternativeNames', $event);"
              :key="value.id"
            ></full-name-array-field>

            <text-field label="Geschlecht" 
            >
              <template v-slot:input>
                <v-btn-toggle
                  class="transparent mt-1 ml-1"
                  active-class="background darken-3"
                  :value="value.gender"
                  @change="debouncedUpdateData({ gender: $event })"
                  borderless
                  max="1"
                  >

                  <div
                    v-for="genderOption in genderOptions"
                    :key="genderOption"
                  >
                    <v-btn
                      :value="genderOption"
                      text
                      class="rounded-lg"
                      small
                      >{{ genderOption }}</v-btn>
                  </div>
                  
                  <v-btn :value="null" text class="rounded-lg" small>unbekannt</v-btn>
                </v-btn-toggle>
              </template>
            </text-field>
            <text-field
              tabindex="-1"
              label="Adelsprädikat"
              placeholder="(kein)"
              @input="updateUserColumns('nobleTitle', $event)"
              :value="value.columns_user.nobleTitle"
            >
              <v-btn
                @click="updateUserColumns('alternativeNobleTitle', [''].concat(value.columns_user.alternativeNobleTitle || []))"
                tile
                tabindex="-1"
                class="rounded-lg mt-1 mr-1"
                icon
                small><v-icon>mdi-plus-circle-outline</v-icon>
              </v-btn>
            </text-field>
            <text-field-alternatives
              label="Adelsprädikat"
              :value="value.columns_user.alternativeNobleTitle"
              @input="updateUserColumns('alternativeNobleTitle', $event)"
            />
            <v-spacer class="my-5" />
            <date-field
              label="Geburtsdatum"
              :value="value.birthYear"
              @input="debouncedUpdateData({ birthYear: $event })"
            >
              <v-btn
                @click="log"
                tile
                tabindex="-1"
                class="rounded-lg mt-1 mr-1"
                icon
                small><v-icon>mdi-plus-circle-outline</v-icon>
              </v-btn>
            </date-field>
            <date-field
              label="Sterbedatum"
              :value="value.deathYear"
              @input="debouncedUpdateData({ deathYear: $event })"
            >
              <v-btn
                @click="log"
                tile
                tabindex="-1"
                class="rounded-lg mt-1 mr-1"
                icon
                small><v-icon>mdi-plus-circle-outline</v-icon>
              </v-btn>
            </date-field>
            <v-spacer class="my-5" />
            <text-field
              style="min-height: 60px"
              label="Verwandtschaft"
              :allow-new-line="true"
            />
            <text-field
              style="min-height: 60px"
              label="Lebenslauf"
              :allow-new-line="true"
            />
          </v-card-text>
          <h4
            class="py-2 px-5 background"
            :style="{
              zIndex: 1,
              position: 'sticky',
              top: 0,
              background: ''
            }">
            Erweiterte Daten
          </h4>
          <v-card-text class="pt-0">
            <text-field
              v-for="(userValue, userKey) in value.columns_user"
              :key="userKey"
              :value="userValue"
              @input="debouncedUpdateUserColumns(userKey, $event)"
              :label="userKey"
            />
          </v-card-text>
        </v-window-item>
        <v-window-item>
          <h4 class="py-2 px-5 background d-flex">
            Dateien
            <v-spacer />
            <v-btn
              @click.capture.prevent.stop="pickFile"
              class="droppable rounded-lg mr-2"
              elevation="0"
              text
              small

              color="primary darken-1">
              Datei hinzufügen
              <v-icon class="ml-2" small>mdi-plus-circle-outline</v-icon>
            </v-btn>
          </h4>
          <v-card-text class="flex-grow-1">
            <vue-file-list :value="files" @input="files = $event" />
          </v-card-text>
        </v-window-item>
        <v-window-item>
          <v-expansion-panels accordion flat>
            <zotero-manager
              v-for="(zoteroSection, key) in zoteroSections"
              :key="`${value.id}_${key}`"
              :lemmaName="zoteroSection.lemmaName"
              :listName="zoteroSection.listName"
              :zoteroKeysFromServer="zoteroSection.zoteroKeys"
              @submit="debouncedUpdateData({[zoteroSection.column]: $event})"
              ></zotero-manager>
          </v-expansion-panels>
          <v-card flat class="rounded-lg" color="transparent" >
            <v-card-title class="pt-0 background">
            Legacy (Gideon)
            </v-card-title>
            <v-card-text class="pt-0 background">
              <div v-if="value.legacyGideonCitations" class="gideon-legacy-result">
                <v-list  dense class="gideon-legacy-literature pt-0">
                  <v-list-item
                    v-for="(legacyCitation, index) in value.legacyGideonCitations"
                    :key="index"
                    >{{ legacyCitation.value }}
                  </v-list-item>
                </v-list>
              </div>
              <div v-else>Keine Gideon-Literatur gefunden</div>
            </v-card-text>
          </v-card>
        </v-window-item>
        <v-window-item>
          <h4 class="py-2 px-5 background d-flex">
            GND: {{ value.gnd[0] }}
            <v-spacer />
            <v-badge color="primary" v-if="value.gnd.length > 1" :content="value.gnd.length.toString()" inline />
          </h4>
          <v-card-text class="pt-1">
            <v-window reverse style="overflow: visible !important" :value="showGndSearch ? 1 : 0">
              <v-window-item>
                <lobid-preview-card
                  class="mb-2"
                  v-if="value.gnd.length > 0"
                  @update="log"
                  :limit="1"
                  :gnd="value.gnd" />
                <v-btn
                  @click="showGndSearch = true"
                  small
                  color="background darken-3"
                  class="rounded-lg"
                  block
                  v-if="value.gnd.length === 0"
                  elevation="0">GND hinzufügen…</v-btn>
                <v-btn
                  v-if="value.gnd.length > 0"
                  @click="showGndSearch = true"
                  small
                  class="rounded-lg"
                  color="background darken-3"
                  block
                  elevation="0">GND ändern…</v-btn>
              </v-window-item>
              <v-window-item>
                <lobid-gnd-search
                  :value="value.gnd.length === 1 ? value.gnd[0] : null"
                  :lemma="value"
                  :gnd="value.gnd"
                  @cancel="showGndSearch = false"
                  @input="selectGnd"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
          <v-divider />
          <h4
            class="py-2 px-5 background d-flex">
            Externe Ressourcen
            <v-spacer />
          </h4>
          <v-card-text class="pt-0">
            <v-list color="transparent" dense nav class="text-body-2 pa-0">
              <template v-if="value.columns_scrape">
                <lemma-scrape-result
                  v-for="(source, sourceName) in value.columns_scrape"
                  :key="sourceName"
                  :value="source"
                  :title="sourceName" />
              </template>
            </v-list>
          </v-card-text>
        </v-window-item>
      </v-window>
    </div>
  </v-card>
</template>
<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'
import { LemmaRow } from '@/types/lemma'
import LemmaScrapeResult from './LemmaScrapeResult.vue'
import LobidPreviewCard from './LobidPreviewCard.vue'
import LobidGndSearch from './LobidGndSearch.vue'
import TextField from '@/views/lib/TextField.vue'
import DateField from '@/views/lib/DateField.vue'
import TextFieldAlternatives from '@/views/lib/TextFieldAlternatives.vue'
import FullNameArrayField from '@/views/lib/FullNameArrayField.vue';
import SelectMenu from '@/views/lib/SelectMenu.vue'
import VueFileList from './FileList.vue'
import store from '@/store'
import _ from 'lodash'
import { GenderAe0Enum, List } from '@/api'
import confirm from '@/store/confirm'
import fileDialog from 'file-dialog'
import ZoteroManager from './ZoteroManager.vue'

const DRAG_CLASS = 'drag-over'

interface ZoteroSection {
  lemmaName: string,
  listName: string,
  zoteroKeys: string[],
  column: string,
}

@Component({
  components: {
    LemmaScrapeResult,
    LobidPreviewCard,
    LobidGndSearch,
    TextField,
    SelectMenu,
    TextFieldAlternatives,
    DateField,
    VueFileList,
    ZoteroManager,
    FullNameArrayField,
  }
})
export default class LemmaDetail extends Vue {

  @Prop({ required: true }) value!: LemmaRow
  @Prop({ default: true }) showHeader!: boolean
  log = console.log
  store = store
  showGndSearch = false
  detailPage = 0
  dragEventDepth = 0
  files: File[] = []
  genderOptions: String[] = Object.values(GenderAe0Enum);

  get zoteroSections(): Array<ZoteroSection> {
    const name = `${this.value.lastName}, ${this.value.firstName}`
    return [
      {
        listName: "Literatur von",
        lemmaName: name,
        zoteroKeys: this.value.zoteroKeysBy,
        column: 'zoteroKeysBy',
      },
      {
        listName: "Literatur über",
        lemmaName: name,
        zoteroKeys: this.value.zoteroKeysAbout,
        column: 'zoteroKeysAbout',
      }
    ]
  }


  onDragEnter(event: DragEvent) {
    if (
      event.currentTarget !== null &&
      event.dataTransfer !== null &&
      // during the "drag" phase, the "files" prop is still empty
      // so we use the items prop instead to check _what_ is being dragged.
      event.dataTransfer.items[0] !== null &&
      event.dataTransfer.items[0].kind === 'file'
    ) {
      const target = event.currentTarget as HTMLElement
      this.dragEventDepth = this.dragEventDepth + 1
      target.classList.add(DRAG_CLASS)
      this.detailPage = 1
    }
  }

  onDragLeave(event: DragEvent) {
    this.dragEventDepth = this.dragEventDepth - 1
    if (this.dragEventDepth === 0 && event.currentTarget) {
      const target = event.currentTarget as HTMLElement
      target.classList.remove(DRAG_CLASS)
    }
  }

  onDrop(event: DragEvent) {
    if (
      event.currentTarget !== null &&
      event.dataTransfer !== null &&
      event.dataTransfer.files.length > 0
    ) {
      const target = event.currentTarget as HTMLElement
      target.classList.remove(DRAG_CLASS)
      this.uploadFiles(event.dataTransfer.files)
    }
  }

  async pickFile() {
    const files = await fileDialog({ multiple: true })
    this.files = this.files.concat(Array.from(files))
  }

  isValidFile(f: File): boolean {
    return f.type !== ''
  }

  uploadFiles(fs: FileList) {
    const [validFiles, inValidFiles] = _.partition([...fs], (f) => this.isValidFile(f))
    if (inValidFiles.length > 0) {
      confirm.confirm(`${inValidFiles.length} Datei(en) können nicht hochgeladen werden, weil sie zu groß sind (${ inValidFiles.map(f => f.name).join(', ') }).`)
    }
    this.files = this.files.concat(validFiles)
  }

  countScrapedResources(r: LemmaRow['columns_scrape']) {
    if (r === undefined) {
      return 0
    } else {
      return Object.values(r).filter(r => r !== undefined && !(Array.isArray(r))).length
    }
  }

  selectGnd(gnd: string|null) {
    this.showGndSearch = false
    if (gnd === null) {
      this.$emit('update', { gnd: [] })
    } else {
      this.$emit('update', { gnd: [ gnd ] })
    }
  }

  updateUserColumns(userKey: string, $event: string|number|string[]) {
    this.$emit('update', {
      // eslint-disable-next-line @typescript-eslint/camelcase
      columns_user: {
        ...this.value.columns_user,
        [ userKey ]: $event
      },
      [ userKey ]: $event
    })
  }

  debouncedUpdateUserColumns = _.debounce(this.updateUserColumns, 300)

  updateList(l: List) {
    this.updateData({
      list: {
        id: l.id!,
        title: l.title,
        editor: l.editor?.userId,
      }
    })
  }

  updateData(u: Partial<LemmaRow>) {
    this.$emit('update', u)
  }

  debouncedUpdateData = _.debounce(this.updateData, 300)

}
</script>
<style lang="stylus" scoped>
// tell the browser not to cache this.
.lemma-detail
  will-change contents

.drag-over
  box-shadow inset 0px 0px 0px 3px var(--v-primary-base) !important

h4
  z-index: 1
  position: sticky
  top: 0
  background: transparent

.gideon-legacy-literature > li
  display: inline

.gideon-legacy-literature > li:not(:last-child)::after
  content: ', '  
</style>
