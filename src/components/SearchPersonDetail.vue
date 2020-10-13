<template>
  <div>
    <v-text-field
      v-for="(v, i) in fields"
      :key="i"
      dense
      class="detail-text-field caption mr-3"
      flat
      @input="updateLocalValue(v.value, $event)"
      :label="v.text"
      :placeholder="v.hint || ''"
      :rules="v.rules || []"
      :value="computedValue[v.value]"
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
    if (this.value[field] === this.localValue[field]) {
      this.$delete(this.localValue, field)
    } else {
      this.localValue[field] = val
      this.$emit('change', {...this.value, ...this.localValue})
    }
  }

  resetLocalValue(): void {
    this.localValue = {}
    this.$emit('change', this.value)
  }

  get hasChanged(): boolean {
    return JSON.stringify(this.value) !== JSON.stringify({...this.value, ...this.localValue})
  }

  get computedValue(): PersonMatchable {
    return { ...this.value, ...this.localValue }
  }

  // if the ID changes, we need to update the local value too.
  @Watch('value')
  onChangeValue(newVal: PersonMatchable, oldVal: PersonMatchable): void {
    if (newVal.id !== oldVal.id) {
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
