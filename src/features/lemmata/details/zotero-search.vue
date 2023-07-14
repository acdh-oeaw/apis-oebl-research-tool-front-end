<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import zoteroStore from "@/service/zotero";
import { type ZoteroItem } from "@/types/zotero";

const props = defineProps<{
	exclude?: Array<ZoteroItem>
}>()

const emit = defineEmits<{
	(event: "submit", value: ZoteroItem): void
}>()

	const searchTerm = ref<string | null | undefined>("");
	const zoteroResults = ref<Array<ZoteroItem>>([]);
	const zoteroErrorMessages = ref<Array<string>>([]);
	const loading = ref(false);

	// function clearZoteroResults(): void {
	// 	zoteroResults.value = [];
	// }

	watch(searchTerm, (searchTerm) => {
		if (searchTerm == null) return;
		if (searchTerm.trim().length === 0) return;

		loading.value = true;

		zoteroStore
			.searchItem(searchTerm)
			.then((zoteroItems: Array<ZoteroItem>) => {
				loading.value = false;
				zoteroResults.value = zoteroItems;
				zoteroErrorMessages.value = [];
			})
			.catch((event) => {
				loading.value = false;
				zoteroResults.value = [];
				zoteroErrorMessages.value.push(event.message);
			});
	})

	const filteredAndFormattedZoteroResults = computed(() => {
		const exclude = props.exclude ?? []
		const exclude_keys = exclude.map((zoteroItem: ZoteroItem) => zoteroItem.key);

		const filteredResults = zoteroResults.value.filter(
			(zoteroItem: ZoteroItem) => !exclude_keys.includes(zoteroItem.key),
		);

		return filteredResults.map((zoteroItem) => {
			return {
				value: zoteroItem.key,
				text: `${zoteroItem.data.title}, ${zoteroItem.data.date ? zoteroItem.data.date : "o. J."}`,
			};
		});
	})

	function submitItem(zoteroKey: string) {
		const zoteroItem = zoteroResults.value.find((zoteroItem) => zoteroItem.key === zoteroKey);

		if (zoteroItem === undefined) {
			throw new Error(
				`Could not find selected zoteroItem with Key ${zoteroKey} from auto-complete in auto-complete list.`,
			);
		}

		emit("submit", zoteroItem);
	}
</script>

<template>
	<div class="zotero-search-container">
		<VAutocomplete
			:error-messages="zoteroErrorMessages"
			:items="filteredAndFormattedZoteroResults"
			:search-input.sync="searchTerm"
			label="Aus Zotero hinzufügen"
			:loading="loading"
			no-data-text="Bitte geben Sie einen Suchbegriff ein"
			@upddate:search-input="searchTerm = $event"
			@input="submitItem($event)"
		/>
	</div>
</template>
