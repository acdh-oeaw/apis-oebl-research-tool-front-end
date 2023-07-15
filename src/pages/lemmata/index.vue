<script lang="ts" setup>
import { assert, isNonEmptyString } from "@acdh-oeaw/lib";
import { computed } from "vue";
import { useRoute } from "vue-router/composables";

import LemmaManager from "@/features/lemmata/lemma-manager.vue";
import { isPositiveInteger } from "@/lib/is-positive-integer";

const route = useRoute();

const params = computed(() => {
	if (!isNonEmptyString(route.query.highlightId)) return { id: null };

	const id = Number(route.query.highlightId);
	assert(isPositiveInteger(id));
	return { id };
});
</script>

<template>
	<LemmaManager :highlight-id="params.id" />
</template>
