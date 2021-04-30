<template>
  <v-navigation-drawer
    :color="color"
    v-bind="{...$props, ...$attrs}"
    :right="right"
    stateless
    floating
    :clipped="clipped"
    :width="localWidth"
    ref="drawer"
    :class="{
      'display-card': card,
      'nav-drawer': true,
      'will-close': willClose,
      'right': right
    }"
    :value="value"
    @input="handleInput"
    app>
    <div
      v-if="!mini"
      @dblclick="expandOrShrink"
      @mousedown="startDrag"
      :class="{
        'resize-handle-outer': true,
        'right': right
      }">
      <div
        class="resize-handle"
        :style="{ backgroundColor: $vuetify.theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)' }"
      />
    </div>
    <slot />
  </v-navigation-drawer>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class ResizableDrawer extends Vue {

  @Prop({ default: false }) value!: boolean
  @Prop({ default: false }) right!: boolean
  @Prop({ default: false }) card!: boolean
  @Prop({ default: false }) mini!: boolean
  @Prop({ default: false }) clipped!: boolean
  @Prop({ default: 250 }) minWidth!: number
  @Prop({ default: 300 }) width!: number
  @Prop() color!: string

  localWidth = this.width
  transitionValues: {[selector: string]: string} = {}
  maxWidth = 750
  closeWidth = 225
  willClose = false

  @Watch('width')
  onChangeWidthProp(w: number) {
    this.localWidth = w
  }

  cssVars() {
    return {'--bg-color': this.color}
  }

  expandOrShrink() {
    if (this.width === this.minWidth) {
      this.localWidth = this.maxWidth
    } else if (this.width === this.maxWidth) {
      this.localWidth = this.minWidth
    } else {
      this.localWidth = this.maxWidth
    }
    this.$emit('update:width', this.localWidth)
  }

  disableUserSelect() {
    document.body.style.pointerEvents = 'none'
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
  }

  enableUserSelect() {
    document.body.style.pointerEvents = 'initial'
    document.body.style.userSelect = 'initial'
    document.body.style.webkitUserSelect = 'initial'
  }

  disableTransitions(...selectors: string[]) {
    selectors.forEach(s => {
      document.querySelectorAll(s).forEach((e) => {
        if (e instanceof HTMLElement) {
          // cache ’em
          this.transitionValues[s] = e.style.transition
          // unset em
          e.style.transition = 'none'
        }
      })
    })
  }

  enableAllTransitions() {
    Object.entries(this.transitionValues).forEach(e => {
      document.querySelectorAll(e[0]).forEach((el) => {
        if (el instanceof HTMLElement) {
          // give them their old value
          el.style.transition = e[1]
        }
      })
    })
  }

  startDrag() {
    this.disableUserSelect()
    this.disableTransitions('.nav-drawer', '.v-main', '.v-toolbar')
    document.addEventListener('mousemove', this.drag)
    document.addEventListener('mouseup', this.endDrag)
  }

  endDrag() {
    this.willClose = false
    this.enableUserSelect()
    this.enableAllTransitions()
    document.removeEventListener('mousemove', this.drag)
    document.removeEventListener('mouseup', this.endDrag)
    // if it’s too big or too small, bounce back.
    if (this.localWidth > this.maxWidth) {
      this.localWidth = this.maxWidth
    } else if (this.width < this.closeWidth) {
      this.$emit('close')
      this.localWidth = this.minWidth
    } else if (this.width < this.minWidth) {
      this.localWidth = this.minWidth
    }
    this.$emit('update:width', this.localWidth)
  }

  drag(e: MouseEvent) {
    const intendedWidth = this.right ? (document.body.clientWidth - e.pageX) : e.pageX
    if (intendedWidth < this.minWidth) {
      this.localWidth = intendedWidth - (intendedWidth - this.minWidth) / 1.5
      if (this.localWidth < this.closeWidth) {
        this.willClose = true
      }
    } else if (intendedWidth > this.maxWidth) {
      this.willClose = false
      this.localWidth = intendedWidth - (intendedWidth - this.maxWidth) / 1.5
    } else {
      this.willClose = false
      this.localWidth = intendedWidth
    }
  }

  handleInput(v: boolean) {
    if (v === false) {
      this.$emit('close')
    }
  }
}
</script>
<style lang="stylus">
.nav-drawer .v-navigation-drawer__content
  background var(--bg-color)
  position: relative;

</style>

<style lang="stylus" scoped>
.nav-drawer:not(.v-navigation-drawer--custom-mini-variant)
  min-width 100px
  will-change width
  overflow visible
  & /deep/ .v-navigation-drawer__content
    background-color var(--v-color)

.nav-drawer
  paddding-left 100px

.nav-drawer.display-card /deep/ .v-navigation-drawer__content
  box-shadow 10px 10px 100px rgba(0,0,50,.15)
  border-radius 13px

.nav-drawer.display-card /deep/ .v-navigation-drawer__content
  margin 10px 0 10px 10px

.nav-drawer.right.display-card /deep/ .v-navigation-drawer__content
  margin 10px 10px 10px 0

.resize-handle-outer
  position: absolute;
  width 8px
  height: 100%
  right: 5px
  cursor: ew-resize;
  z-index: 6;
  &.right
    left: 2px

.resize-handle
  position: absolute;
  height: 80px;
  width: 5px;
  border-radius: 2px;
  top: calc(50% - 40px);
  left: 3px;

.theme--light
  color rgba(0,0,0,.7)

.will-close /deep/ .v-navigation-drawer__content
  transition transform .2s
  transform translateX(50px) scale(.9)
</style>
