<template>
  <v-avatar
    :class="[
      'text-body-2',
      value === null ? 'text--secondary font-weight-light' : 'text-primary',
    ]"
    :color="value !== null ? 'background darken-1' : 'transparent'"
    min-width="30"
    height="30"
    width="30">
    {{ initials }}
  </v-avatar>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Editor, Author } from '@/api'

@Component
export default class UserAvatar extends Vue {
  @Prop({ default: null }) value!: Editor|Author|null

  get initials(): string {
    if (this.value !== null) {
      return this.value.name?.split(' ').map((n: string) => n[0]).join('') || '-'
    } else {
      return '?'
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
