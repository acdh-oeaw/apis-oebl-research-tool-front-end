<template>
	<v-tabs
		@click.native.prevent.stop=""
		grow
		slider-size="40"
		class="rounded-lg"
		height="40"
		:value="valueIndex"
		@change="updateValue"
		background-color="transparent"
	>
		<v-tab v-for="item in items" :key="item.value" class="rounded-lg" v-ripple="false">
			<v-icon class="rotate-180">{{ item.icon }}</v-icon>
		</v-tab>
		<v-tabs-slider class="custom-tab-slider rounded-lg" />
	</v-tabs>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

@Component
export default class SwitchButton extends Vue {
	@Prop({ default: [] }) items!: Array<{ icon: string; value: string }>;
	@Prop({ default: null }) value!: string;

	get valueIndex(): number {
		return this.items.findIndex((i) => i.value === this.value);
	}

	updateValue(i: number) {
		this.$emit("input", this.items[i].value);
	}
}
</script>
<style lang="stylus">
.v-tabs-slider-wrapper
  z-index -1
.v-tabs .v-tab:hover:before
  border-radius 7px
</style>
<style lang="stylus" scoped>
.custom-tab-slider
  background-color rgba(0,0,0,.15) !important
</style>
