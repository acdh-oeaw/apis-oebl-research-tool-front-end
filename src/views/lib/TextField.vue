<template>
  <div :class="[
    'rounded-lg mb-1 text-field-outer',
    color || 'background darken-2'
  ]">
    <div class="d-flex">
      <div
        @click="selectAll"
        v-if="$attrs && $attrs.label"
        class="caption pa-2 text-field-label"
        v-text="$attrs.label"
        style="width: 120px; opacity: .7; padding-bottom: 7px">
        {{ $attrs.label }}
      </div>
      <div style="position: relative" class="fill-width">
        <div class="text-body-2 fill-height fill-width fake-textarea mt-2 mr-2" v-text="localValue" />
        <textarea
          ref="textarea"
          class="fill-height fill-width mt-2 mr-2 text-body-2 "
          style="position: absolute; top: 0; right: 0; bottom: 0; left: 0"
          @keydown="onKeyDown"
          @input="onInput"
          :placeholder="placeholder"
          :value="localValue" />
      </div>
    </div>
    <div class="text-center caption hint" v-if="msg !== null" v-text="msg" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class TextField extends Vue {

  @Prop({ default: () => [] }) rules!: Array<(e: string|null) => string|false>
  @Prop({ default: false }) allowNewLine!: boolean
  @Prop({ default: '' }) value!: string
  @Prop({ default: false }) required!: boolean
  @Prop({ default: false }) selected!: boolean
  @Prop({ default: null }) placeholder!: string|null
  @Prop() color?: string

  msg: string|null = null

  localValue = this.value

  @Watch('value')
  onChangeValue() {
    this.localValue = this.value
  }

  @Watch('selected', {immediate: true})
  async onChangeSelected(shouldSelect: boolean) {
    await this.$nextTick()
    setTimeout(async () => {
      if (shouldSelect === true && this.$refs.textarea instanceof HTMLTextAreaElement) {
        await this.$nextTick()
        this.$refs.textarea.focus()
        this.$refs.textarea.select()
      }
    }, 100)
  }

  selectAll() {
    (this.$el.querySelector('textarea') as HTMLTextAreaElement).select()
  }

  checkValid(e: string|null): boolean {
    if (e != null && e !== '') {
      const r = this.rules.find((r) => {
        return r(e) !== false
      })
      if (r) {
        this.msg = r(e) || null
        return false
      } else {
        this.msg = null
        return true
      }
    } else if (this.required) {
      this.msg = 'Dieses Feld darf nicht leer sein.'
      return false
    } else {
      this.msg = null
      return true
    }
  }

  onInput(e: InputEvent) {
    if (e.target instanceof HTMLTextAreaElement) {
      this.localValue = e.target.value
      if (this.checkValid(e.target.value)) {
        this.$emit('input', e.target.value)
      }
    }
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key.toLowerCase() === 'enter' && this.allowNewLine === false) {
      e.preventDefault()
    }
  }
}
</script>
<style lang="stylus">
.theme--dark .text-field-outer textarea
  color white
</style>
<style lang="stylus" scoped>
textarea
  resize none
  outline 0

.fake-textarea
  min-height 1.6em
  visibility hidden
  will-change contents, height
  word-break break-word

.text-field-label
  word-break break-word

.text-field-outer
  overflow hidden

.text-field-outer:focus-within .text-field-label
  color var(--v-primary-darken1)
  opacity 1

.hint
  background rgba(255,255,255,.1)
</style>
