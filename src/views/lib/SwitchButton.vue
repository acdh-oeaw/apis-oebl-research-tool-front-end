<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
	items: Array<{ icon: string; value: string }>;
	value: string;
}>();

const emit = defineEmits<{
	(event: "input", value: string): void;
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
		grow
		slider-size="40"
		class="rounded-lg"
		height="40"
		:value="valueIndex"
		background-color="transparent"
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
