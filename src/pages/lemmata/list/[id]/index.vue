<script lang="ts" setup>
import { assert, isNonEmptyString } from "@acdh-oeaw/lib";
import { computed } from "vue";
import { useRoute } from "vue-router/composables";

import LemmaManager from "@/features/lemmata/lemma-manager.vue";
import { isPositiveInteger } from "@/lib/is-positive-integer";

const route = useRoute();

const params = computed(() => {
	const id = Number(route.params.id);
	assert(isPositiveInteger(id));
	return { id };
});

const query = computed(() => {
	if (!isNonEmptyString(route.query.focus)) return { id: null };

	const id = Number(route.query.focus);

	if (!isPositiveInteger(id)) return { id: null };

	return { id };
});
</script>

<template>
	<LemmaManager :lemma-list-id="params.id" :highlight-id="query.id" />
</template>
