<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import { GenderAe0Enum } from "@/api";
import { lemmaRowTranslations } from "@/lib/labels";
import { type LemmaPrototypeRequiredFieldsType } from "@/lib/lemmaimport/datacontainers";
import { mapGender } from "@/lib/lemmaimport/dataconversion";
import { defautLemmaFormatterOptions, type GenderMappingOption } from "@/lib/lemmaimport/options";

const props = defineProps<{
	preloadedOptions: GenderMappingOption;
	lemmaPrototypes: Array<LemmaPrototypeRequiredFieldsType>;
}>();

const emit = defineEmits<{
	(event: "options", value: GenderMappingOption): void;
	(event: "data", value: Array<{ gender: any }>): void;
}>();

const localOptions = ref<GenderMappingOption>(defautLemmaFormatterOptions.genderMapping);
const genderEntries = Object.entries(GenderAe0Enum);

watch(
	() => props.preloadedOptions,
	(preloadedOptions) => {
		localOptions.value = preloadedOptions;
	},
	{ immediate: true, deep: true },
);

const genders = computed(() => {
	return props.lemmaPrototypes.map((lemma) => {
		return {
			gender: mapGender(lemma.gender, localOptions.value),
		};
	});
});

watch(
	[localOptions, () => props.lemmaPrototypes],
	() => {
		if (!chosenGendersAreUnique.value) return;

		emit("options", localOptions.value);
		emit("data", genders.value);
	},
	{ deep: true, immediate: true },
);

const gendersInSource = computed(() => {
	return new Set(
		props.lemmaPrototypes
			.map((lemma) => lemma.gender)
			.filter((value: string | null | undefined): value is string => typeof value === "string"),
	);
});

const allChosenGenders = computed(() => {
	return Object.values(localOptions.value).flat();
});

const availableGenders = computed(() => {
	return Array.from(gendersInSource.value).filter(
		(gender) => !allChosenGenders.value.includes(gender),
	);
});

const chosenGendersAreUnique = computed(() => {
	const genders = new Set();

	for (const gender of allChosenGenders.value) {
		if (gender === "") {
			continue;
		}
		if (genders.has(gender)) {
			return false;
		}
		genders.add(gender);
	}

	return true;
});

// https://vuetifyjs.com/en/api/v-data-table/#props-headers
const genderPreviewHeaders = computed(() => {
	return [
		{ text: lemmaRowTranslations.lastName!.de, value: "lastName" },
		{ text: `${lemmaRowTranslations.gender!.de}-Quelle`, value: "genderSource" },
		{ text: `${lemmaRowTranslations.gender!.de}-Import`, value: "genderImport" },
	];
});

const genderPreviewRows = computed(() => {
	const parsedGenders = genders.value;
	const prototypes = props.lemmaPrototypes;

	if (parsedGenders.length !== prototypes.length) {
		console.error({
			message: "Parsed genders do not have the same length as prototypes",
			parsedGenders,
			prototypes,
		});
	}

	return parsedGenders.map((parsedGender, index) => {
		const prototype = prototypes[index]!;
		return {
			lastName: prototype.lastName,
			genderSource: prototype.gender ?? "Kein Wert",
			genderImport: parsedGender.gender ?? "Nicht erkannt",
		};
	});
});
</script>

<template>
	<div class="gender-mapper-container">
		<VContainer>
			<div v-if="!chosenGendersAreUnique" class="not-unique-gender-warning">
				<VRow>
					<VCol>
						<v-alert type="warning">Es kann jedes Geschlecht nur einmal ausgefüllt werden.</v-alert>
					</VCol>
				</VRow>
			</div>
			<div v-for="(entry, key) in genderEntries" :key="`${key}-${entry[0]}`">
				<VRow>
					<VCol>
						<VCombobox
							v-model="localOptions[entry[1]]"
							:label="entry[1]"
							small-chips
							deletable-chips
							:items="availableGenders"
							multiple
						/>
					</VCol>
				</VRow>
			</div>
			<VRow class="gender-import-preview">
				<VCol>
					<VDataTable label="Vorschau" :headers="genderPreviewHeaders" :items="genderPreviewRows" />
				</VCol>
			</VRow>
		</VContainer>
	</div>
</template>
