<template>
  <text-field :label="label">
    <template v-slot:input>
      <div class="outer">
        <select-menu
          :show-chevron="true"
          btn-class="mt-1 mr-2 ml-1 modifier-menu"
          :value="modifier"
          :items="modifiers"
          @input="updateValue({ modifier: $event })"
        />
        <input
          min="1"
          max="31"
          maxlength="2"
          :value="day"
          class="pa-1 text--primary"
          style="width: 40px"
          placeholder="TT"
          @cahnge="updateValue({ day: $event.target.value })"
        />
        <input
          maxlength="2"
          min="1"
          max="12"
          :value="month"
          class="pa-1 text--primary"
          style="width: 40px"
          placeholder="MM"
          @change="updateValue({ month: $event.target.value })"
        />
        <input
          minlength="4"
          maxlength="4"
          :value="year"
          class="pa-1 text--primary"
          style="width: 50px"
          placeholder="JJJJ"
          @change="updateValue({ year: $event.target.value })"
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

  localValue = ''

  @Watch('value', { immediate: true })
  onChangeValue(newV: string) {
    this.localValue = newV || ''
  }

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

  get day() {
    const m = this.localValue.match(/(\d\d?)(?:\D+)(?:\d\d?)(?:\D+)(?:\d\d\d\d)/)
    if (m !== null) {
      console.log(m)
      return m[1]
    } else {
      return ''
    }
  }

  get month() {
    const m = this.localValue.match(/(?:\d\d?)?(?:\D+)(\d\d?)(?:\D+)(?:\d\d\d\d)/)
    if (m !== null) {
      console.log(m)
      return m[1]
    } else {
      return ''
    }
  }

  get year() {
    const m = this.localValue.match(/\d\d\d\d/)
    if (m !== null) {
      return m[0]
    } else {
      return ''
    }
  }

  get modifier() {
    return this.modifiers.find(m => this.localValue.indexOf(m.name) > -1) || this.modifiers[0]
  }

  isValidDate(v: string): boolean {
    return (
      this.year !== '' ||
      this.year !== '' && this.month !== '' ||
      this.year !== '' && this.month !== '' && this.day !== ''
    )
  }

  updateValue(pv: Partial<DateValue>) {
    console.log({ pv })
    this.localValue = this.serializeValue({
      modifier: this.modifier,
      day: this.day,
      month: this.month,
      year: this.year,
      ...pv
    })
    console.log({
      modifier: this.modifier,
      day: this.day,
      month: this.month,
      year: this.year,
      ...pv
    }, 'this.localValue', this.localValue, 'this.serializeValue()')
    if (this.isValidDate(this.localValue)) {
      this.$emit('input', this.localValue)
    }
  }

  serializeValue(v: DateValue) {
    const s = (v.modifier?.value || '') + ' ' + [ v.day, v.month, v.year ].filter(m => m !== '').join('. ').trim()
    console.log(s)
    return s
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
<style lang="stylus">
.modifier-menu
  width: 62px
</style>
