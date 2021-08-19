<template>
  <text-field :label="label">
    <template v-slot:input>
      <div class="outer">
        <select-menu
          :show-chevron="true"
          btn-class="mt-1 mr-2 ml-1"
          :value="parsedValue.modifier"
          :items="modifiers"
          @input="updateValue({ modifier: $event })"
        />
        <input
          maxlength="2"
          :value="parsedValue.day"
          class="pa-1 text--primary"
          style="width: 35px"
          placeholder="TT"
          @input="updateValue({ day: $event.target.value })"
        />
        <input
          maxlength="2"
          :value="parsedValue.month"
          class="pa-1 text--primary"
          style="width: 35px"
          placeholder="MM"
          @input="updateValue({ month: $event.target.value })"
        />
        <input
          minlength="4"
          maxlength="4"
          :value="parsedValue.year"
          class="pa-1 text--primary"
          style="width: 50px"
          placeholder="YYYY"
          @input="updateValue({ year: $event.target.value })"
          />
      </div>
    </template>
    <slot />
  </text-field>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import TextField from './TextField.vue'
import SelectMenu from './SelectMenu.vue'

interface DateValue {
  day: string|null
  month: string|null
  year: string|null
  modifier: {
    value: string|null
    name: string
  }
}

@Component({
  components: {
    TextField,
    SelectMenu
  }
})
export default class DateField extends Vue {

  @Prop({ default: null }) label!: string|null
  @Prop({ default: '' }) value!: string

  readonly modifiers = [
    {
      name: 'genau',
      value: null
    },
    {
      name: 'ca.',
      value: 'ca.',
    },
    {
      name: 'nach',
      value: 'nach'
    },
    {
      name: 'vor',
      value: 'vor'
    },
    {
      name: 'um',
      value: 'um'
    }
  ]

  updateValue(pv: Partial<DateValue>) {
    this.$emit('input', this.serializeValue({
      ...this.parsedValue, ...pv
    }))
  }

  serializeValue(v: DateValue) {
    return [
      v.modifier?.value, [
        v.day,
        v.month,
        v.year
      ].filter(t => t !== null).join('. ')
    ].filter(t => t !== null).join(' ')
  }

  get parsedValue(): DateValue {
    const v = this.value || ''
    const yearMatches = v.match(/\d\d\d\d/) || [ null ]
    const monthMatches = v.match(/(?:\d\d?). (?:\d\d\d\d)/) || [ null, null ]
    const dayMatches = v.match(/(\d\d?). (?:\d\d?). (?:\d\d\d\d)/) || [ null, null ]
    const modifierMatches = this.modifiers.find(m => v.indexOf(m.name) > -1)
    return {
      year: yearMatches[0],
      month: monthMatches[1],
      day: dayMatches[1],
      modifier: modifierMatches || this.modifiers[0]
    }
  }

}
</script>
<style lang="stylus" scoped>
.outer
  display flex
  height 100%
input
  text-align center
</style>
