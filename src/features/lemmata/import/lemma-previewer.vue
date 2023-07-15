<script lang="ts" setup>
import { computed } from "vue";

import { lemmaRowTranslations } from "@/lib/labels";
import { type LemmaRow } from "@/types/lemma";

const showThisColumns: Array<keyof LemmaRow> = [
	"firstName",
	"lastName",
	"gender",
	"dateOfBirth",
	"dateOfDeath",
	"professionDetail",
	"bioNote",
	"kinship",
	"religion",
	"gnd",
	"loc",
	"viaf_id",
];

const _props = withDefaults(
	defineProps<{
		lemmas: Array<Partial<LemmaRow>>;
		label?: string;
	}>(),
	{
		label: "Vorschau",
	},
);

/**
 * https://vuetifyjs.com/en/api/v-data-table/#props-headers
 */
const lemmaHeaders = computed(() => {
	return showThisColumns.map((columnName) => {
		return {
			text: lemmaRowTranslations[columnName]!.de,
			value: columnName,
			sortable: true,
			filterable: true,
		};
	});
});
</script>

<template>
	<div class="import-lemma-preview-container">
		<VContainer>
			<VRow>
				<VCol>
					{{ label }}
				</VCol>
			</VRow>
			<VRow>
				<VCol>
					<VDataTable :headers="lemmaHeaders" :items="lemmas" />
				</VCol>
			</VRow>
		</VContainer>
	</div>
</template>
