<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router/composables";

import IssuesManager from "@/features/issues/issues-manager.vue";

interface Params {
	id: number | null;
}

const route = useRoute();

const params = computed<Params>(() => {
	return {
		id: Number(route.params.id) || null,
	};
});
</script>

<template>
	<IssuesManager :id="params.id" />
</template>
