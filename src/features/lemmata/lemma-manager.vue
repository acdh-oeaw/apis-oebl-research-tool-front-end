<script lang="ts" setup>
import { get, last, orderBy } from "lodash";
import { v4 as uuid } from "uuid";
import type Vue from "vue";
import { computed, onMounted, onScopeDispose, ref, watch } from "vue";

import ThemeToggle from "@/features/common/theme-toggle.vue";
import LemmaDetails from "@/features/lemmata/details/lemma-details.vue";
import DragImage from "@/features/lemmata/drag-image.vue";
import LemmaAdd from "@/features/lemmata/lemma-add.vue";
import LobidPreviewCard from "@/features/lemmata/lobid-preview-card.vue";
import ResizableDrawer from "@/features/ui/resizable-drawer.vue";
import VirtualTable from "@/features/ui/virtual-table.vue";
import store from "@/store";
import confirm from "@/store/confirm";
import prompt from "@/store/prompt";
import { type LemmaColumn, type LemmaFilterItem, type LemmaRow } from "@/types/lemma";

const LemmaImportManager = () =>
	import("@/views/LemmaManager/LemmaImporter/LemmaImportManager.vue");

const props = defineProps<{
	// FIXME: where is lemmaListId set?
	lemmaListId: number | null;
	highlightId: number | null;
}>();

const toolbarMinHeight = 80;
const toolbarPaddingY = 15;

const scrollToRow = ref<number | null>(null);
const tableHeight = ref(0);
const showAddLemmaDialog = ref(false);

const filterItems = ref<Array<LemmaFilterItem>>([]);

const dragGhost = ref<Vue | null>(null);

const previewPopupCoords = ref<[number, number]>([0, 0]);
const lobidPreviewGnds = ref<Array<string>>([]);

const filteredLemmas = computed(() => store.lemma.lemmas);

const importerOpened = ref(false);

function onKeyDown(e: KeyboardEvent) {
	if (e.key.toLowerCase() === "enter") {
		e.preventDefault();
		if (store.lemma.showSideBar === false) {
			store.lemma.showSideBar = true;
		}
	}
}

const selectedRows = computed({
	get() {
		return store.lemma.selectedLemmas;
	},
	set(lemmata) {
		store.lemma.selectedLemmas = lemmata;
	},
});

const newLemmas = computed(() => {
	if (props.lemmaListId != null) {
		return Object.values(store.lemma.newLemmasInUserList[props.lemmaListId] || {}).map(
			(e) => e.item,
		);
	}

	return [];
});

watch(
	() => props.lemmaListId,
	(lemmaListId) => {
		store.lemma.selectedLemmaListId = lemmaListId;
	},
);

async function saveFilter() {
	const name = await prompt.prompt("Filter speichern", { placeholder: "Filtername eingeben…" });
	if (name !== null) {
		store.lemma.storedLemmaFilters = [
			...store.lemma.storedLemmaFilters,
			{
				name: name,
				id: uuid(),
				filterItems: store.lemma.currentFilters,
			},
		];
	}
}

watch(
	() => props.highlightId,
	(highlightId) => {
		if (highlightId != null) {
			store.lemma.setFilter({});

			const index = sortedFilteredLemmas.value.findIndex((l) => l.id === highlightId);
			scrollToRow.value = index > -1 ? index : null;
		}
	},
	{ immediate: true },
);

const selectedList = computed(() => {
	if (props.lemmaListId != null) {
		return store.lemma.getListById(props.lemmaListId) || null;
	} else {
		return null;
	}
});

const columns = computed({
	get() {
		return store.lemma.columns;
	},
	set(columns) {
		store.lemma.columns = columns;
	},
});

function openWikipedia(item: LemmaRow) {
	const link = get(item, "columns_scrape.wikidata.wiki_de");
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (link !== undefined) {
		window.open(link);
	}
}

function updateColumn(c: LemmaColumn, u: Partial<LemmaColumn>) {
	columns.value = columns.value.map((cl) => {
		return cl.value === c.value ? { ...cl, ...u } : cl;
	});
}

function cancelUpdateListName(event: KeyboardEvent) {
	if (props.lemmaListId !== null && event.target instanceof HTMLElement) {
		event.target.textContent = store.lemma.getListById(props.lemmaListId)?.title || "Listenname";
		event.target.blur();
	}
}

