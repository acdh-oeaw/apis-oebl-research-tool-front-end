<template>
  <div></div>
</template>
<script lang="ts">
import { getResultsForSearch } from '@/service/backend'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class Result extends Vue {

  @Prop({required: true}) id!: string

  results: any[] = []

  async mounted(): Promise<void> {
    this.results = await getResultsForSearch(this.id)
  }

}
</script>
<style lang="scss" scoped>
</style>
