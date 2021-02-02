<template>
  <v-card :color="color" rounded="lg">
    <v-card-title class="text-center text-caption">
      Lemma hinzufügen
    </v-card-title>
    <v-divider />
    <v-card-text>
      <!-- alle default fields für ein lemma -->
      <!-- automatische GND suche via LOBID -->
      <!-- automatisch alle bestehenden lemmata mit Furry/Levensthein durchsuchen und als vorschläge ausgeben -->
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-btn class="rounded-lg" color="background darken-2" elevation="0">
        Abbrechen
      </v-btn>
      <v-spacer />
      <v-btn @click="addLemma" class="rounded-lg" color="primary" elevation="0">
        Lemma hinzufügen
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import confirm from '../../store/confirm'

@Component
export default class LemmaAdd extends Vue {

  @Prop({ default: undefined }) color!: string|undefined

  async addLemma() {
    if (await confirm.confirm('testtext')) {
      console.log('confirmed')
    } else {
      console.log('aborted')
    }
  }

  mounted() {
    
  }
}
</script>
<style lang="scss" scoped>
</style>
