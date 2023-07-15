<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import LemmaPreviewer from "@/features/lemmata/import/lemma-previewer.vue";
import {
	type LemmaPrototypeNullableStringType,
	type LemmaPrototypeRequiredFieldsType,
	type LemmaPrototypeStringType,
} from "@/lib/lemmaimport/datacontainers";
import {
	filterMissingRequiredFields,
	getMissingRequiredFieldIndexes,
	replaceNullStrings,
	showMissingRequiredFields,
} from "@/lib/lemmaimport/dataconversion";

const props = defineProps<{
	lemmaPrototypes: Array<LemmaPrototypeStringType>;
	preloadedNullValues: Array<string>;
}>();

const emit = defineEmits<{
	(event: "options", value: Array<string>): void;
	(event: "data", value: Array<LemmaPrototypeRequiredFieldsType>): void;
	(event: "missingRowsIndexes", value: Array<number>): void;
}>();

const localNullValues = ref<Array<string>>([]);

watch(
	() => props.preloadedNullValues,
	() => {
		localNullValues.value = props.preloadedNullValues;
	},
	{ immediate: true, deep: true },
);

const lemmasWithNulls = computed(() => {
	return props.lemmaPrototypes.map((lemmaPrototype) =>
		replaceNullStrings(lemmaPrototype, localNullValues.value),
	);
});

const lemmaPrototypesWithRequiredFields = computed(() => {
	return filterMissingRequiredFields(lemmasWithNulls.value);
});

const nullPrototypes = computed(() => {
	return showMissingRequiredFields(lemmasWithNulls.value);
});

const missingRequiredFieldIndexes = computed(() => {
	return getMissingRequiredFieldIndexes(nullPrototypes.value);
});

watch(
	[localNullValues, lemmaPrototypesWithRequiredFields],
	() => {
		emit("options", localNullValues.value);
		emit("data", lemmaPrototypesWithRequiredFields.value);
		emit("missingRowsIndexes", missingRequiredFieldIndexes.value);
	},
	{ deep: true, immediate: true },
);

// https://vuetifyjs.com/en/api/v-autocomplete/#props-items
const vuetifyNullSelect = computed(() => {
	return localNullValues.value.map((nullValue) => {
		return {
			text: JSON.stringify(nullValue),
			value: nullValue,
		};
	});
});
</script>

<template>
	<div class="null-manager-container">
		<VContainer>
			<VRow class="null-managment-options">
				<VCol>
					<VCombobox
						v-model="localNullValues"
						multiple
						:items="vuetifyNullSelect"
						label="Nullwerte"
						deletable-chips
						small-chips
					/>
				</VCol>
			</VRow>
			<VRow v-if="nullPrototypes.length" class="fields-missing">
				<VCol>
					<LemmaPreviewer
						:lemmas="nullPrototypes"
						label="Lemmas ohne Nachname können nicht importiert werden."
					/>
				</VCol>
			</VRow>
			<VRow class="nulled-result">
				<VCol>
					<LemmaPreviewer
						:lemmas="lemmaPrototypesWithRequiredFields"
						label="Diese Lemmas werden importiert."
					/>
				</VCol>
			</VRow>
		</VContainer>
	</div>
</template>
