<template>
  <v-app>
    <v-main style="max-height: 100vh" class="main">
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class App extends Vue {}
</script>

<style lang="stylus">
.main{
  background: #f0f0f0
}
</style>
