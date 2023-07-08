<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class SwitchButton extends Vue {
	@Prop({ default: [] }) items!: Array<{ icon: string; value: string }>;
	@Prop({ default: null }) value!: string;

	get valueIndex(): number {
		return this.items.findIndex((i) => i.value === this.value);
	}

	updateValue(i: number) {
		this.$emit("input", this.items[i]!.value);
	}
}
</script>

<template>
	<v-tabs
		grow
		slider-size="40"
		class="rounded-lg"
		height="40"
		:value="valueIndex"
		background-color="transparent"
		@click.native.prevent.stop=""
		@change="updateValue"
	>
		<v-tab v-for="item in items" :key="item.value" v-ripple="false" class="rounded-lg">
			<v-icon class="rotate-180">{{ item.icon }}</v-icon>
		</v-tab>
		<v-tabs-slider class="custom-tab-slider rounded-lg" />
	</v-tabs>
</template>

<style>
.v-tabs-slider-wrapper {
	z-index: -1;
}

.v-tabs .v-tab:hover::before {
	border-radius: 7px;
}
</style>

<style scoped>
.custom-tab-slider {
	background-color: hsl(0deg 0% 0%) !important;
}
</style>
