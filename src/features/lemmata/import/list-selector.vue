<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import { ListManager } from "@/lib/lemmaimport/listmanagement";
import { type SelectedList } from "@/lib/lemmaimport/options";
import { type NewLemmaRow } from "@/types/lemma";

const listManager = ListManager.createObservableListManager();

/**
 * This components has 2 "hacks". I am sorry dear god of pethunia!
 */

const props = defineProps<{
	preloadedOptions: SelectedList;
	newLemmasRows: Array<NewLemmaRow>;
}>();

const emit = defineEmits<{
	(event: "data", value: any): void;
	(event: "options", value: SelectedList | null): void;
}>();

/**
 * SelectedList is undefined or a "List" object, but not nullable.
 *
 * > Note that if the initial value is undefined, the class property will not be reactive which means the changes for the properties will not be detected:
 * > [...]
 * > To avoid this, you can use null value or use data hook instead
 *
 * https://class-component.vuejs.org/guide/class-component.html#data
 */
// data(): { selectedList: SelectedList } {
// 	return {
// 		selectedList: undefined,
// 	};
// }

// Then typescript complains: "Property 'selectedList' does not exist on type 'ListSelector'.". Note I can not just change the type of selectedList
const selectedList = ref<SelectedList | null>(null);

const selectedListTitle = ref<string | null | undefined>(null);
const loadingList = ref(false);
const listCreationFailedMessage = ref<string | null>(null);

watch(selectedListTitle, () => {
	if (selectedListTitle.value == null) return;

	loadingList.value = true;
	listCreationFailedMessage.value = null;

	/**
	 * Apperently our own API service does not fail, when there is no internet connection or the server is down,
	 * and I am not going to refactor that, since my goal is to finish this feature.
	 *
	 * Instead doing this … dumb thing: Have fun!
	 *
	 */
	let couldBeAnError = true;

	const onFailure = (reason: any) => {
		if (!couldBeAnError) {
			return;
		}

		loadingList.value = false;
		listCreationFailedMessage.value = "Die Liste konnte leider nicht geladen werden.";

		console.error({ message: `Could not load list ${selectedListTitle.value}`, reason });
	};

	setTimeout(onFailure, 2000);

	listManager
		.getLemmaList(selectedListTitle.value)
		.then((lemmaList) => {
			couldBeAnError = false;
			selectedList.value = lemmaList;
			loadingList.value = false;
		})
		.catch(onFailure);
});

watch(
	() => props.preloadedOptions,
	() => {
		selectedList.value = props.preloadedOptions;
	},
	{ immediate: true, deep: true },
);

const updatedNewLemmaRows = computed(() => {
	return props.newLemmasRows.map((newLemmaRow) =>
		Object.assign(newLemmaRow, { list: selectedList.value }),
	);
});

watch(
	[selectedList, () => props.newLemmasRows],
	() => {
		emit("data", lemmasWithLists.value);
		emit("options", selectedList.value);
	},
	{ immediate: true, deep: true },
);

/**
 * https://vuetifyjs.com/en/api/v-combobox/#props-items
 */
const vuetifyItems = computed(() => {
	return listManager.lemmaLists.map((lemmaList) => {
		return {
			text: lemmaList.title,
			value: lemmaList.title,
		};
	});
});

const lemmasWithLists = computed(() => {
	return props.newLemmasRows.map((lemma) => Object.assign(lemma, { list: selectedList.value }));
});
</script>

<template>
	<div class="import-list-selector-container">
		<VContainer>
			<VRow class="import-list-selection">
				<VCol class="select-import-list">
					<VCombobox
						v-model="selectedListTitle"
						label="Eine Liste auswählen"
						:items="vuetifyItems"
						:return-object="false"
						clearable
					/>
				</VCol>
				<VCol class="selected-import-list">
					<div v-if="selectedList">"{{ selectedList.title }}" geladen</div>
					<div v-if="loadingList">
						<VProgressCircular />
					</div>
					<div v-if="listCreationFailedMessage">
						<VAlert type="error">{{ listCreationFailedMessage }}</VAlert>
					</div>
				</VCol>
			</VRow>

			<VRow class="select-import-submit">
				<VCol>
					<VBtn @click="$emit('submit')">Weiter</VBtn>
				</VCol>
			</VRow>
		</VContainer>
	</div>
</template>
