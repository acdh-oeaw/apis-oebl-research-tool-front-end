<script lang="ts" setup>
import { isNonNullable } from "@acdh-oeaw/lib";
import type Vue from "vue";
import { computed, onMounted, onScopeDispose, ref, watch } from "vue";
import { useRouter } from "vue-router/composables";

import LemmaDetails from "@/features/lemmata/details/lemma-details.vue";
import { useVuetify } from "@/lib/use-vuetify";
import store from "@/store";
import { type SearchItem } from "@/store/search";
import { type LemmaRow } from "@/types/lemma";

const router = useRouter();
const vuetify = useVuetify();

const isVisible = computed({
	get() {
		return store.showSearchDialog;
	},
	set(isVisible) {
		store.showSearchDialog = isVisible;
	},
});

function onKeyDown(event: KeyboardEvent) {
	if ((event.ctrlKey || event.metaKey) && event.key === "f") {
		isVisible.value = true;
		event.preventDefault();
		event.stopPropagation();
	}
}

onMounted(() => {
	window.addEventListener("keydown", onKeyDown);
});

onScopeDispose(() => {
	window.removeEventListener("keydown", onKeyDown);
});

const input = ref<HTMLInputElement | null>(null);
const searchText = ref("");

function onInput(_event: Event) {
	selectedResultIndex.value = 0;

	const element = list.value?.$el;
	if (element) {
		element.scrollTop = 0;
	}
}

function onEscape() {
	if (searchText.value !== "") {
		searchText.value = "";
	}
}

watch(isVisible, (isVisible) => {
	if (isVisible) {
		/** Wait for dialog. */
		setTimeout(() => {
			input.value?.focus();
			input.value?.select();
		}, 0);
	}
});

function isMatch(lemma: LemmaRow, searchTerms: Array<string>) {
	const searchIndex = [
		lemma.firstName,
		lemma.lastName,
		lemma.dateOfBirth,
		lemma.dateOfDeath,
		...lemma.alternativeNames.flatMap((name) => [name.firstName, name.lastName]),
		...lemma.gnd,
		Object.values(lemma.columns_user),
	]
		.filter(isNonNullable)
		.join("|||")
		.toLowerCase();

	return searchTerms.every((searchTerm) => searchIndex.includes(searchTerm));
}

const list = ref<Vue | null>(null);
const maxResults = 40;
const results = computed(() => {
	if (searchText.value === "") {
		return store.search.recentSearchItems;
	}

	const searchTerms = searchText.value.split(/\s/).map((term) => term.toLocaleLowerCase());

	const foundItems: Array<SearchItem> = [];

	for (const lemma of store.lemma.allLemmas) {
		if (isMatch(lemma, searchTerms)) {
			foundItems.push({ type: "lemma", item: lemma });
		}

		if (foundItems.length > maxResults) {
			break;
		}
	}

	return foundItems;
});
const selectedResultIndex = ref(0);
const selectedLemma = computed(() => {
	return results.value[selectedResultIndex.value] || null;
});

function onSelectResult(direction: "down" | "up") {
	if (direction === "up") {
		selectedResultIndex.value = Math.max(selectedResultIndex.value - 1, 0);
	} else {
		selectedResultIndex.value = Math.min(selectedResultIndex.value + 1, results.value.length - 1);
	}

	const modifier = direction === "up" ? -1 : 1;
	list.value?.$el.scrollBy({ top: 50 * modifier, behavior: "smooth" });
}

function onOpenSelectedResult() {
	if (selectedLemma.value == null) return;

	isVisible.value = false;

	const { item } = selectedLemma.value;

	store.lemma.selectedLemmas = [item];
	store.search.addRecentSearchItem(selectedLemma.value);

	if (item.list != null) {
		router.push({ path: `/lemmata/list/${item.list.id}`, query: { focus: String(item.id) } });
	} else {
		router.push({ path: "/lemmata", query: { focus: String(item.id) } });
	}
}

function onUpdateLemma(updatedLemma: Partial<LemmaRow>) {
	if (selectedLemma.value != null) {
		store.lemma.updateLemmas([selectedLemma.value.item], updatedLemma);
	}
}
</script>

<template>
	<VDialog
		v-model="isVisible"
		content-class="elevation-0"
		:max-width="1000"
		overlay-color="black"
		:overlay-opacity="vuetify.theme.dark ? '.8' : '.5'"
		transition="fade-transition"
	>
		<VCard class="pa-0 rounded-lg" color="transparent" flat>
			<VCardTitle class="pa-0 background rounded-tl-lg rounded-tr-lg d-flex flex-nowrap">
				<VIcon style="opacity: 50%" class="ml-3" large>mdi-magnify</VIcon>
				<!-- FIXME: a11y -->
				<!-- This should be a combobox. -->
				<input
					ref="input"
					v-model="searchText"
					aria-label="Suche"
					class="pl-2 py-4 rounded-lg global-search"
					placeholder="Suchen..."
					type="text"
					@keydown.down.prevent="onSelectResult('down')"
					@keydown.up.prevent="onSelectResult('up')"
					@keydown.esc.capture.prevent.stop="onEscape"
					@keydown.enter.prevent="onOpenSelectedResult"
					@input="onInput"
				/>
			</VCardTitle>

			<VCardText
				class="overflow-hidden pa-0 relative"
				style="height: 450px; background: transparent"
			>
				<VDivider />

				<div class="d-flex flex-row rounded-bl-lg rounded-br-lg background darken-2 fill-height">
					<VList
						ref="list"
						class="overflow-y-auto fill-height pa-0"
						color="background darken-2"
						dense
						style="width: 60%"
					>
						<VSubheader
							class="sticky px-2 ma-0"
							style="z-index: 1; background: var(--v-background-darken2)"
						>
							{{ searchText === "" ? "Zuletzt gesucht" : "Lemmata" }}
						</VSubheader>

						<VListItem
							v-for="(result, index) of results"
							:key="index"
							:input-value="index === selectedResultIndex"
							@click="selectedResultIndex = index"
						>
							<VListItemAvatar width="15">
								<span v-if="result.item.selected === true" style="color: var(--v-primary-base)">
									★
								</span>
								<span v-else style="opacity: 50%">☆</span>
							</VListItemAvatar>

							<VListItemContent>
								<VListItemTitle>
									{{ result.item.firstName }} {{ result.item.lastName }}
								</VListItemTitle>
								<VListItemSubtitle v-if="result.item.dateOfBirth">
									{{
										[result.item.dateOfBirth, result.item.dateOfDeath]
											.filter(isNonNullable)
											.join(" – ")
									}}
								</VListItemSubtitle>
							</VListItemContent>

							<VListItemActionText style="overflow: hidden; max-width: 50%; white-space: nowrap">
								<div v-if="result.item.list" class="text-right font-weight-bold">
									<VIcon x-small>mdi-format-list-bulleted</VIcon>
									{{ result.item.list.title }}
								</div>
							</VListItemActionText>
						</VListItem>
					</VList>

					<div style="width: 40%" class="background">
						<LemmaDetails
							v-if="selectedLemma != null"
							:show-toggle-side-bar-button="false"
							:value="selectedLemma.item"
							@update="onUpdateLemma"
						/>
					</div>
				</div>
			</VCardText>
		</VCard>
	</VDialog>
</template>

<style>
.theme--dark .global-search {
	color: hsl(0deg 0% 100%);
}
</style>

<style scoped>
.global-search {
	width: 100%;
	outline: 0;
	font-size: 1.7em;
}
</style>
