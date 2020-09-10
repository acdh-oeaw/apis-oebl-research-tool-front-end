<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        :dense="dense"
        :value="value"
        :label="label"
        hint="JJJJ-MM-TT Format"
        persistent-hint
        v-bind="attrs"
        @input="$emit('input', $event)"
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker
      :value="value"
      no-title
      @input="$emit('input', $event)">
      <v-btn @click="menu = false">OK</v-btn>
    </v-date-picker>
  </v-menu>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class DatePicker extends Vue {

  @Prop() value: string|null
  @Prop() label: string|null
  @Prop() dense: boolean|undefined
  menu = false

  parseDate (date: string) {
    if (!date) return null
    const [year, month, day] = date.trim().split('-')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
}
</script>
<style lang="scss" scoped>
</style>
