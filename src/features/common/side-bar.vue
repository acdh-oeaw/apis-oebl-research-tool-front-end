<script lang="ts" setup>
import { unique } from "@acdh-oeaw/lib";
import { computed, ref, watch } from "vue";

import { requestState } from "@/api/core/request";
import { type List as LemmaList, type List } from "@/api/models/List";
import LoadingSpinner from "@/features/ui/loading-spinner.vue";
import store from "@/store";
import confirm from "@/store/confirm";
import prompt from "@/store/prompt";
import { type WithId } from "@/types";
import { type LemmaRow } from "@/types/lemma";
import Badge from "@/views/lib/Badge.vue";
import TextField from "@/views/lib/TextField.vue";

const searchQuery = ref("");
const showLoader = ref(false);
const showIssues = ref(true);
const showMyLists = ref(true);
const showTeamLists = ref(true);
const showQueries = ref(true);

watch(
	() => requestState.isLoading,
	(isLoading) => {
		setTimeout(() => {
			if (requestState.isLoading === isLoading) {
				showLoader.value = isLoading;
			}
		}, 300);
	},
);

const filteredStoredLemmaFilters = computed(() => {
	if (searchQuery.value.trim() !== "") {
		return store.lemma.storedLemmaFilters.filter((l) =>
			l.name.toLocaleLowerCase().includes(searchQuery.value || ""),
		);
	} else {
		return store.lemma.storedLemmaFilters;
	}
});

const filteredLemmaLists = computed(() => {
	if (searchQuery.value.trim() !== "") {
		return store.lemma.lemmaLists.filter((l) =>
			l.title.toLocaleLowerCase().includes(searchQuery.value || ""),
		);
	} else {
		return store.lemma.lemmaLists;
	}
});

const filteredLemmaListsCurrentUser = computed(() => {
	return filteredLemmaLists.value.filter(
		(l) => l.editor != null && l.editor.userId === store.user.userProfile.userId,
	);
});

const filteredLemmaListsOtherUsers = computed(() => {
	return filteredLemmaLists.value.filter(
		(l) => l.editor == null || l.editor.userId !== store.user.userProfile.userId,
	);
});

function onDragEnter(event: DragEvent, clickAfterLingering = false) {
	if (event.currentTarget instanceof HTMLElement) {
		const target = event.currentTarget;

		const timer = setTimeout(() => {
			if (clickAfterLingering) {
				target.click();
			}
		}, 1000);

		target.classList.add("drag-over");

		const onLeaveOrDrop = () => {
			clearTimeout(timer);

			target.classList.remove("drag-over");

			target.removeEventListener("dragleave", onLeaveOrDrop);
			target.removeEventListener("drop", onLeaveOrDrop);
		};

		target.addEventListener("dragleave", onLeaveOrDrop);
		target.addEventListener("drop", onLeaveOrDrop);
	}
}

function selectLemmaFilter(id: string) {
	store.lemma.selectedLemmaFilterId = id;
}

function onEscapeSearch(event: KeyboardEvent) {
	if (searchQuery.value !== "") {
		searchQuery.value = "";
	} else {
		if (event.target instanceof HTMLInputElement) {
			event.target.blur();
		}
	}
}

function loadIssue(issueId: number | null) {
	if (issueId != null) {
		store.lemma.selectedLemmaIssueId = issueId;
		store.issue.loadIssue(issueId);
	}
}

async function loadIssueLemmas(issueId: number | null) {
	if (issueId != null) {
		store.lemma.selectedLemmaIssueId = issueId;
		const lemmas = await store.issue.getIssueLemmas(issueId);
		store.lemma.selectedIssueLemmas = lemmas;
	}
}

async function deleteList(list: LemmaList) {
	if (list.id != null) {
		if (await confirm.confirm(`Liste ”${list.title}” löschen?`, { icon: "mdi-delete-outline" })) {
			store.lemma.deleteLemmaList(list.id);
		}
	}
}

