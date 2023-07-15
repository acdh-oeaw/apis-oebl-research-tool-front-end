<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import DateFormatter from "@/features/lemmata/import/date-formatter.vue";
import GenderMapper from "@/features/lemmata/import/gender-mapper.vue";
import LemmaPreviewer from "@/features/lemmata/import/lemma-previewer.vue";
import NullManager from "@/features/lemmata/import/null-manager.vue";
import {
	type LemmaDates,
	type LemmaGender,
	type LemmaPrototypeRequiredFieldsType,
	type LemmaPrototypeStringType,
} from "@/lib/lemmaimport/datacontainers";
import { mergeBuildNewLemmaRows } from "@/lib/lemmaimport/dataconversion";
import { defautLemmaFormatterOptions, type LemmaFormatterOptions } from "@/lib/lemmaimport/options";
import { type NewLemmaRow } from "@/types/lemma";

/**
 * Takes LemmaPrototypes And Converts Them To LemmaRows
 */

const props = defineProps<{
	lemmaPrototypes: Array<LemmaPrototypeStringType>;
	preloadedOptions: LemmaFormatterOptions;
}>();

const emit = defineEmits<{
	(event: "submit"): void;
	(event: "data", value: Array<NewLemmaRow>): void;
	(event: "options", value: LemmaFormatterOptions): void;
	(event: "missingRowsIndexes", value: Array<number>): void;
}>();

const localOptions = ref<LemmaFormatterOptions>(defautLemmaFormatterOptions);
const lemmasPrototypesWithNullsAndRequiredFields = ref<Array<LemmaPrototypeRequiredFieldsType>>([]);
// Some rows, will not be imported. These are their indexes.
const missingRowsIndexes = ref<Array<number>>([]);
const dates = ref<Array<LemmaDates>>([]);
const genders = ref<Array<LemmaGender>>([]);

watch(
	() => props.preloadedOptions,
	() => {
		localOptions.value = props.preloadedOptions;
	},
	{ immediate: true, deep: true },
);

const newLemmas = computed(() => {
	// If not all columns are definied, do not create data.
	if (
		new Set([
			lemmasPrototypesWithNullsAndRequiredFields.value.length, // Basic data
			dates.value.length,
			genders.value.length, // New formatted data
		]).size !== 1
	) {
		return []; // Columns not ready: No result!
	}

	return mergeBuildNewLemmaRows(
		lemmasPrototypesWithNullsAndRequiredFields.value,
		dates.value,
		genders.value,
	);
});

watch(
	[newLemmas, localOptions],
	() => {
		emit("data", newLemmas.value);
		emit("options", localOptions.value);
		emit("missingRowsIndexes", missingRowsIndexes.value);
	},
	{ immediate: true, deep: true },
);

function submit() {
	emit("submit");
}
</script>

<template>
	<div class="lemma-formatter-container">
		<VContainer>
			<VRow class="lemma-formatting-options">
				<VCol>
					<VExpansionPanels multiple>
						<VExpansionPanel class="null-managment-row">
							<VExpansionPanelHeader>Null-Werte</VExpansionPanelHeader>
							<VExpansionPanelContent eager>
								<NullManager
									:lemma-prototypes="lemmaPrototypes"
									:preloaded-null-values="localOptions.nullValues"
									@options="localOptions.nullValues = $event"
									@data="lemmasPrototypesWithNullsAndRequiredFields = $event"
									@missingRowsIndexes="missingRowsIndexes = $event"
								/>
							</VExpansionPanelContent>
						</VExpansionPanel>

						<VExpansionPanel>
							<VExpansionPanelHeader>Datumsformattierung</VExpansionPanelHeader>
							<VExpansionPanelContent eager>
								<DateFormatter
									:lemma-prototypes="lemmasPrototypesWithNullsAndRequiredFields"
									:preloaded-date-format-option="localOptions.dateFormat"
									@data="dates = $event"
									@options="localOptions.dateFormat = $event"
								/>
							</VExpansionPanelContent>
						</VExpansionPanel>

						<VExpansionPanel>
							<VExpansionPanelHeader>Gender</VExpansionPanelHeader>
							<VExpansionPanelContent eager>
								<GenderMapper
									:lemma-prototypes="lemmasPrototypesWithNullsAndRequiredFields"
									:preloaded-options="localOptions.genderMapping"
									@data="genders = $event"
									@options="localOptions.genderMapping = $event"
								/>
							</VExpansionPanelContent>
						</VExpansionPanel>
					</VExpansionPanels>
				</VCol>
			</VRow>

			<VRow class="submit-lemma-formatting-row">
				<VCol>
					<VBtn @click="submit">Weiter</VBtn>
				</VCol>
			</VRow>
			<VRow class="lemma-formatting-preview-row">
				<VCol>
					<LemmaPreviewer :lemmas="newLemmas" />
				</VCol>
			</VRow>
		</VContainer>
	</div>
</template>
