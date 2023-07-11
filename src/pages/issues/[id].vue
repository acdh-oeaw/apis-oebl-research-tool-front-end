<script lang="ts" setup>
import { assert } from "@acdh-oeaw/lib";
import { computed } from "vue";
import { useRoute } from "vue-router/composables";

import IssueManager from "@/features/issues/issue-manager.vue";

interface Params {
	id: number;
}

const route = useRoute();

const params = computed<Params>(() => {
	const id = Number(route.params.id);
	assert(Number.isSafeInteger(id) && id > 0);
	return { id };
});
</script>

<template>
	<IssueManager :id="params.id" />
</template>
