<template>
  <div>
    <v-textarea
      dense
      solo
      rows="1"
      auto-grow
      flat
      background-color="background darken-2"
      class="text-body-2 textarea pb-1 rounded-lg"
      hide-details
      @keydown="onKeyDown"
      @input="checkValid"
      v-on="$listeners"
      v-bind="$attrs"
      label="">
      <template v-slot:prepend-inner>
        <slot>
          <div style="width: 120px; opacity: .7; padding-bottom: 7px" v-if="$attrs && $attrs.label" class="caption">{{ $attrs.label }}</div>
        </slot>
      </template>
    </v-textarea>
    <div class="text-center caption" v-if="msg !== null" v-text="msg" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class TextField extends Vue {

  @Prop({ default: () => [] }) rules!: Array<(e: string|null) => string|false>
  @Prop({ default: false }) allowNewLine!: boolean

  msg: string|null = null

  checkValid(e: string|null) {
    const r = this.rules.find((r) => {
      console.log(r(e), e)
      return r(e) !== false
    })
    if (r) {
      this.msg = r(e) || null
    } else {
      this.msg = null
    }
  }

  onKeyDown(e: KeyboardEvent) {
    console.log(e)
    if (e.key.toLowerCase() === 'enter' && this.allowNewLine === false) {
      e.preventDefault()
    }
  }
}
</script>
<style lang="stylus" scoped>
.textarea /deep/ textarea
  line-height 1.3em
  padding-top 3px
</style>
