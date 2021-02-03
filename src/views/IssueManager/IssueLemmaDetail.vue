<template>
  <v-card class="transparent flex-column d-flex fill-height" flat v-if="lemma">
    <v-card-title v-if="researchLemma !== null">
      <v-btn
        style="position: absolute; right: 0px; top: 5px;"
        width="48"
        height="48"
        tile
        class="rounded-lg mr-2"
        @click="$emit('close')"
        icon>
        <v-icon>mdi-dock-right</v-icon>
      </v-btn>
      <v-container class="pa-0">
        <v-row no-gutters>
          <v-col cols="1"></v-col>
          <transition name="roll">
            <v-col :key="lemma.id" class="text-center" cols="10">
              {{ researchLemma.lastName }}, {{ researchLemma.firstName }}
            </v-col>
          </transition>
          <v-col cols="1"></v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" class="text-caption text-center">
            {{ researchLemma.birthYear }} - {{ researchLemma.deathYear }}
          </v-col>
        </v-row>
      </v-container>
    </v-card-title>
    <v-card-title v-else>
      <span class="caption">Lemma nicht gefunden.</span>
    </v-card-title>
    <v-divider />
    <div class="flex-grow-1 overflow-y-auto">
      <v-card-text class="px-5 py-2 flex-grow-1">
        <form-row label="Status">
          <v-select
            class="mt-0"
            hide-details
            dense
            solo
            flat
            background-color="transparent"
            return-object
            @change="$emit('update-status', $event.value, lemma)"
            :value="lemma.status"
            :items="lemmaStatusSelectable" />
        </form-row>
        <form-row label="Redakteur">
          <v-select
            class="mt-0"
            hide-details
            dense
            solo
            flat
            background-color="transparent"
            item-text="name"
            item-value="userId"
            :value="lemma.editor"
            :items="store.editors.editors" />
        </form-row>
        <form-row label="Autor">
          <v-select
            class="mt-0"
            hide-details
            dense
            solo
            flat
            background-color="transparent"
            item-text="name"
            item-value="userId"
            :value="lemma.author"
            :items="store.authors.authors" />
        </form-row>
        <form-row label="Wortanzahl">
          <!-- FIXME: -->
          <div class="pr-4 text-right">{{ 0 }} Wörter</div>
        </form-row>
        <form-row label="Entitäten">
          <!-- FIXME: -->
          <div class="pr-4 text-right">{{ 0 }} Entitäten</div>
        </form-row>
      </v-card-text>
      <v-divider />
      <h4
        class="pt-2 pb-2 pl-5 background"
        :style="{
          zIndex: 1,
          position: 'sticky',
          top: 0,
      }">Labels</h4>
      <v-card-text class="pt-0">
        <lemma-labels
          :value="lemma.labels"
          @update="updateLabels" />
      </v-card-text>
      <v-divider />
      <h4
        class="pl-5 pt-2 pb-2 background"
        :style="{
        zIndex: 1,
        position: 'sticky',
        top: 0
      }">Notizen</h4>
      <v-card-text style="position: relative" class="pt-0">
        <v-textarea
          placeholder="Notiz hinzufügen…"
          rows="1"
          hide-details
          class="mb-2 rounded-lg text-body-2"
          auto-grow
          solo
          flat
          :disabled="isAddingNote || isLoadingNotes"
          v-model="newNote"
          @keydown.meta.enter.prevent="addNote"
          @keydown.ctrl.enter.prevent="addNote"
          background-color="background darken-2">
          <template v-slot:append>
            <v-btn
              small
              :disabled="newNote === null || newNote.trim() === ''"
              elevation="0"
              @click="addNote"
              class="rounded-lg"
              icon
              tile>
              <v-icon small>mdi-send</v-icon>
            </v-btn>
          </template>
        </v-textarea>
        <div class="rounded-lg background darken-2 pa-2 mb-1" v-for="(note, i) in notes" :key="i">
          <div style="opacity: .7" class="px-1 caption note">su
            ID: {{ note.user }}
            — {{ formatTimeDistance(note.created) }}
          </div>
          <div v-text="note.text" class="px-1 pb-2" />
        </div>
      </v-card-text>
    </div>
    <v-divider />
    <v-card-actions>
      <v-row dense>
        <v-col>
          <v-btn
            :disabled="lemma.lemma === null"
            class="rounded-lg"
            color="background darken-2"
            elevation="0"
            @click="openInLemmaManager"
            block>
            <v-icon style="opacity: .7" left>mdi-bookshelf</v-icon>Lemma anzeigen
          </v-btn>
        </v-col>
        <v-col>
          <v-btn class="rounded-lg" elevation="0" block color="primary">
            <v-icon style="opacity: .7" left>mdi-pen</v-icon> Artikel anzeigen
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Label, LemmaStatus } from '@/types/issue'
import LoadingSpinner from '../lib/LoadingSpinner.vue'
import LemmaLabels from './LemmaLabels.vue'
import FormRow from '../lib/FormRow.vue'
import store from '../../store'
import { LemmaNote, IssueLemma } from '@/api'
import { formatDistanceToNow } from 'date-fns'
import de from 'date-fns/esm/locale/de'