async function copyLemmasToList(list: WithId<List>, event: DragEvent) {
	const lemmas = JSON.parse(event.dataTransfer?.getData("text/plain") || "[]") as Array<LemmaRow>;
	const listItems = store.lemma.getLemmasByList(list.id);
	const newLemmaList = unique([...lemmas.map((l) => l.id), ...listItems]);
	const diff = newLemmaList.length - listItems.length;
	if (
		diff !== 0 &&
		(await confirm.confirm(`${lemmas.length} Lemma(ta) zu ”${list.title}” hinzufügen?`))
	) {
		store.lemma.addLemmasToList(
			{
				id: list.id,
				title: list.title,
				editor: store.user.userProfile.userId,
			},
			lemmas,
		);
	}
}

function addLemmaToIssue(issueId: number, e: DragEvent) {
	const lemmas =
		e instanceof DragEvent
			? (JSON.parse(e.dataTransfer?.getData("text/plain") || "[]") as Array<LemmaRow>)
			: [];
	store.issue.addLemmaToIssue(issueId, lemmas);
}

async function createLemmaList(event: DragEvent | MouseEvent) {
	const lemmas =
		event instanceof DragEvent
			? (JSON.parse(event.dataTransfer?.getData("text/plain") || "[]") as Array<LemmaRow>)
			: [];

	const lemmaNameRules = [
		(n: string | null) =>
			n === null || (typeof n === "string" && n.trim() === "")
				? "Geben Sie einen Namen ein."
				: true,
		(n: string | null) => {
			if (n === null) {
				return "Geben Sie einen Namen ein";
			} else if (
				filteredLemmaLists.value.findIndex(
					(ll) => ll.title.trim().toLocaleLowerCase() === n.trim().toLocaleLowerCase(),
				) > -1
			) {
				return "Name bereits vergeben.";
			} else {
				return true;
			}
		},
	];

	const message =
		lemmas.length > 0
			? `Neue Liste mit ${lemmas.length} Einträgen erstellen`
			: "Neue Liste anlegen";

	const name = await prompt.prompt(message, {
		placeholder: "Listenname…",
		rules: lemmaNameRules,
	});

	if (name !== null) {
		const l = (await store.lemma.createList(name)) as WithId<LemmaList>;

		if (lemmas.length) {
			await store.lemma.addLemmasToList(
				{
					id: l.id,
					title: l.title,
					editor: store.user.userProfile.userId,
				},
				lemmas,
			);
		}

		store.lemma.selectedLemmaListId = l.id || null;
	}
}

function toggleDrawer() {
	store.settings = { ...store.settings, showNavDrawer: !store.settings.showNavDrawer };
}
</script>

