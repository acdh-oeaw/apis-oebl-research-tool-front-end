<script lang="ts" setup>
import { toNumber } from "lodash";
import { ref, watch } from "vue";

import { type ProfessionGroup } from "@/api";
import { OpenAPI } from "@/api/core/OpenAPI";
import { lemmaRowTranslations } from "@/util/labels";

interface VAutoComplete {
	id?: number;
	value: string;
	text: string;
}

interface ServerAutoCompleteResult {
	id: string;
	text: string;
	selected_text: string;
}

interface ServerAutoCompleteResultSet {
	results: Array<ServerAutoCompleteResult>;
}

function convertServerAutoCompleteResultToVAutoComplete(
	serverAutoCompleteResult: ServerAutoCompleteResult,
): VAutoComplete {
	return {
		id: toNumber(serverAutoCompleteResult.id),
		value: serverAutoCompleteResult.text,
		text: serverAutoCompleteResult.text,
	};
}

function convertServerAutoCompleteResultProfessionGroup(
	serverAutoCompleteResult: ServerAutoCompleteResult,
): ProfessionGroup {
	return { id: toNumber(serverAutoCompleteResult.id), name: serverAutoCompleteResult.text };
}

const props = defineProps<{
	selected: ProfessionGroup | null;
}>();

const searchTerm = ref("");
const localSelected = ref<string | null>(null);
const searchResults = ref<Array<VAutoComplete>>([]);
let professionGroupCache: Array<ProfessionGroup> = [];
const loading = ref(false);
const errorMessages = ref<Array<string>>([]);

watch(
	() => props.selected,
	() => {
		if (props.selected == null) return;

		professionGroupCache.push(props.selected);
		localSelected.value = props.selected.name;
	},
	{ immediate: true },
);

const emit = defineEmits<{
	(event: "input", value: ProfessionGroup): void;
}>();

watch(
	localSelected,
	() => {
		const _localSelected = findProfessionGroup();

		if (_localSelected == null) {
			console.error({
				message: "Could not find professionGroup AutoComplete Result from search term.",
				localSelected: localSelected.value,
				searchResults: searchResults.value,
				searchTerm: searchTerm.value,
			});

			return;
		}

		if (props.selected != null && _localSelected.id === props.selected.id) return;

		emit("input", _localSelected);
	},
	{ deep: true },
);

watch(searchTerm, (searchTerm) => {
	if (!searchTerm) return;
	if (searchTerm === localSelected.value) return;

	const url = new URL(`${OpenAPI.BASE}/research/api/v1/autocompletes/professiongroup/`);

	url.searchParams.set("q", searchTerm);

	loading.value = true;

	const fetching = fetch(url.toString());

	fetching.catch((reason) => {
		errorMessages.value.push(`Ergebnisse konnten nicht geladen werden: ${reason}`);
		console.error({ message: "Could not load profession group auto complete", reason });
		loading.value = false;
	});

	fetching.then((response: Response) => {
		errorMessages.value = [];

		response.json().then((data: ServerAutoCompleteResultSet) => {
			loading.value = false;
			searchResults.value = data.results.map(convertServerAutoCompleteResultToVAutoComplete);
			professionGroupCache = professionGroupCache.concat(
				data.results.map(convertServerAutoCompleteResultProfessionGroup),
			);
		});
	});
});

function findProfessionGroup(): ProfessionGroup | undefined {
	return professionGroupCache.find(
		(professionGroup) => professionGroup.name === localSelected.value,
	);
}
</script>

<template>
	<div class="outer profession-group">
		<VAutocomplete
			v-model="localSelected"
			cache-items
			:error-messages="errorMessages"
			:items="searchResults"
			:label="lemmaRowTranslations.professionGroup.de"
			:loading="loading"
			no-data-text="Bitte geben Sie einen Suchbegriff ein"
			:search-input.sync="searchTerm"
		/>
	</div>
</template>
