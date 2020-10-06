<template>
  <v-app>
    <v-main style="max-height: 100vh" class="main">
      <research-tool />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import ResearchTool from './components/ResearchTool.vue'

export default Vue.extend({
  name: 'App',

  components: {
    ResearchTool
  },

  data: () => ({
    //
  })
})
</script>

<style lang="stylus">
.main{
  background: #f0f0f0
}
</style>