function updateListName(event: Event) {
	if (
		event.currentTarget instanceof HTMLElement &&
		props.lemmaListId !== null &&
		event.currentTarget.textContent !== null
	) {
		store.lemma.updateList(props.lemmaListId, { title: event.currentTarget.textContent });
		event.currentTarget.scrollLeft = 0;
	}
}

function updateLemmaFromTable(lemma: LemmaRow, tableUpdate: Partial<LemmaRow>) {
	updateLemma(lemma, tableUpdate);
}

async function updateLemma(l: LemmaRow, u: Partial<LemmaRow>) {
	// update selected lemma (cached)
	if (selectedRows.value.length > 0 && selectedRows.value[0]!.id === l.id) {
		selectedRows.value[0] = { ...l, ...u };
	}

	// update store, server and local storage
	await store.lemma.updateLemmas([l], u);
}

async function deleteList(id: number | null) {
	if (id !== null) {
		const list = store.lemma.getListById(id);
		if (list !== undefined) {
			if (
				await confirm.confirm(
					`Wollen Sie die Liste ”${list.title}” wirklich löschen?\nDie Lemmata in dieser Liste werden nicht gelöscht, sondern bleiben in der Lemmabibliothek.`,
					{ icon: "mdi-delete-outline" },
				)
			) {
				await store.lemma.deleteLemmaList(id);
			}
		}
	}
}

function updateTableHeight() {
	tableHeight.value = getTableHeight();
}

watch(() => store.settings.showLemmaFilter, updateTableHeight, { immediate: true });

onMounted(() => {
	tableHeight.value = getTableHeight();
	window.addEventListener("resize", updateTableHeight);
});

onScopeDispose(() => {
	window.removeEventListener("resize", updateTableHeight);
});

function toggleDrawer() {
	store.settings = {
		...store.settings,
		showNavDrawer: !store.settings.showNavDrawer,
	};
}

const toolbarHeight = computed(() => {
	return store.settings.showLemmaFilter ? 120 : 80;
});

function getTableHeight() {
	return window.innerHeight - toolbarHeight.value;
}

function sortLemmas(c: LemmaColumn) {
	const sort = c.sort === null || c.sort === undefined || c.sort === "desc" ? "asc" : "desc";
	columns.value = columns.value.map((cO) => ({
		...cO,
		sort: cO.value === c.value ? sort : undefined,
	}));
}

const sortedFilteredLemmas = computed(() => {
	const sortByColumn = columns.value.find((c) => c.sort !== undefined && c.sort !== null);
	if (sortByColumn !== undefined) {
		return orderBy(store.lemma.lemmas, sortByColumn.value, sortByColumn.sort || "asc");
	} else {
		return store.lemma.lemmas;
	}
});

function addLemma(l: LemmaRow, listId: number) {
	showAddLemmaDialog.value = false;
	store.lemma.addLemma(l, listId);
}

async function removeLemmasFromList(l: Array<LemmaRow>) {
	await store.lemma.updateLemmas(l, { list: null as any });
}

async function removeLemmasFromIssue(_l: Array<LemmaRow>) {
	// FIXME:
	// backend method missing
	// await this.store.issue.deleteLemma(l)
}

async function deleteSelectedLemmas(e: KeyboardEvent) {
	const indexOfLastSelected = sortedFilteredLemmas.value.findIndex(
		(l) => last(selectedRows.value)?.id === l.id,
	);

	// A list is selected
	// remove from list.
	if (props.lemmaListId !== null && !(e.ctrlKey || e.metaKey)) {
		const msg = `Wollen Sie wirklich ${selectedRows.value.length} Lemma(ta) aus dieser Liste entfernen?`;

		if (await confirm.confirm(msg)) {
			removeLemmasFromList(selectedRows.value);

			// select the next row after the deleted ones
			if (indexOfLastSelected > -1) {
				selectedRows.value = [sortedFilteredLemmas.value[indexOfLastSelected]!];
			}
		}
		// An issue is selected
		// remove from issue
	} else if (store.lemma.selectedLemmaIssueId != null) {
		const msg = `Wollen Sie wirklich ${selectedRows.value.length} Lemma(ta) aus dieser Abgabe entfernen?`;

		if (await confirm.confirm(msg)) {
			removeLemmasFromIssue(selectedRows.value);
			// select the next row after the deleted ones
			if (indexOfLastSelected > -1) {
				selectedRows.value = [sortedFilteredLemmas.value[indexOfLastSelected]!];
			}
		}
	} else {
		// No issue or list is selected
		// => actually delete it
		const msg = `Wollen Sie wirklich ${selectedRows.value.length} Lemma(ta) in den Papierkorb legen? Dies kann später rückgängig gemacht werden.`;

		if (await confirm.confirm(msg)) {
			await store.lemma.deleteLemma(selectedRows.value.map((r) => r.id));
			// select the next row after the deleted ones
			if (indexOfLastSelected > -1) {
				selectedRows.value = [sortedFilteredLemmas.value[indexOfLastSelected]!];
			}
		}
	}
}

