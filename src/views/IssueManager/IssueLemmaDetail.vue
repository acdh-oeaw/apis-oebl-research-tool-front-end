<template>
  <v-card class="transparent flex-column d-flex fill-height" flat v-if="lemma">
    <v-card-title v-if="researchLemma !== null">
      <v-container class="pa-0">
        <v-row no-gutters>
          <v-col cols="2"></v-col>
            <v-col :key="lemma.id" class="text-center" cols="8">
              {{ researchLemma.lastName }}, {{ researchLemma.firstName }}
            </v-col>
          <v-col cols="2"></v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" class="text-caption text-center">
            {{ dateToYear(researchLemma.dateOfBirth) }} - {{ dateToYear(researchLemma.dateOfDeath) }}
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
          <select-menu
            :show-chevron="true"
            btn-class="px-4 float-right background darken-2"
            :items="lemmaStatuses"
            search-placeholder="Status suchen …"
            :value="lemmaStatus"
            key-value="id"
            key-name="name"
            :return-value="true"
            @input="updateLemma({ status: $event })"
            background-color="transparent"
          />
        </form-row>
        <form-row label="Redakteur">
          <select-menu
            :show-chevron="true"
            btn-class="px-4 float-right background darken-2"
            :items="store.editors.editors"
            search-placeholder="Redakteur suchen …"
            :value="lemmaEditor"
            key-value="userId"
            key-name="name"
            @input="updateLemma({ editor: $event.userId })"
            background-color="transparent"
          />
        </form-row>
        <form-row label="Autor">
          <div style="display: none;">{{temporary_warn_method('Auto complete for author select is currentlx not implemented. This is a TODO!"')}}</div>
           <!--  
            This is a reminder, how this used to look like. TODO: Remove this comment.

            :items="store.authors.authors"
            @input="updateLemma({ author: $event })"
           -->
          <select-menu
            :show-chevron="true"
            btn-class="px-4 float-right background darken-2"
            :items="[]"
            search-placeholder="Autor suchen …"
            :value="lemmaAuthor"
            add-null-option="Kein Autor"
            key-value="userId"
            :return-value="true"
            background-color="transparent"
          />
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
        class="pt-2 pb-2 pl-5 background lighten-1"
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
        class="pl-5 pt-2 pb-2 background lighten-1"
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
        <div class="rounded-lg background darken-1 pa-2 mb-1" v-for="(note, i) in notes" :key="i">
          <div style="opacity: .7" class="px-1 caption note">
            {{ getUserName(note.user) }} — {{ formatTimeDistance(note.created) }}
          </div>
          <div v-text="note.text" class="px-1 pb-2" />
        </div>
      </v-card-text>
    </div>
    <v-divider />
    <v-card-actions>
      <slot />
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { LemmaStatus } from '@/types/issue'
import LoadingSpinner from '../lib/LoadingSpinner.vue'
import LemmaLabels from './LemmaLabels.vue'
import FormRow from '../lib/FormRow.vue'
import store from '../../store'
import { LemmaNote, IssueLemma, Editor, Author } from '@/api'
import SelectMenu from '@/views/lib/SelectMenu.vue'
import formatDistanceToNow from 'date-fns/esm/formatDistanceToNow'
import format from 'date-fns/esm/format'
import de from 'date-fns/esm/locale/de'

@Component({
  components: {
    FormRow,
    LemmaLabels,
    LoadingSpinner,
    SelectMenu
  }
})
export default class IssueLemmaDetail extends Vue {

  // TODO: Remove me!
  temporary_warn_method = window.console.warn

  @Prop({ required: true }) lemma!: IssueLemma

  notes: LemmaNote[] = []
  newNote = ''
  store = store

  isAddingNote = false
  isLoadingNotes = false

  dateToYear(d: string|null|undefined): string|null {
    if (d !== null && d !== undefined) {
      try {
        return format(new Date(d), 'yyyy')
      } catch (e) {
        return null
      }
    } else {
      return null
    }
  }

  get lemmaStatuses(): LemmaStatus[] {
    return store.issue.statuses
  }

  get lemmaStatus(): LemmaStatus|null {
    return store.issue.statuses.find(s => s.id === this.lemma.status) || null
  }

  get lemmaEditor(): Editor|null {
    if (this.lemma.editor) {
      return store.editors.getById(this.lemma.editor) || null
    } else {
      return null
    }
  }

  get lemmaAuthor(): Author|null {
    console.warn('This author feature is currently not implemented. This is a TODO!');
    return null;
    // This is is a reminder, how this used to look like. TODO. Remove this comment.
    // if (this.lemma.author) {
    //   return store.authors.getById(this.lemma.author) || null
    // } else {
    //   return null
    // }
  }

  get researchLemma() {
    return this.lemma.lemma || null
  }

  formatTimeDistance(d: string|undefined): string {
    if (d !== undefined) {
      return `${ formatDistanceToNow(new Date(d), { locale: de, addSuffix: true }) }`
    } else {
      return ''
    }
  }

  getUserName(id: number): string {
    const u = store.editors.getById(id)
    if (u !== undefined) {
      return u.name || ''
    } else {
      return ''
    }
  }

  @Watch('lemma', { immediate: true })
  async onSwitchLemma() {
    this.loadNotes()
  }

  async loadNotes() {
    if (this.lemma.id && this.lemma.notes !== undefined && this.lemma.notes.length > 0) {
      this.isLoadingNotes = true
      this.notes = (await store.issue.loadNotes(this.lemma.id)).reverse()
      this.isLoadingNotes = false
    }
  }

  deleteIssueLemma() {
    this.$emit('delete-issue-lemma', this.lemma.id)
  }

  updateLemma(l: Partial<IssueLemma>) {
    this.$emit('update', this.lemma.id, l)
  }

  updateLabels(labels: number[]) {
    this.updateLemma({ labels })
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