@Component({
  components: {
    FormRow,
    LemmaLabels,
    LoadingSpinner
  }
})
export default class LemmaDetail extends Vue {

  @Prop({ required: true }) lemma!: IssueLemma

  get lemmaStatus(): LemmaStatus[] {
    return store.issue.statuses
  }

  get researchLemma() {
    if (this.lemma.lemma) {
      return store.lemma.getLemmaById(this.lemma.lemma) || null
    } else {
      return null
    }
  }

  notes: LemmaNote[] = []
  newNote = ''
  store = store

  isAddingNote = false
  isLoadingNotes = false

  openInLemmaManager() {
    if (this.researchLemma !== null) {
      store.lemma.selectedLemmas = [ this.researchLemma ]
      store.lemma.showSideBar = true
      this.$router.push('/lemmas')
    }
  }

  formatTimeDistance(d: string|undefined): string {
    if (d !== undefined) {
      return `vor ${ formatDistanceToNow(new Date(d), { locale: de }) }`
    } else {
      return ''
    }
  }

  @Watch('lemma', { immediate: true })
  async onSwitchLemma() {
    this.loadNotes()
  }

  async loadNotes() {
    if (this.lemma.id) {
      this.isLoadingNotes = true
      this.notes = (await store.issue.loadNotes(this.lemma.id)).reverse()
      this.isLoadingNotes = false
    }
  }

  updateLabels(labels: number[]) {
    console.log({labels})
    if (this.lemma.id) {
      store.issue.updateLemma(this.lemma.id, { labels })
    }
  }

  async addNote() {
    if (this.newNote.trim() !== '') {
      this.isAddingNote = true
      // this.lemma.notes.unshift({ user: { name: 'arni', userId: '1', email: 'yoyoyo.test', role: { id: '1', name: 'yo' } }, date: 'gerade eben', text: this.newNote, id: 'test' })
      if (this.lemma.id) {
        await store.issue.addNote(this.lemma.id, this.newNote.trim())
        this.loadNotes()
        this.newNote = ''
        this.isAddingNote = false
      }
    }
  }

  get labels() {
    return store.labels.labels
  }

  get lemmaStatusSelectable() {
    return this.lemmaStatus.map(s => ({ text: s.name, value: s.id }))
  }

}
</script>
<style lang="stylus" scoped>
// allow whitespace in notes
.note
  white-space break-spaces

.roll-enter-active, .roll-leave-active
  position relative
  transition: all .3s ease;

.roll-enter, .roll-leave-to
  position absolute
  opacity: 0

.roll-enter
  transform translateY(20px)
.roll-leave-to
  transform translateY(-20px)

</style>