watch(
	() => store.lemma.selectedLemmaFilterId,
	(id) => {
		if (id !== null) {
			const l = store.lemma.getStoredLemmaFilterById(id);
			if (l !== undefined) {
				store.lemma.currentFilters = l.filterItems;
			}
		} else {
			store.lemma.setFilter({});
		}
	},
	{ immediate: true },
);

async function deleteFilter(id: string | null) {
	if (id !== null) {
		store.lemma.deleteStoredLemmaFilter(id);
	}
}

function updateLemmaFilterName(id: string, name: string) {
	store.lemma.updateStoredLemmaFilter(id, { name });
}

function openFileDialog(cb: (f: File) => unknown) {
	const input: HTMLInputElement = document.createElement("input");

	input.type = "file";
	input.accept =
		"text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

	input.addEventListener("change", () => {
		if (input.files !== null && input.files[0] !== undefined) {
			cb(input.files[0]);
		}
		input.value = "";
	});

	input.click();
}

function onClickCell(item: LemmaRow, e: MouseEvent, prop: keyof LemmaRow, _index: number) {
	if (prop === "selected") {
		updateLemma(item, { selected: !item.selected });
	}
}

// PREVIEW
async function onHoverGndCell(e: MouseEvent, gnd: Array<string>) {
	if (e.target instanceof HTMLElement) {
		const target = e.target;
		const timer = setTimeout(() => {
			lobidPreviewGnds.value = gnd;
			previewPopupCoords.value = [
				target.getBoundingClientRect().left,
				target.getBoundingClientRect().bottom,
			];
		}, 500);

		e.target.addEventListener("mouseout", function onMouseOut() {
			clearTimeout(timer);
			target.removeEventListener("mouseout", onMouseOut);
		});
	}
}

function dragListener(item: LemmaRow, ev: DragEvent) {
	let dragImage: HTMLElement | null = null;

	if (selectedRows.value.findIndex((r) => r.id === item.id) === -1) {
		selectedRows.value.push(item);
	}

	if (ev.dataTransfer) {
		dragImage = (dragGhost.value as Vue).$el as HTMLElement | null;
		ev.dataTransfer.effectAllowed = "move";
		ev.dataTransfer.setData("text/plain", JSON.stringify(selectedRows.value));

		if (dragImage != null) {
			ev.dataTransfer.setDragImage(dragImage, 0, 0);
		}
	}
}
</script>

