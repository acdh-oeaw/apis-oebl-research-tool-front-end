<script lang="ts" setup>
import { computed } from "vue";

import { useVuetify } from "@/lib/use-vuetify";

const props = defineProps<{
	content?: number | string;
	color?: string;
}>();

const vuetify = useVuetify();

const readable = computed(() => {
	if (typeof props.content === "number" && props.content >= 1000) {
		const formatter = new Intl.NumberFormat("en", { notation: "compact", compactDisplay: "short" });
		return formatter.format(props.content);
	} else {
		return props.content ?? "";
	}
});
</script>

<template>
	<div class="badge" :class="[props.color, vuetify.theme.dark ? 'theme--dark' : '']">
		{{ readable }}
	</div>
</template>

<style scoped>
.badge {
	top: auto;
	min-width: 20px;
	height: 18px;
	padding: 1px 6px;
	border-radius: 10px;
	background: var(--v-background-darken3);
	color: hsl(0deg 0% 0%);
	font-size: 11px;
	letter-spacing: 0;
	text-align: center;
	text-indent: 0;
	white-space: nowrap;
	transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.badge.theme--dark {
	background: var(--v-background-lighten2);
	color: hsl(60deg 100% 52%);
}
</style>
