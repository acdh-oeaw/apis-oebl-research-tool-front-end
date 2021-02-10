<template>
  <v-card color="background lighten-1" rounded="lg">
    <v-card-title class="text-center text-caption">
      <v-spacer />Datei ”{{ fileName }}” importieren…<v-spacer />
    </v-card-title>
    <v-card-text class="pa-0">
      <v-window v-model="step">
        <v-window-item>
          <column-matcher
            :target-columns="allowedPersonFields"
            :return-ignored-columns="true"
            :prefix-ignored-columns="userColumnPrefix"
            @cancel="$emit('cancel')"
            color="background"
            @update="importable = $event"
            :file-type="fileType"
            :file-name="fileName"
            :buffer="buffer" />
        </v-window-item>
        <v-window-item class="align-content-center text-center">
          <div class="mb-2 mt-5">Suche GNDs…</div>
          <v-progress-linear
            rounded
            class="ma-auto"
            style="width: 50%"
            :value="importProgress"
          />
        </v-window-item>
        <v-window-item class="align-content-center text-center">
          <h2 class="pt-4 pb-3 font-weight-regular">Wählen Sie einen Listennamen für den Import</h2>
          <v-text-field
            autofocus
            label="Listenname"
            value="Import vom 1/2/21"
            class="mx-5 rounded-lg"
            hint="Der Name kann später geändert werden"
            v-model="importToListName"
            solo
            flat
            placeholder="Listenname…" />
        </v-window-item>
      </v-window>
    </v-card-text>
    <v-card-actions class="pa-4">
      <v-btn
        class="px-4 rounded-lg"
        elevation="0"
        @click="$emit('cancel')">
        Abbrechen
      </v-btn>
      <v-spacer />
      <!-- <span class="caption grey--text">Schritt {{ step + 1 }} von 3</span> -->
      <v-spacer />
      <v-btn
        v-if="step === 0"
        class="px-4 rounded-lg"
        elevation="0"
        :disabled="importableHeaders === 0"
        color="primary"
        @click="startLobidMatching">
        {{ importableHeaders }} Spalte(n) importieren
      </v-btn>
      <v-btn
        v-if="step === 2"
        class="px-4 rounded-lg"
        elevation="0"
        color="primary"
        @click="importLemmas(importable, importToListName)">
        Import abschließen
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ColumnMatcher from './ColumnMatcher.vue'
import LoadingSpinner from '../lib/LoadingSpinner.vue'
import { PersonField, ImportablePerson } from '@/types/lemma'
import * as lobid from '../../service/lobid'
import store from '../../store'
import format from 'date-fns/format'
import de from 'date-fns/locale/de'
import _ from 'lodash'

@Component({
  components: {
    ColumnMatcher,
    LoadingSpinner
  }
})
export default class LemmaImporter extends Vue {

  @Prop({ required: true }) fileType!: string
  @Prop({ required: true }) fileName!: string
  @Prop({ required: true }) buffer!: Buffer

  importProgress = 0
  step = 0
  log = console.log
  importable: ImportablePerson[] = []
  userColumnPrefix = 'user.'
  importToListName = 'Import ' + format(new Date(), 'd MMM yyyy', { locale: de })

  get importableHeaders(): number {
    if (this.importable.length > 0) {
      return Object.keys(this.importable[0]).filter(k => !k.startsWith(this.userColumnPrefix)).length
    } else {
      return 0
    }
  }

  // TODO: check string
  async importLemmas(lemmas: ImportablePerson[], listName: string) {
    const maybeList = await store.lemma.importLemmas(lemmas, listName)
    if (maybeList !== undefined) {
      store.lemma.selectedLemmaListId = maybeList.id || null
    }
    this.$emit('confirm')
  }

  async startLobidMatching(rs: any[]) {
    this.step = this.step + 1
    const chunkLength = 30
    let chunkIndex = 0
    for (const chunk of _.chunk(this.importable, chunkLength)) {
      const rs = await Promise.all(chunk.map(p => {
        return lobid.findPerson(p)
          .then(lp => {
            return {
              ...p,
              gnd: lp.map(l => {
                if (typeof l !== 'string') {
                  console.log(l)
                  return (l as any).gndIdentifier
                } else {
                  return null
                }
              })
            }
          })
      }))
      this.importProgress = (chunkLength * chunkIndex) / this.importable.length * 100
      this.importable.splice(chunkIndex * chunkLength, chunkLength, ...rs)
      chunkIndex = chunkIndex + 1
      await this.$nextTick()
      console.log('done with chunk ' + chunkIndex, {chunk})
      console.log('searchtable is now', this.importable)
    }
    this.step = this.step + 1
  }

  allowedPersonFields: PersonField[] = [
    {
      value: 'firstName',
      text: 'Vorname'
    },
    {
      value: 'lastName',
      text: 'Nachname'
    },
    {
      value: 'dateOfBirth',
      text: 'Geburtsdatum oder -jahr',
      hint: 'YYYY oder YYYY-MM-DD',
      rules: [ (e?: string): boolean => e !== undefined && (e.trim() === '' || /^(\d{4}-\d{2}-\d{2})|(\d{4})$/.test(e)) ]
    },
    {
      value: 'dateOfDeath',
      text: 'Sterbedatum oder -jahr',
      hint: 'YYYY oder YYYY-MM-DD',
      rules: [ (e?: string): boolean => e !== undefined && (e.trim() === '' || /^(\d{4}-\d{2}-\d{2})|(\d{4})$/.test(e)) ]
    },
    {
      value: 'placeOfDeath',
      text: 'Sterbeort'
    },
    {
      value: 'placeOfBirth',
      text: 'Geburtsort'
    },
    {
      value: 'gnd',
      text: 'GND',
      rules: [ (e: any): boolean => !isNaN(e) ]
    }
  ]

  mounted() {
    
  }
}
</script>
<style lang="scss" scoped>
</style>
