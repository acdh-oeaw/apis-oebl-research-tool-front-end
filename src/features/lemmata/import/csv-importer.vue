<script lang="ts" setup>
import { isEqual } from "lodash";
import neatCsv from "neat-csv";
import { ref, watch } from "vue";

import { type CsvOptions, defaultOptions } from "@/lib/lemmaimport/options";

const props = defineProps<{
	file: File;
	preloadedOptions: CsvOptions;
}>();

const emit = defineEmits<{
	(event: "options", value: CsvOptions): void;
	(event: "data", value: Array<Array<string>>): void;
}>();

const plainText = ref<string | null>(null);
const data = ref<Array<Array<string>>>([[]]);
const localOptions = ref<CsvOptions>(defaultOptions);

const separatorSuggestions = ref([",", ";", "\t"]);
const textDelimiterSuggestions = ref(["'", '"']);
const newLineSuggestions = ref(["\n", "\r\n"]);

watch(
	localOptions,
	() => {
		if (isEqual(localOptions.value, props.preloadedOptions)) return;

		emit("options", localOptions.value);
	},
	{ deep: true, immediate: true },
);

watch(
	data,
	() => {
		emit("data", data.value);
	},
	{ deep: true },
);

watch(
	() => props.preloadedOptions,
	(preloadedOptions) => {
		localOptions.value = preloadedOptions;
	},
	{ deep: true, immediate: true },
);

watch(
	() => props.file,
	() => {
		props.file.text().then((text: string) => {
			plainText.value = text;
		});
	},
	{ deep: true, immediate: true },
);

watch(
	[plainText, localOptions],
	() => {
		if (plainText.value == null) return;

		neatCsv(
			plainText.value,
			// https://github.com/mafintosh/csv-parser#options
			{
				escape: localOptions.value.textDelimiter,
				headers: false,
				newline: localOptions.value.newLine,
				quote: localOptions.value.textDelimiter,
				separator: localOptions.value.separator,
			},
		).then((rows) => {
			data.value = rows.map((cells) => Object.values(cells).map(String));
		});
	},
	{ deep: true },
);
</script>

<template>
	<div>
		<VContainer>
			<VRow justify="start">
				<VCol cols="4">
					<VAutocomplete
						v-model="localOptions.separator"
						label="Trennzeichen"
						:items="separatorSuggestions"
					/>
				</VCol>

				<VCol cols="4">
					<VAutocomplete
						v-model="localOptions.textDelimiter"
						label="Texttrenner"
						:items="textDelimiterSuggestions"
					/>
				</VCol>

				<VCol cols="4">
					<VAutocomplete
						label="Zeilentrenner"
						:value="JSON.stringify(localOptions.newLine)"
						:items="newLineSuggestions.map((value) => JSON.stringify(value))"
						@change="localOptions.newLine = JSON.parse($event)"
					/>
				</VCol>
			</VRow>
		</VContainer>
	</div>
</template>