<template>
	<div
		test-id="sidebar"
		tabindex="-1"
		class="d-flex fill-height flex-column overflow-y-hidden sidebar"
	>
		<div :style="{ zIndex: 1 }">
			<div class="d-flex pb-2">
				<VBtn tile depressed class="rounded-lg mr-1" icon @click="toggleDrawer">
					<VIcon>mdi-dock-left</VIcon>
				</VBtn>
				<TextField
					v-model="searchQuery"
					class="flex-grow-1 mr-2"
					:clearable="true"
					color="background darken-3"
					:placeholder="showLoader === true ? 'Lade…' : 'Listen filtern…'"
					@keydown.esc.native="onEscapeSearch"
				>
					<template #prepend>
						<div v-if="showLoader === true" class="ml-2 mt-1">
							<LoadingSpinner :size="25" :color="$vuetify.theme.dark === true ? 'white' : 'grey'" />
						</div>
						<VIcon v-else size="16" class="ml-2 mr-0">mdi-magnify</VIcon>
					</template>
				</TextField>
			</div>
		</div>

		<div style="flex: 1" class="overflow-y-auto pr-2">
			<!-- Lemma Lib -->
			<VList class="ma-0 mt-4 pa-0 lemma-nav-list x-dense" color="transparent" nav>
				<VListItem
					:ripple="false"
					to="/lemmas"
					test-id="lemma-library-link"
					exact
					@click="store.lemma.selectedLemmaListId = null"
				>
					<VListItemAvatar tile>
						<VIcon color="primary darken-1" small>mdi-bookshelf</VIcon>
					</VListItemAvatar>
					<VListItemContent>
						<VListItemTitle>Lemmabibliothek</VListItemTitle>
					</VListItemContent>
					<VListItemAction>
						<Badge :content="store.lemma.lemmaCount" />
					</VListItemAction>
				</VListItem>
			</VList>

			<!-- Abgaben -->
			<VSubheader :class="['pl-1', showIssues && 'active']" @click="showIssues = !showIssues">
				<VIcon class="mr-1" small>mdi-chevron-down</VIcon>
				Abgaben
			</VSubheader>

			<VList v-show="showIssues" class="pa-0 ma-0 lemma-nav-list x-dense" color="transparent" nav>
				<VListItem
					v-for="issue in store.issue.issues"
					:key="'issue-' + issue.id"
					:ripple="false"
					:input-value="store.lemma.selectedLemmaIssueId === issue.id"
					class="droppable mb-0"
					:to="'/issue/' + issue.id"
					@dragenter.prevent="onDragEnter($event, true)"
					@dragover.prevent=""
					@drop.prevent="
						addLemmaToIssue(
							// @ts-expect-error
							issue.id,
							$event,
						)
					"
					@click="loadIssue(issue.id || null)"
				>
					<VListItemAvatar tile>
						<VIcon color="primary darken-1" small class="rotate-180">mdi-chart-box-outline</VIcon>
					</VListItemAvatar>
					<VListItemContent>
						<VListItemTitle>
							{{ issue.name }}
						</VListItemTitle>
					</VListItemContent>
				</VListItem>
			</VList>

			<VSubheader
				:class="['pl-1', 'pr-0', showMyLists && 'active']"
				@click="showMyLists = !showMyLists"
				@dragenter.prevent="onDragEnter($event)"
				@dragover.prevent=""
				@drop.prevent="createLemmaList($event)"
			>
				<VIcon class="mr-1" small>mdi-chevron-down</VIcon>
				Meine Listen
				<VSpacer />
				<VBVtn
					class="droppable rounded-lg"
					style="margin-right: -2px"
					elevation="0"
					text
					test-id="create-list-btn"
					small
					color="primary darken-1"
					@click.capture.prevent.stop="createLemmaList"
					@dragenter.prevent="onDragEnter($event)"
				>
					Liste anlegen
					<VIcon class="ml-2" small>mdi-plus-circle-outline</VIcon>
				</VBVtn>
			</VSubheader>

			<VList v-show="showMyLists" class="pa-0 ma-0 lemma-nav-list x-dense" color="transparent" nav>
				<VListItem
					v-for="list in filteredLemmaListsCurrentUser"
					:key="list.id"
					:ripple="false"
					:input-value="store.lemma.selectedLemmaListId === list.id"
					:to="'/lemmas/list/' + list.id"
					class="mb-0 droppable"
					@dragenter.prevent="onDragEnter($event, true)"
					@dragover.prevent=""
					@drop.prevent="copyLemmasToList(list, $event)"
				>
					<VListItemAvatar tile>
						<VIcon color="primary darken-1" small>mdi-folder-text</VIcon>
					</VListItemAvatar>
					<VListItemContent>
						<VListItemTitle>
							{{ list.title }}
						</VListItemTitle>
					</VListItemContent>
					<VListItemAction>
						<transition name="roll">
							<Badge :key="list.count" test-id="lemma-list-count" :content="list.count" />
						</transition>
					</VListItemAction>
					<VListItemAction v-if="list.countNew !== 0" class="ml-0">
						<Badge :content="list.countNew ? '+' + list.countNew.toString() : '0'" />
					</VListItemAction>
				</VListItem>
			</VList>

			<VSubheader
				:class="['pl-1', showTeamLists && 'active']"
				@click="showTeamLists = !showTeamLists"
			>
				<VIcon class="mr-1" small>mdi-chevron-down</VIcon>
				Team-Listen
			</VSubheader>

			<VList
				v-show="showTeamLists"
				two-line
				class="pa-0 ma-0 lemma-nav-list x-dense"
				color="transparent"
				nav
			>
				<VListItem
					v-for="list in filteredLemmaListsOtherUsers"
					:key="list.id"
					two-line
					:ripple="false"
					tabindex="-1"
					:input-value="store.lemma.selectedLemmaListId === list.id"
					:to="`/lemmas/list/${list.id}`"
					class="droppable mb-0"
					@dragenter.prevent="onDragEnter($event, true)"
					@dragover.prevent=""
					@drop.prevent="copyLemmasToList(list, $event)"
				>
					<VListItemAvatar tile>
						<VIcon color="primary darken-1" small>mdi-folder-text-outline</VIcon>
						<!-- <v-icon color="primary darken-1" small>mdi-rhombus-split</v-icon> -->
					</VListItemAvatar>
					<VListItemContent>
						<VListItemTitle>
							{{ list.title }}
						</VListItemTitle>
						<VListItemSubtitle>
							{{ list.editor ? list.editor.name : "" }}
						</VListItemSubtitle>
					</VListItemContent>
					<VListItemAction>
						<transition name="roll">
							<Badge :key="list.count" :content="list.count" />
						</transition>
					</VListItemAction>
				</VListItem>
			</VList>

			<VSubheader
				:class="['px-0', showQueries && 'active']"
				class="pl-1"
				@click="showQueries = !showQueries"
			>
				<VIcon class="mr-1" small>mdi-chevron-down</VIcon>
				Meine Abfragen
			</VSubheader>

			<VList v-show="showQueries" class="pa-0 ma-0 lemma-nav-list x-dense" color="transparent" nav>
				<VListItem
					v-for="(filter, i) in filteredStoredLemmaFilters"
					:key="'l' + i"
					:ripple="false"
					class="mb-0"
					:input-value="filter.id === store.lemma.selectedLemmaFilterId"
					@click="selectLemmaFilter(filter.id)"
				>
					<VListItemAvatar tile>
						<VIcon color="primary darken-1" small>mdi-filter-variant</VIcon>
					</VListItemAvatar>
					<VListItemContent>
						<VListItemTitle>
							{{ filter.name }}
						</VListItemTitle>
					</VListItemContent>
				</VListItem>
			</VList>
		</div>

		<div v-if="store.lemma.importStatus.isImporting">
			<VDivider />
			<div class="px-4 pb-5">
				<VSubheader class="pl-1">
					<div>Importiere...</div>
					<VSpacer />
					<div>
						({{ store.lemma.importStatus.status }} von {{ store.lemma.importStatus.target }})
					</div>
				</VSubheader>
				<VProgressLinear class="mt-0 rounded" :value="store.lemma.importStatus.progress * 100" />
			</div>
		</div>
	</div>
