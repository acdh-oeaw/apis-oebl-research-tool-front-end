<script lang="ts" setup>
import { assert } from "@acdh-oeaw/lib";
import { computed } from "vue";
import { useRoute } from "vue-router/composables";

import IssueManager from "@/features/issues/issue-manager.vue";
import { isPositiveInteger } from "@/lib/is-positive-integer";

const route = useRoute();

const params = computed(() => {
	const id = Number(route.params.id);
	assert(isPositiveInteger(id));
	return { id };
});
</script>

<template>
	<IssueManager :id="params.id" />
</template>
