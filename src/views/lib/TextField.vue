<template>
  <div class="background darken-2 rounded-lg mb-1 text-field-outer">
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
        <div class="text-body-2 fill-height fill-width fake-textarea mt-2 mr-2" v-text="internalValue" />
        <textarea
          class="fill-height fill-width mt-2 mr-2 text-body-2 "
          style="position: absolute; top: 0; right: 0; bottom: 0; left: 0"
          @keydown="onKeyDown"
          @input="onInput"
          v-bind="$attrs"
          :value="internalValue" />
      </div>
    </div>
    <div class="text-center caption hint" v-if="msg !== null" v-text="msg" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import _ from 'lodash'

@Component
export default class TextField extends Vue {

  @Prop({ default: () => [] }) rules!: Array<(e: string|null) => string|false>
  @Prop({ default: false }) allowNewLine!: boolean

  internalValue: string|null = this.$attrs.value || ''
  msg: string|null = null

  selectAll() {
    (this.$el.querySelector('textarea') as HTMLTextAreaElement).select()
  }

  checkValid(e: string|null) {
    if (e != null && e !== '') {
      const r = this.rules.find((r) => {
        return r(e) !== false
      })
      if (r) {
        this.msg = r(e) || null
      } else {
        this.msg = null
      }
    } else {
      this.msg = null
    }
  }

  emitVal(v: string) {
    this.$emit('input', v)
  }

  debouncedEmitVal = _.debounce(this.emitVal, 300)

  onInput(e: InputEvent) {
    if (e.target instanceof HTMLTextAreaElement) {
      this.internalValue = e.target.value
      this.checkValid(e.target.value)
      this.debouncedEmitVal(e.target.value)
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
  visibility hidden
  will-change contents, height

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
