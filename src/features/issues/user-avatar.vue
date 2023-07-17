<script lang="ts" setup>
import { computed } from "vue";

import { type Author, type Editor } from "@/api";

const props = defineProps<{
	value: Author | Editor | null;
}>();

const initials = computed(() => {
	if (props.value == null) return "?";

	return (
		props.value.name
			?.split(" ")
			.map((n) => n[0])
			.join("") || "-"
	);
});
</script>

<template>
	<VAvatar
		:class="['text-body-2', value == null ? 'text--secondary font-weight-light' : 'text-primary']"
		:color="value != null ? 'background darken-1' : 'transparent'"
		min-width="30"
		height="30"
		width="30"
	>
		{{ initials }}
	</VAvatar>
</template>
