<template>
  <tr class="background lighten-2 rounded-lg" @click="$emit('select-lemma', value)">
    <td class="pr-0 text-no-wrap" style="width: 80px">
      <user-avatar :value="editor" />
      <user-avatar :value="author" style="margin-left: -5px" />
    </td>
    <td style="font-weight: 500; width: 20%" class="pr-1">
      <template v-if="value.lemma">
        {{ lemma.lastName }} {{ lemma.firstName }}
      </template>
      <span v-else>
        Lemma nicht gefunden.
      </span>
    </td>
    <td>
      {{ dateToYear(lemma.dateOfBirth) }} - {{ dateToYear(lemma.dateOfDeath) }}
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
    </td>
  </tr>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { IssueLemma } from '../../types/issue'
import _ from 'lodash'
import { LemmaLabel, Editor, Author } from '@/api'
import store from '@/store'
import UserAvatar from '@/views/lib/UserAvatar.vue'
import format from 'date-fns/esm/format'

@Component({
  components: {
    UserAvatar
  }
})
export default class IssueLemmaRow extends Vue {

  @Prop({ required: true }) value!: IssueLemma
  @Prop({ default: null }) maxLabels!: number|null
  @Prop({ default: true }) showEditor!: boolean
  @Prop({ default: true }) showAuthor!: boolean
  @Prop({ default: true }) showDescription!: boolean

  dateToYear(d: string|null|undefined): string|null {
    if (d !== null && d !== undefined) {
      return format(new Date(d), 'yyyy')
    } else {
      return null
    }
  }

  get lemma() {
    return this.value.lemma
  }

  get labelsById() {
    return _.keyBy(store.issue.labels, 'id')
  }

  get labelsLimited(): LemmaLabel[] {
    return this.maxLabels !== null
      ? _.take(this.value.labels, this.maxLabels).map(id => this.labelsById[id])
      : this.value.labels.map(id => this.labelsById[id])
  }

  get editor(): Editor|null {
    if (this.value.editor) {
      return store.editors.getById(this.value.editor) || null
    } else {
      return null
    }
  }

  get author(): Author|null {
    if (this.value.editor) {
      return store.authors.getById(this.value.editor) || null
    } else {
      return null
    }
  }
}
</script>
<style lang="stylus" scoped>
.label
  color white
  margin-left 1px
</style>
