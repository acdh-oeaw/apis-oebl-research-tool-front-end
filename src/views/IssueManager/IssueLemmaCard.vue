<template>
  <div style="user-select: none" @click="$emit('select-lemma', value)">
    <template v-if="value.lemma">
      <h2 class="ma-0">{{ lemma.firstName }} {{ lemma.lastName }}</h2>
      <h5 class="pa-0 ma-0" v-if="showBirthAndDeath">{{ dateToYear(lemma.dateOfBirth) }} - {{ dateToYear(lemma.dateOfDeath) }}</h5>
    </template>
    <span class="caption" v-else>
      Lemma nicht gefunden.
    </span>
    <v-row class="mt-2" no-gutters>
      <v-col>
        <user-avatar v-if="showEditor" :value="editor" />
        <user-avatar v-if="showAuthor" :value="author" style="margin-left: -5px" />
      </v-col>
      <v-col class="text-right">
        <v-chip
          small
          class="label px-2 ml-1"
          v-for="label in labelsLimited"
          :color="label.color"
          :key="label.id">
          {{ label.name }}
        </v-chip>
      </v-col>
    </v-row>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import store from '@/store'
import _ from 'lodash'
import { LemmaLabel, IssueLemma } from '@/api'
import UserAvatar from '@/views/lib/UserAvatar.vue'
import format from 'date-fns/esm/format'

@Component({
  components: {
    UserAvatar
  }
})
export default class IssueLemmaCard extends Vue {

  @Prop({ required: true }) value!: IssueLemma
  @Prop({ default: null }) maxLabels!: number|null
  @Prop({ default: true }) showEditor!: boolean
  @Prop({ default: true }) showAuthor!: boolean
  @Prop({ default: true }) showBirthAndDeath!: boolean

  get labelsById() {
    return _.keyBy(store.issue.labels, 'id')
  }

  get lemma() {
    return this.value.lemma
  }

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

  get labelsLimited(): LemmaLabel[] {
    return this.maxLabels !== null
      ? _.take(this.value.labels, this.maxLabels).map(id => this.labelsById[id])
      : this.value.labels!.map(id => this.labelsById[id])
  }

  get editor() {
    if (this.value.editor) {
      return store.editors.getById(this.value.editor) || null
    } else {
      return null
    }
  }

  get author() {
    if (this.value.author) {
      return store.authors.getById(this.value.author) || null
    } else {
      return null
    }
  }
}
</script>
<style lang="stylus" scoped>
h2
  font-size 115%
  font-weight 500
  opacity .8
h5
  font-weight normal
  opacity .8
  overflow hidden
  white-space nowrap
  text-overflow ellipsis
.label
  color white !important
  font-weight 600
.id-img
  font-size .8em
  &.author
    margin-left -3px
</style>
