<template>
  <v-card color="background darken-2" class="rounded-lg pr-2 pb-2 pl-2 pt-0">
    <v-card-text
      class="pa-0 pt-4 fragment"
      style="font-size: 120%; line-height: 1.2;"
      v-for="(fragment, gnd) in fragments"
      :key="gnd"
    >
      <v-row no-gutters>
        <v-col class="pl-1" align-self="center" cols="1">
          <v-checkbox />
        </v-col>
        <v-col v-html="fragment.html" cols="11">
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-btn elevation="0" class="rounded-lg" color="background" block>Auswahl zurücksetzen</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class LobidPreviewCard extends Vue {
  @Prop({ default: {} }) fragments!: { [gnd: number]: {html: string, selected: boolean} }
}
</script>
<style lang="stylus" scoped>
.fragment /deep/ img
  border-radius 7px

.fragment /deep/ a
  font-weight 700
  color var(--v-secondary-base)
</style>
