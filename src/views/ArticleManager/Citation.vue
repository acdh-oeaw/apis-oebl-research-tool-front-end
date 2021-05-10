<template>
  <div style="min-width: 300px">
    <text-field @input="searchBook" class="px-2 pb-1" placeholder="Werk suchen …">
      <loading-spinner v-if="loading" :size="21" class="mt-2"  />
    </text-field>
    <div
      v-for="result in results"
      :key="result.data.key">
      {{ result.data.title }}
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import TextField from '@/views/lib/TextField.vue'
import LoadingSpinner from '@/views/lib/LoadingSpinner.vue'
import zotero, { Title } from '@/service/zotero'
@Component({
  components: {
    TextField,
    LoadingSpinner
  }
})
export default class Citation extends Vue {

  @Prop({ default: null }) id!: string|null

  loading = false
  results: Title[] = []

  async searchBook(e: string|null) {
    this.loading = true
    if (e !== null && e.trim().length > 0) {
      this.results = await zotero.searchTitle(e)
    }
    this.loading = false
  }

  mounted() {
  }
}
</script>
<style lang="stylus" scoped>
</style>
