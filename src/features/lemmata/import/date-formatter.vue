<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import { lemmaRowTranslations } from "@/lib/labels";
import {
	type LemmaDates,
	type LemmaPrototypeRequiredFieldsType,
} from "@/lib/lemmaimport/datacontainers";
import {
	type SupportedDateFormats as SupportedDateFormatType,
	supportedDateFormats,
} from "@/lib/lemmaimport/options";

type DateComparisionView = {
	firstName: string;
	lastName: string;
	dateOfBirthString: string;
	dateOfBirthParsed: string;
	dateOfDeathString: string;
	dateOfDeathParsed: string;
};

const props = defineProps<{
	lemmaPrototypes: Array<LemmaPrototypeRequiredFieldsType>;
	preloadedDateFormatOption: SupportedDateFormatType;
}>();

const emit = defineEmits<{
	(event: "options", value: SupportedDateFormatType): void;
	(
		event: "data",
		value: Array<{
			dateOfBirth: string | null;
			dateOfDeath: string | null;
		}>,
	): void;
}>();

const localDateFormat = ref<SupportedDateFormatType>(supportedDateFormats[0]!);

watch(
	() => props.preloadedDateFormatOption,
	() => {
		localDateFormat.value = props.preloadedDateFormatOption;
	},
	{ immediate: true, deep: true },
);

const dates = computed(() => {
	return props.lemmaPrototypes.map((lemmaPrototype) => {
		return {
			dateOfBirth: format(lemmaPrototype.dateOfBirth),
			dateOfDeath: format(lemmaPrototype.dateOfDeath),
		};
	});
});

watch(
	[
		dates,
		// FIXME: where?
		// , options
	],
	() => {
		emit("options", localDateFormat.value);
		emit("data", dates.value);
	},
	{ immediate: true, deep: true },
);

function format(date: string | null) {
	if (date == null) return null;

	const formatter = Intl.DateTimeFormat(this.localDateFormat === "DD.MM.YYYY" ? "de-AT" : "en-GB", {
		dateStyle: "short",
	});

	try {
		return formatter.format(new Date(date));
	} catch {
		return null;
	}
}

function formatDate(date: string | null) {
	return this.format(date) || "Datum unerkannt";
}

const dateViews = computed(() => {
	const comparisionViews: Array<DateComparisionView> = [];

	let dateRow: LemmaDates;
	let lemmaPrototype: LemmaPrototypeRequiredFieldsType;

	for (let index = 0; index < props.lemmaPrototypes.length; index++) {
		dateRow = dates.value[index]!;
		lemmaPrototype = props.lemmaPrototypes[index]!;

		comparisionViews.push({
			firstName: lemmaPrototype.firstName ?? "",
			lastName: lemmaPrototype.lastName,
			dateOfBirthString: lemmaPrototype.dateOfBirth ?? "",
			dateOfBirthParsed: formatDate(dateRow.dateOfBirth),
			dateOfDeathString: lemmaPrototype.dateOfDeath ?? "",
			dateOfDeathParsed: formatDate(dateRow.dateOfDeath),
		});
	}

	return comparisionViews;
});

const previewHeaders = [
	{ text: lemmaRowTranslations.firstName!.de, value: "firstName" },
	{ text: lemmaRowTranslations.lastName!.de, value: "lastName" },
	{ text: `${lemmaRowTranslations.dateOfBirth!.de} Quelle`, value: "dateOfBirthString" },
	{ text: `${lemmaRowTranslations.dateOfBirth!.de} geparst`, value: "dateOfBirthParsed" },
	{ text: `${lemmaRowTranslations.dateOfDeath!.de} Quelle`, value: "dateOfDeathString" },
	{ text: `${lemmaRowTranslations.dateOfDeath!.de} geparst`, value: "dateOfDeathParsed" },
];
</script>

<template>
	<div class="date-formating-container">
		<VContainer>
			<VRow>
				<VCol>
					<v-select v-model="localDateFormat" label="Datumsformat" :items="supportedDateFormats" />
				</VCol>
			</VRow>
			<VRow class="date-parse-preview">
				<VCol>
					<VDataTable :headers="previewHeaders" :items="dateViews" />
				</VCol>
			</VRow>
		</VContainer>
	</div>
</template>
