<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router/composables";

import IssueManager from "@/views/IssueManager/IssueManager.vue";

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
	<IssueManager :issue-id="params.id" />
</template>