</template>

<style>
.droppable * {
	pointer-events: none !important;
}
</style>

<style scoped>
.sidebar:focus .v-list-item--active,
.v-list-item--active:focus {
	background: var(--v-primary-base);
	color: hsl(0deg 0% 100%);
}

.drag-over {
	box-shadow: inset 0 0 0 3px var(--v-primary-base) !important;
}

.v-subheader {
	height: 24px;
	margin-top: 16px;
	margin-bottom: 3px;
	font-weight: 500;
	font-size: 0.75rem;
	opacity: 80%;
	cursor: default;
	user-select: none;
}

.v-subheader .v-icon {
	width: 10px;
	transform: rotate(-90deg);
}

.v-subheader.active .v-icon {
	transform: rotate(0deg);
}

.search-field :deep(.v-icon.v-icon) {
	font-size: 130%;
}

.v-list-item {
	min-height: 32px !important;
}

.v-list-item .v-list-item__content {
	opacity: 80%;
}

.v-list-item__action {
	margin: 0;
}

.lemma-nav-list :deep(.v-list-group__header::before) {
	opacity: 0% !important;
}

.lemma-nav-list :deep(.v-list-group__header .v-icon) {
	opacity: 0%;
}

.lemma-nav-list :deep(.v-list-group__header:hover .v-icon) {
	opacity: 100%;
}

.lemma-nav-list,
.lemma-nav-list :deep(*) {
	cursor: default !important;
}

.roll-enter-active,
.roll-leave-active {
	position: relative;
	transition: all 0.3s ease;
}

.roll-enter,
.roll-leave-to {
	position: absolute;
	opacity: 0%;
}

.roll-enter {
	transform: translateY(20px);
}

.roll-leave-to {
	transform: translateY(-20px);
}
</style>
