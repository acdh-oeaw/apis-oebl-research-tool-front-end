<script lang="ts" setup>
import _ from "lodash";
import { computed } from "vue";

import Badge from "@/features/ui/badge.vue";
import { type LemmaRow } from "@/types/lemma";

const props = withDefaults(
	defineProps<{
		rows: Array<LemmaRow>;
		maxItems?: number;
	}>(),
	{
		rows: () => [],
		maxItems: 5,
	},
);

const limitedRows = computed(() => {
	const rows = props.rows.filter(Boolean);
	return rows.slice(Math.max(0, rows.length - props.maxItems));
});
</script>

<template>
	<VCard class="rounded-lg soft-shadow" style="position: absolute; left: -1000px">
		<Badge
			color="primary darken-2 white--text"
			style="position: absolute; top: -6px; right: -6px"
			:content="rows.length"
		/>
		<VList class="text-body-2" dense>
			<VListItem v-for="(s, i) in limitedRows" :key="i">
				<VListItemContent>{{ s.lastName }}, {{ s.firstName }}</VListItemContent>
			</VListItem>
			<VListItem
				v-if="limitedRows.length < rows.length"
				class="font-weight-bold"
				style="opacity: 70%"
			>
				<VListItemContent>+ {{ rows.length - maxItems }} weitere…</VListItemContent>
			</VListItem>
		</VList>
	</VCard>
</template>
