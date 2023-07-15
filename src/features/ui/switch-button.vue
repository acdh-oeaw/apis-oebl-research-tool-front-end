<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
	/** Can emit string or boolean, should use generic instead of any. */
	items: Array<{ icon: string; value: any }>;
	value: any;
}>();

const emit = defineEmits<{
	(event: "input", value: any): void;
}>();

const valueIndex = computed(() => {
	return props.items.findIndex((i) => i.value === props.value);
});

function updateValue(i: number) {
	emit("input", props.items[i]!.value);
}
</script>

<template>
	<VTabs
		background-color="transparent"
		class="rounded-lg"
		grow
		height="40"
		slider-size="40"
		:value="valueIndex"
		@click.native.prevent.stop=""
		@change="updateValue"
	>
		<VTab v-for="item in items" :key="item.value" v-ripple="false" class="rounded-lg">
			<VIcon class="rotate-180">{{ item.icon }}</VIcon>
		</VTab>
		<VTabsSlider class="custom-tab-slider rounded-lg" />
	</VTabs>
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
