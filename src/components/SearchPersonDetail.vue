<template>
  <div>
    <v-text-field
      v-for="(v, i) in fields"
      :key="i"
      dense
      class="detail-text-field caption mr-3"
      flat
      @input="(e) => updateLocalValue(v.value, e)"
      :label="v.text"
      :placeholder="v.hint || ''"
      :rules="v.rules || []"
      :value="computedValue[v.value] || ''"
    />
    <v-btn v-if="hasChanged" @click="resetLocalValue()" elevation="0" small rounded>
      zurücksetzen
    </v-btn>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { PersonField, PersonMatchable } from '../types'

function clone(v: any) {
  return JSON.parse(JSON.stringify(v))
}

@Component
export default class SearchPersonDetail extends Vue {

  @Prop() value: PersonMatchable
  @Prop() fields: PersonField[]

  localValue: any = {}

  updateLocalValue(field: keyof PersonMatchable, val: string): void {
    console.log('update local value')
    if (val === this.localValue[field]) {
      this.$delete(this.localValue, field)
    } else {
      this.localValue[field] = val
      this.$emit('change', clone({...this.value, ...this.localValue}))
    }
  }

  resetLocalValue(): void {
    this.localValue = {}
    this.$emit('change', clone(this.value))
  }

  get hasChanged(): boolean {
    const hasChanged = JSON.stringify(this.value) !== JSON.stringify({...this.value, ...this.localValue})
    console.log('has changed ?', hasChanged)
    return hasChanged
  }

  get computedValue(): PersonMatchable {
    return { ...this.value, ...this.localValue }
  }

  // if the ID changes, we need to update the local value too.
  @Watch('value')
  onChangeValue(newVal: PersonMatchable, oldVal: PersonMatchable): void {
    if (newVal.id !== oldVal.id) {
      console.log('new person selected')
      this.localValue = clone(newVal)
    }
  }
}
</script>
<style lang="stylus" scoped>
.detail-text-field {
  width: 45%;
  display: inline-block;
  /deep/ label{
    font-size: 13px !important;
  }
}
</style>
