<template>
  <tr class="background lighten-2">
    <td class="pr-0 text-no-wrap" style="width: 80px">
      <v-avatar
        v-if="value.editor"
        min-width="30"
        width="30"
        height="30"><img style="background: var(--v-background-darken1)" :src="value.editor.profilePicture" /></v-avatar>
      <v-avatar
        style="margin-left: -5px"
        class="author"
        color="background darken-2"
        min-width="30"
        height="30"
        width="30">
        {{ authorInitials }}
      </v-avatar>
    </td>
    <td style="font-weight: 500" class="pr-1">
      <template v-if="value.lemma">
        {{ lemma.lastName }} {{ lemma.firstName }}
      </template>
      <span v-else>
        Lemma nicht gefunden.
      </span>
    </td>
    <td>
      <div class="float-right fill-height d-flex">
        <v-chip
          small
          class="label align-self-center"
          v-for="label in labelsLimited"
          :color="label.color"
          :key="label.id">
          {{ label.name }}
        </v-chip>
      </div>
      <template v-if="value.lemma">
        {{ value.lemma.description }}
      </template>
    </td>
  </tr>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { IssueLemma, Label } from '../../types/issue'
import _ from 'lodash'
import { LemmaLabel } from '@/api'
import store from '@/store'
import { LemmaRow } from '@/types/lemma'

@Component
export default class IssueLemmaRow extends Vue {

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
      : this.value.labels.map(id => this.labelsById[id])
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
.label
  color white
  margin-left 1px
</style>
