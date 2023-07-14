<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import ZoteroSearch from "@/features/lemmata/details/zotero-search.vue";
import { convertZoteroItemToView, ZoteroLemmaManagmentController } from "@/service/zotero";
import { type ZoteroItem } from "@/types/zotero";

const props = withDefaults(
	defineProps<{
		zoteroKeysFromServer: Array<string>;
		lemmaName: string;
		listName: string;
	}>(),
	{
		zoteroKeysFromServer: () => [],
	},
);

const emit = defineEmits<{
	(event: "submit", value: Array<string>): void;
}>();

const detailedView = ref(true);
const loading = ref(false);
const updating = ref(false);

const zoteroItems = ref<Array<ZoteroItem>>([]);

const _zoteroLemmaManagmentController = new ZoteroLemmaManagmentController();

watch(
	() => props.zoteroKeysFromServer,
	() => {
		loading.value = true;

		_zoteroLemmaManagmentController
			.load(props.zoteroKeysFromServer)
			.then((zoteroLemmaManagmentController) => {
				loading.value = false;

				updating.value = true;

				zoteroItems.value = zoteroLemmaManagmentController.zoteroItems;

				zoteroLemmaManagmentController.update().then((zoteroLemmaManagmentController) => {
					updating.value = false;

					zoteroItems.value = zoteroLemmaManagmentController.zoteroItems;
				});
			});
	},
	{ immediate: true },
);

function addNewZoteroItem(zoteroItem: ZoteroItem) {
	// Early return if zoteroItem aleady in component
	if (zoteroItems.value.find((zoteroArrayItem) => zoteroArrayItem.key === zoteroItem.key) != null) {
		return;
	}

	// Keep track of items in component
	zoteroItems.value.push(zoteroItem);
	// Add items to cache:
	_zoteroLemmaManagmentController.add([zoteroItem]);
	// Notify parent component of new zoteroItems
	emitZoteroItems();
}

function removeZoteroItem(zoteroKey: string) {
	zoteroItems.value = _zoteroLemmaManagmentController.remove(zoteroKey).zoteroItems;
	emitZoteroItems();
}

function emitZoteroItems() {
	emit(
		"submit",
		zoteroItems.value.map((item) => item.key),
	);
}

const zoteroItemsView = computed(() => {
	return zoteroItems.value.map(convertZoteroItemToView);
});
</script>

<template>
	<VCard class="transparent" flat>
		<VCardTitle class="zotero-list-title pb-0">
			{{ listName }} Lemma

			<span v-if="loading" class="loading-zotero">…</span>
			<span v-else class="zotero-results">{{ zoteroItems.length }}</span>
			<div class="add-more-zotero-items">
				<ZoteroSearch :exclude="zoteroItems" @submit="addNewZoteroItem($event)" />
			</div>
		</VCardTitle>

		<div v-if="detailedView" class="detailed-zotero-view">
			<VCardText class="pt-0 pl-2">
				<VList class="zotero-citation-list pt-0" dense>
					<VListItem v-for="(zoteroView, key) in zoteroItemsView" :key="key">
						{{ zoteroView.citation }}
						<VBtn :href="zoteroView.url" target="_blank" icon x-small class="pl-1">
							<VIcon x-small>mdi-open-in-new</VIcon>
						</VBtn>
						<VSpacer />
						<VBtn icon x-small class="rounded-lg" @click="removeZoteroItem(zoteroView.key)">
							<VIcon class="pl-6">mdi-minus-circle-outline</VIcon>
						</VBtn>
					</VListItem>
				</VList>
			</VCardText>
		</div>
	</VCard>
</template>

<style scoped>
.loading-zotero {
	margin: 0 1em;
}

.zotero-results {
	margin: 0;
	padding: 0;
}

.zotero-results::before {
	content: "(";
	margin-left: 1em;
}

.zotero-results::after {
	content: ")";
}

.zotero-list-title {
	font-weight: 500;
	font-size: 100%;
}
</style>
