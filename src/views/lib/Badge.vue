<template>
	<div class="badge" :class="[color, $vuetify.theme.dark ? 'theme--dark' : '']">
		{{ readable }}
	</div>
</template>

<script lang="ts">
import HRNumbers from "human-readable-numbers";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Badge extends Vue {
	@Prop({ default: "" }) content!: number | string;
	@Prop({ default: "" }) color!: string;

	get readable() {
		if (typeof this.content === "number" && this.content >= 1000) {
			return HRNumbers.toHumanString(this.content);
		} else {
			return this.content;
		}
	}
}
</script>

<style lang="stylus" scoped>
.badge
  top auto
  min-width 20px
  height 18px
  padding 1px 6px
  border-radius 10px
  background var(--v-background-darken3)
  color #fff
  color rgb(0 0 0 / 80%)
  font-size 11px
  letter-spacing 0
  text-align center
  text-indent 0
  white-space nowrap
  transition 0.3s cubic-bezier(0.25,0.8,0.5,1)

  &.theme--dark
    background var(--v-background-lighten2)
    color rgb(255 255 255 / 80%)
</style>
