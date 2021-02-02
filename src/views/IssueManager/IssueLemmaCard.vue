<template>
  <div @click="$emit('select-lemma', value)">
    <template v-if="value.lemma">
      <h2 class="ma-0">{{ lemma.firstName }} {{ lemma.lastName }}</h2>
      <h5 class="pa-0 ma-0" v-if="showDescription">{{ lemma.description }}</h5>
    </template>
    <span class="caption" v-else>
      Lemma nicht gefunden.
    </span>
    <v-row class="mt-2" no-gutters>
      <v-col>
        <v-avatar
          class="ma-0"
          min-width="30"
          height="30"
          width="30"
          v-if="value.editor !== null && showEditor">
          <img style="background: var(--v-background-lighten1)" :key="value.editor" :src="value.editor.profilePicture">
        </v-avatar>
        <v-avatar
          class="author"
          color="background darken-2"
          min-width="30"
          height="30"
          width="30"
          v-if="showAuthor">
          {{ authorInitials }}
        </v-avatar>
      </v-col>
      <v-col class="text-right">
        <v-chip
          small
          class="label"
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
import { LemmaRow } from '@/types/lemma'
@Component
export default class IssueLemmaCard extends Vue {

  @Prop({ required: true }) value!: IssueLemma
  @Prop({ required: true }) lemma!: LemmaRow
  @Prop({ default: null }) maxLabels!: number|null
  @Prop({ default: true }) showEditor!: boolean
  @Prop({ default: true }) showAuthor!: boolean
  @Prop({ default: true }) showDescription!: boolean

  get labelsById() {
    return _.keyBy(store.issue.labels, 'id')
  }

  get labelsLimited(): LemmaLabel[] {
    return this.maxLabels !== null
      ? _.take(this.value.labels, this.maxLabels).map(id => this.labelsById[id])
      : this.value.labels!.map(id => this.labelsById[id])
  }

  get authorInitials(): string {
    if (this.value.author) {
      const author = store.authors.getById(this.value.author)
      return author?.name?.split(' ').map((n: string) => n[0]).join('') || '-'
    } else {
      return '-'
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
.author
  margin-left -3px
  // box-shadow 0 0 0 3px white
  font-size .8em
</style>
