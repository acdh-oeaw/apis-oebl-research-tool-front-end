<script lang="ts">
import { toNumber } from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

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

/**
 * Search And Select Profession Groups From Django Server
 *
 * Emits Profession Group
 */
@Component
export default class ProfessionGroupField extends Vue {
	@Prop({ default: null }) selected!: ProfessionGroup | null;

	searchTerm = "";
	localSelected: string | null = null;
	searchResults: Array<VAutoComplete> = [];
	professionGroupCache: Array<ProfessionGroup> = [];
	loading = false;
	errorMessages: Array<string> = [];
	lemmaRowTranslations = lemmaRowTranslations;

	@Watch("selected", { immediate: true, deep: false })
	setLocalSelected() {
		if (this.selected === null) {
			return;
		}
		this.professionGroupCache.push(this.selected);
		this.localSelected = this.selected.name;
	}

	@Watch("localSelected", { immediate: false, deep: true })
	emitSelection() {
		const localSelected = this.findProfessionGroup();

		if (localSelected === undefined) {
			console.error({
				message: "Could not find professionGroup AutoComplete Result from search term.",
				localSelected: this.localSelected,
				searchResults: this.searchResults,
				searchTerm: this.searchTerm,
			});
			return;
		}

		if (this.selected !== null && localSelected.id === this.selected.id) {
			return;
		}

		this.$emit("input", localSelected);
	}

	@Watch("searchTerm", { immediate: false, deep: false })
	populateSearchResults() {
		if (!this.searchTerm) {
			return;
		}
		if (this.searchTerm === this.localSelected) {
			return;
		}
		const url = new URL(`${OpenAPI.BASE}/research/api/v1/autocompletes/professiongroup/`);
		url.searchParams.set("q", this.searchTerm);
		this.loading = true;
		const fetching = fetch(url.toString());
		fetching.catch((reason) => {
			this.errorMessages.push(`Ergebnisse konnten nicht geladen werden: ${reason}`);
			console.error({ message: "Could not load profession group auto complete", reason });
			this.loading = false;
		});
		fetching.then((response: Response) => {
			this.errorMessages = [];
			response.json().then((data: ServerAutoCompleteResultSet) => {
				this.loading = false;
				this.searchResults = data.results.map(convertServerAutoCompleteResultToVAutoComplete);
				this.professionGroupCache = this.professionGroupCache.concat(
					data.results.map(convertServerAutoCompleteResultProfessionGroup),
				);
			});
		});
	}

	findProfessionGroup(): ProfessionGroup | undefined {
		return this.professionGroupCache.find(
			(professionGroup) => professionGroup.name === this.localSelected,
		);
	}
}
</script>

<template>
	<div class="outer profession-group">
		<!-- @vue-expect-error -->
		<v-autocomplete
			v-model="localSelected"
			:loading="loading"
			:items="searchResults"
			:search-input.sync="searchTerm"
			:error-messages="errorMessages"
			cache-items
			:label="lemmaRowTranslations.professionGroup.de"
			no-data-text="Bitte geben Sie einen Suchbegriff ein"
		></v-autocomplete>
	</div>
</template>
