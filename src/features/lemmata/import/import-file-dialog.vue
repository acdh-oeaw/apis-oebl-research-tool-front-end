<script lang="ts" setup>
import { range, truncate, zip } from "lodash";
import { computed, ref, watch } from "vue";

import CsvImporter from "@/features/lemmata/import/csv-importer.vue";
import { Data2D } from "@/lib/lemmaimport/datacontainers";
import { defaultOptions, type SupportedFilesOptions } from "@/lib/lemmaimport/options";

const props = defineProps<{
	preloadedFileOptions: SupportedFilesOptions;
}>();

const emit = defineEmits<{
	(event: "options", value: SupportedFilesOptions): void;
	(event: "data", value: Data2D | null): void;
	(event: "submit"): void;
}>();

const file = ref<File | null>(null);

const localOptions = ref<SupportedFilesOptions>(defaultOptions);

const rawData = ref<Array<Array<string>> | null>(null);
const fileType = ref<SupportedFilesOptions["fileType"]>("text/csv");

const localData = computed(() => {
	if (rawData.value == null || rawData.value.length === 0) {
		return null;
	}

	return new Data2D(headers.value, tableBody.value);
});

const headers = computed(() => {
	if (rawData.value == null || rawData.value.length === 0) {
		return [];
	}

	return localOptions.value.useFirstRowAsHeaders
		? rawData.value[0]!
		: range(1, rawData.value[0]!.length + 1).map(String);
});

const tableBody = computed(() => {
	if (rawData.value == null || rawData.value.length === 0) {
		return [];
	}

	return localOptions.value.useFirstRowAsHeaders
		? rawData.value.slice(1, rawData.value.length)
		: rawData.value;
});

function emitOptions(): void {
	emit("options", localOptions.value);
}

function emitData(): void {
	if (localData.value == null) {
		return;
	}

	emit("data", localData.value);
}

function submit(): void {
	emit("submit");
}

watch(
	() => props.preloadedFileOptions,
	() => {
		localOptions.value = props.preloadedFileOptions;
		fileType.value = props.preloadedFileOptions.fileType;
	},
	{ deep: true, immediate: true },
);

watch([rawData, localOptions], () => {
	emitData();
});

watch(localOptions, () => {
	emitOptions();
});

/**
 * Provide this: https://vuetifyjs.com/en/api/v-data-table/#props-headers
 */
const vuetifyDataTableHeaders = computed(() => {
	return headers.value.map((header) => {
		return {
			text: header,
			value: header,
			align: "start",
			sortable: false, // Preview only, don't give the feeling, that you can chnge here anything.
			filterable: false, // Preview only, don't give the feeling, that you can chnge here anything.
		};
	});
});

/**
 * According to the documentation the await any array (https://vuetifyjs.com/en/api/v-data-table/#props-items), but this does not work.
 *
 *  In https://github.com/vuetifyjs/vuetify/blob/master/packages/docs/src/examples/v-data-table/prop-custom-filter.vue they await an object with heder names as keys …
 */
const vuetifyDataTableItems = computed(() => {
	const truncatedRows = tableBody.value.map((row) =>
		row.map((value) => truncate(value, { length: 25, omission: " […]" })),
	);
	return truncatedRows.map((row) => Object.fromEntries(zip(headers.value, row)));
});
</script>

<template>
	<div class="file-options-container">
		<VContainer>
			<VRow class="select-file">
				<VFileInput
					:accept="fileType"
					label="Bitte eine Datei auswählen"
					@change="file = $event === undefined ? null : $event"
				/>
				<VSpacer />
				<VSelect
					v-model="fileType"
					label="Dateityp"
					:items="[{ text: 'csv', value: 'text/csv' }]"
				/>
			</VRow>
			<VRow class="file-type-options">
				<CsvImporter
					v-if="file != null && file.type === 'text/csv'"
					:file="file"
					:preloaded-options="preloadedFileOptions"
					@options="localOptions = $event"
					@data="rawData = $event"
				/>
			</VRow>
			<VRow class="general-file-options">
				<VCol>
					<VCheckbox
						v-if="localOptions"
						v-model="localOptions.useFirstRowAsHeaders"
						label="Enthält Spaltenüberschriften"
					/>
				</VCol>
			</VRow>
			<VRow class="submit">
				<VCol>
					<VBtn :disabled="rawData === null" @click="submit()">Weiter</VBtn>
				</VCol>
			</VRow>
			<VRow class="data-preview">
				<VDataTable dense :headers="vuetifyDataTableHeaders" :items="vuetifyDataTableItems" />
			</VRow>
		</VContainer>
	</div>
</template>