<template>
	<!-- FIXME: a11y -->
	<!-- eslint-disable vuejs-accessibility/no-static-element-interactions -->
	<div ref="container" tabindex="-1" class="fill-height" @keydown="onKeyDown">
		<!-- LOBID HOVER PREVIEW -->
		<VMenu
			v-if="lobidPreviewGnds.length > 0"
			:value="lobidPreviewGnds.length > 0"
			:position-x="previewPopupCoords[0]"
			:position-y="previewPopupCoords[1]"
			:close-on-content-click="false"
			absolute
			offset-y
			offset-x
			content-class="soft-shadow"
			@input="lobidPreviewGnds = []"
		>
			<VCard color="background lighten-1" class="rounded-lg pr-2 pb-2 pl-2 pt-0">
				<VCardText class="pb-3 pl-0 pt-4 pr-0">
					<LobidPreviewCard :limit="3" :gnd="lobidPreviewGnds" />
				</VCardText>
			</VCard>
		</VMenu>

		<!-- GHOST IMAGE WHEN DRAGGING -->
		<DragImage ref="dragGhost" :max-items="5" :rows="selectedRows" />

		<!-- ADD LEMMA -->
		<VDialog
			:value="showAddLemmaDialog === true"
			scrollable
			content-class="align-self-start"
			max-width="1000px"
			@input="showAddLemmaDialog = $event"
		>
			<LemmaAdd
				v-if="showAddLemmaDialog"
				color="background"
				@confirm="addLemma"
				@cancel="showAddLemmaDialog = false"
			/>
		</VDialog>

		<!-- IMPORT LEMMAS -->
		<VDialog v-model="importerOpened" hide-overlay fullscreen>
			<LemmaImportManager />
		</VDialog>

		<VAppBar
			data-deskgap-drag="true"
			app
			height="79"
			:style="{ transition: 'none', padding: `${toolbarPaddingY}px 0` }"
			color="background darken-1"
			flat
		>
			<div class="d-flex fill-width flex-row align-stretch align-self-start">
				<VBtn
					v-if="!store.settings.showNavDrawer"
					style="margin-top: -7px"
					tile
					class="rounded-lg"
					icon
					@click="toggleDrawer"
				>
					<VIcon>mdi-dock-left</VIcon>
				</VBtn>
				<VFlex shrink align-self-start class="mr-5 lemma-view-title">
					<!-- FIXME: a11y why som many h1 -->
					<h1
						v-if="
							store.lemma.selectedLemmaFilterId === null &&
							store.lemma.selectedLemmaIssueId === null &&
							lemmaListId === null
						"
					>
						Lemmabibliothek
					</h1>
					<h1 v-else-if="store.lemma.selectedLemmaIssueId !== null">
						<!-- @vue-expect-error -->
						{{ store.issue.getIssueById(store.lemma.selectedLemmaIssueId).name }}
					</h1>
					<h1
						v-else-if="selectedList !== null"
						contenteditable="true"
						@blur="updateListName"
						@keyup.enter.prevent.stop="$event.target.blur()"
						@keyup.esc.prevent.stop="cancelUpdateListName"
						v-text="selectedList.title"
					/>
					<h1
						v-else-if="store.lemma.selectedLemmaFilterId !== null"
						contenteditable="true"
						@blur="
							updateLemmaFilterName(store.lemma.selectedLemmaFilterId, $event.target.textContent)
						"
						@keyup.enter.prevent.stop="$event.target.blur()"
						v-text="store.lemma.getStoredLemmaFilterById(store.lemma.selectedLemmaFilterId).name"
					/>
					<span class="caption text-no-wrap">
						<VBtn
							v-if="newLemmas.length > 0"
							style="margin-top: -2px; letter-spacing: 0.1em"
							rounded
							elevation="0"
							color="primary"
							class="mr-1 font-weight-bold"
							x-small
						>
							{{ newLemmas.length }} NEU
						</VBtn>
						<span style="opacity: 70%">
							{{ filteredLemmas.length }} Ergebnisse. {{ selectedRows.length }} ausgewählt
						</span>
					</span>
				</VFlex>
				<VSpacer />
				<VFlex shrink align-self-start class="pl-0 ml-0 pr-0" style="margin-top: -5px">
					<VBtn tile class="rounded-lg" icon @click="store.showSearchDialog = true">
						<VIcon>mdi-magnify</VIcon>
					</VBtn>
				</VFlex>
				<VFlex shrink align-self-start class="pl-0 ml-0 pr-0" style="margin-top: -5px">
					<VBtn
						tile
						:color="store.settings.showLemmaFilter ? 'primary' : undefined"
						class="rounded-lg"
						icon
						@click="
							store.settings = {
								...store.settings,
								showLemmaFilter: !store.settings.showLemmaFilter,
							}
						"
					>
						<VIcon>mdi-filter-variant</VIcon>
					</VBtn>
				</VFlex>
				<VFlex shrink align-self-start class="pr-0" style="margin-top: -5px">
					<VMenu
						min-width="150"
						offset-y
						left
						content-class="soft-shadow scrollable background rounded-lg"
					>
						<template #activator="{ on, props }">
							<VBtn v-bind="props" tile class="rounded-lg" icon v-on="on">
								<VIcon>mdi-dots-horizontal-circle-outline</VIcon>
							</VBtn>
						</template>
						<VList color="background" class="elevation-0 rounded-lg text-body-2 x-dense" dense nav>
							<VListItem dense @click="showAddLemmaDialog = true">
								<VListItemAvatar size="15">
									<VIcon small>mdi-shape-square-plus</VIcon>
								</VListItemAvatar>
								<VListItemContent>Lemma hinzufügen…</VListItemContent>
							</VListItem>
							<VListItem dense @click="importerOpened = true">
								<VListItemAvatar size="15">
									<VIcon small>mdi-database-import-outline</VIcon>
								</VListItemAvatar>
								<VListItemContent>Excel oder CSV importieren…</VListItemContent>
							</VListItem>
							<VListItem v-if="lemmaListId !== null" @click="deleteList(lemmaListId)">
								<VListItemAvatar size="15">
									<VIcon small>mdi-delete-outline</VIcon>
								</VListItemAvatar>
								<VListItemContent>Liste löschen</VListItemContent>
							</VListItem>
							<VListItem
								v-if="
									store.lemma.selectedLemmaFilterId === null &&
									Object.keys(store.lemma.currentFilters).length > 0
								"
								dense
								@click="saveFilter"
							>
								<VListItemAvatar size="15">
									<VIcon small>mdi-card-search-outline</VIcon>
								</VListItemAvatar>
								<VListItemContent>Abfrage sichern…</VListItemContent>
							</VListItem>
							<VListItem
								v-else-if="store.lemma.selectedLemmaFilterId !== null"
								dense
								@click="deleteFilter(store.lemma.selectedLemmaFilterId)"
							>
								<VListItemAvatar size="15">
									<VIcon small>mdi-delete-outline</VIcon>
								</VListItemAvatar>
								<VListItemContent>Diese Abfrage löschen</VListItemContent>
							</VListItem>
						</VList>
						<VDivider />
						<div class="caption muted px-3 pt-2">Spalten anzeigen</div>
						<VList
							style="overflow: scroll; max-height: 50vh"
							color="background"
							class="elevation-0 rounded-lg text-body-2 mb-0 pb-0 x-dense"
							dense
							nav
						>
							<VListItem
								v-for="column in columns"
								:key="column.value"
								dense
								@click.prevent.stop="updateColumn(column, { show: !column.show })"
							>
								<VListItemAvatar size="15">
									<VIcon v-if="column.show" small>mdi-check</VIcon>
								</VListItemAvatar>
								<VListItemContent>
									{{ column.name }}
								</VListItemContent>
							</VListItem>
						</VList>
						<VDivider class="mt-0 pt-0" />
						<div class="caption muted px-3 pt-2">Farbschema</div>
						<ThemeToggle class="mx-2 mb-2" />
						<VDivider />
						<VList color="background" class="elevation-0 rounded-lg text-body-2 x-dense" dense nav>
							<VListItem dense @click="() => store.logOut()">
								<VListItemAvatar size="15">
									<VIcon small>mdi-power</VIcon>
								</VListItemAvatar>
								<VListItemContent>Ausloggen</VListItemContent>
							</VListItem>
						</VList>
					</VMenu>
				</VFlex>
				<VFlex
					v-if="!store.lemma.showSideBar"
					shrink
					align-self-start
					class="pl-0 ml-0 pr-3"
					style="margin-top: -5px"
				>
					<VBtn
						v-if="!store.lemma.showSideBar"
						tile
						class="rounded-lg"
						icon
						@click="store.lemma.showSideBar = !store.lemma.showSideBar"
					>
						<VIcon>mdi-dock-right</VIcon>
					</VBtn>
				</VFlex>
			</div>
		</VAppBar>

		<ResizableDrawer
			color="background darken-1"
			:initial-width="store.settings.drawerRightWidth"
			:min-width="300"
			:right="true"
			:visible="store.lemma.showSideBar"
			@update:width="store.settings = { ...store.settings, drawerRightWidth: $event }"
		>
			<div v-if="selectedRows.length === 0" class="fill-height justify-center d-flex align-center">
				Kein Lemma ausgewählt
			</div>
			<div
				v-else-if="selectedRows.length > 1"
				class="fill-height justify-center d-flex align-center"
			>
				{{ selectedRows.length }} Lemmata ausgewählt
			</div>
			<LemmaDetails
				v-else
				:value="selectedRows[0]"
				@close="store.lemma.showSideBar = false"
				@update="
					updateLemma(
						// @ts-expect-error
						selectedRows[0],
						$event,
					)
				"
			/>
		</ResizableDrawer>

		<VMain class="fill-width fill-height transition-none">
			<!-- @vue-expect-error -->
			<VirtualTable
				ref="vTable"
				class="virtual-table text-body-3"
				:show-filter="store.settings.showLemmaFilter"
				:columns="columns"
				:sortable-columns="true"
				:row-height="38"
				:scroll-to-row="scrollToRow"
				:editable="true"
				:height="tableHeight"
				:data="sortedFilteredLemmas"
				:selected-rows="selectedRows"
				header-color="background darken-2"
				@keyup.delete="deleteSelectedLemmas"
				@drag:row="dragListener"
				@click:cell="onClickCell"
				@click:header="sortLemmas"
				@dblclick:row="store.lemma.showSideBar = true"
				@dblclick:cell="store.lemma.showSideBar = true"
				@update:selection="selectedRows = $event"
				@update:item="updateLemmaFromTable"
				@update:filter="(f) => store.lemma.setFilter(f)"
				@update:columns="columns = $event"
			>
				<template #cell="{ item, column, value }">
					<template v-if="item[column.value] === 'Not available'"></template>
					<!-- the star column -->
					<template v-else-if="column.value === 'selected'">
						<span v-if="value === true" style="color: var(--v-primary-base)">★</span>
						<span v-if="value === false" style="opacity: 70%">☆</span>
					</template>
					<!-- the gnd column -->
					<template v-else-if="column.value === 'gnd'">
						<span v-if="item.gnd.length === 0" style="opacity: 50%">⊘</span>
						<!-- FIXME: a11y -->
						<!-- eslint-disable vuejs-accessibility/mouse-events-have-key-events -->
						<span
							v-else-if="item.gnd.length > 0"
							style="white-space: nowrap"
							@mouseover="onHoverGndCell($event, item.gnd)"
						>
							<span v-if="item.gnd.length > 1" class="badge primary" v-text="item.gnd.length" />
							{{ item.gnd[0] }}
						</span>
						<!-- eslint-enable vuejs-accessibility/mouse-events-have-key-events -->
					</template>
					<a
						v-else-if="value && column.value === 'loc'"
						target="_blank"
						:href="'https://id.loc.gov/authorities/names/' + value"
						class="table-external-link background lighten-2"
					>
						{{ value }}
					</a>
					<a
						v-else-if="value && column.value === 'viaf_id'"
						target="_blank"
						:href="'https://viaf.org/viaf/' + value"
						class="table-external-link background lighten-2"
					>
						{{ value }}
					</a>
					<!-- FIXME: a11y -->
					<!-- eslint-disable vuejs-accessibility/click-events-have-key-events -->
					<a
						v-else-if="value && column.value === 'wiki_edits'"
						class="table-external-link background lighten-2"
						@click.prevent="openWikipedia(item)"
					>
						{{ value }}
					</a>
					<!-- eslint-enable vuejs-accessibility/click-events-have-key-events -->
					<!-- all others -->
					<template v-else-if="value">
						{{ item[column.value] }}
					</template>
					<span v-else-if="!value || value.trim() === '?'" class="muted">⊘</span>
				</template>
			</VirtualTable>
		</VMain>
	</div>
	<!-- eslint-enable vuejs-accessibility/no-static-element-interactions -->
