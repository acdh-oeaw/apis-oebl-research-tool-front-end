<template>
  <person-query />
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import PersonQuery from './PersonQuery.vue'

@Component({
  components: {
    PersonQuery
  }
})
export default class ResearchTool extends Vue {

}
</script>
<style lang="scss" scoped>
</style>
