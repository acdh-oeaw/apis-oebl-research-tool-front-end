<template>
  <div
    class="badge"
    :class="[ color, $vuetify.theme.dark ? 'theme--dark' : '' ]">
    {{ readable }}
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import HRNumbers from 'human-readable-numbers'

@Component
export default class Badge extends Vue {
  @Prop({ default: '' }) content!: string|number
  @Prop({ default: '' }) color!: string

  get readable() {
    if (typeof this.content === 'number' && this.content >= 1000) {
      return HRNumbers.toHumanString(this.content)
    } else {
      return this.content
    }
  }
}
</script>
<style lang="stylus" scoped>
.badge
  border-radius 10px
  color #fff
  font-size 11px
  height 18px
  letter-spacing 0
  min-width 20px
  padding 1px 6px
  text-align center
  text-indent 0
  top auto
  transition .3s cubic-bezier(.25,.8,.5,1)
  white-space nowrap
  color rgba(0,0,0,.8)
  background var(--v-background-darken3)
  &.theme--dark
    color rgba(255,255,255, .8)
    background var(--v-background-lighten2)
</style>