</template>

<style>
.input-no-stroke .v-text-field > .v-input__control > .v-input__slot::after,
.v-text-field > .v-input__control > .v-input__slot::before {
	display: none;
}

.virtual-table {
	padding-right: 0.75em;
	padding-left: 0.75em;
	border: 0 !important;
	background: var(--v-background-darken1);
	outline: 0 !important;
}

.virtual-table .table-row {
	border-radius: 5px;
}

.virtual-table .table-row.selected {
	background-color: hsl(0deg 0% 0%) !important;
}

:focus .table-row.selected {
	background-color: var(--v-primary-darken1) !important;
	color: hsl(0deg 0% 100%);
}

.theme--light .virtual-table .table-row.odd {
	background: var(--v-background-darken2);
}

.virtual-table .table-cell,
.virtual-table .header-cell {
	padding: 0 5px;
}
</style>

<style scoped>
.table-external-link {
	display: inline-block;
	padding: 3px 5px;
	border-radius: 5px;
	color: var(--v-textcolor-base) !important;
	font-size: 90%;
	text-decoration: none;
}

.lemma-view-title {
	min-width: 150px;
	max-width: 250px;
}

[contenteditable="true"]:hover {
	border-radius: 3px;
	box-shadow: inset 0 0 0 1px var(--v-secondary-lighten5);
}
</style>
