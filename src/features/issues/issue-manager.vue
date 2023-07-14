<script lang="ts" setup>
import { groupBy, isNonNullable, unique } from "@acdh-oeaw/lib";
import { chain } from "lodash";
import { computed, onMounted, ref, watch } from "vue";

import { type IssueLemma, type LemmaStatus } from "@/api";
import ThemeToggle from "@/features/common/theme-toggle.vue";
import IssueBoard from "@/features/issues/issue-board.vue";
import IssueDetail from "@/features/issues/issue-details.vue";
import IssueList from "@/features/issues/issue-list.vue";
import ResizableDrawer from "@/features/ui/resizable-drawer.vue";
import SwitchButton from "@/features/ui/switch-button.vue";
import { getYear } from "@/lib/get-year";
import store from "@/store";
import confirm from "@/store/confirm";
import { type WithId } from "@/types";

const props = defineProps<{
	id: number | null;
}>();

const isSideBarVisible = ref(false);

function onToggleSideBar() {
	isSideBarVisible.value = !isSideBarVisible.value;
}

//

const issueStatus = computed(() => {
	return store.issue.statuses;
});

function convertUnknownStatus(l: WithId<IssueLemma>): WithId<IssueLemma> {
	if (issueStatus.value.find((s) => s.id === l.status) === undefined) {
		return { ...l, status: issueStatus.value[0]?.id };
	} else {
		return l;
	}
}

const issueLemmas = computed({
	get() {
		return store.issue.issueLemmas.map(convertUnknownStatus);
	},
	set(issueLemmas) {
		store.issue.issueLemmas = issueLemmas;
	},
});

const selectedLemma = computed({
	get() {
		return store.issue.selectedLemma;
	},
	set(lemma) {
		store.issue.selectedLemma = lemma;
	},
});

function onSelectLemma(lemma: WithId<IssueLemma>) {
	selectedLemma.value = lemma;
}

//

const lemmaEditors = computed(() => {
	return chain(issueLemmas.value)
		.map((l) => l.editor)
		.filter(isNonNullable)
		.uniqBy("userId")
		.map((id) => store.editors.getById(id))
		.filter(isNonNullable)
		.value();
});

// FIXME: apparently this used to be implemented, but then changed to just return an empty array?
const lemmaAuthors = computed(() => {
	return chain(issueLemmas.value)
		.map((l) => l.author)
		.filter(isNonNullable)
		.uniqBy("author")
		.map((id) => store.authors.getById(id))
		.filter(isNonNullable)
		.value();
});

const lemmaLabels = computed(() => {
	return chain(issueLemmas.value)
		.flatMap((l) => l.labels)
		.uniq()
		.map((id) => store.issue.getLabelById(id || -1))
		.filter(isNonNullable)
		.value();
});

const lemmaText = computed(() => {
	return issueLemmas.value.map((l) => ({
		text:
			l.lemma.lastName +
			", " +
			l.lemma.firstName +
			" " +
			(getYear(l.lemma.dateOfBirth) || "") +
			"-" +
			(getYear(l.lemma.dateOfDeath) || ""),
		info: l.lemma.info,
		issueLemmaId: l.id,
	}));
});

//

const searchText = ref("");

const searchItems = computed(() => {
	return store.settings.issueLemmaSearchItems;
});

// FIXME: why not computed property with setter?
watch(searchItems, (searchItems) => {
	store.settings = {
		...store.settings,
		issueLemmaSearchItems: searchItems,
	};
});

// FIXME: missing autocomplete for authors
const autocompleteItems = computed(() => {
	return [
		...lemmaEditors.value.map((e) => ({
			type: "editor",
			text: e.name,
			id: e.userId,
			value: "editor:" + e.userId,
			image: "", // e.profilePicture,
			description: "Redakteur",
		})),
		...lemmaAuthors.value.map((e) => ({
			type: "author",
			text: e.name,
			id: e.userId,
			value: "author:" + e.userId,
			description: "Autor",
		})),
		...lemmaLabels.value.map((e) => ({
			type: "label",
			text: e.name,
			id: e.id,
			value: "label:" + e.id,
			color: e.color || "orange",
			description: "Label",
		})),
		...lemmaText.value.map((e) => ({
			type: "text",
			text: e.text,
			id: e.issueLemmaId,
			value: "lemma:" + e.issueLemmaId,
			info: e.info,
		})),
	];
});

const filteredIssues = computed(() => {
	return issueLemmas.value.filter((issue) => {
		return (
			searchItems.value.length === 0 ||
			searchItems.value.find((si) => si.type === "editor" && si.id === issue.editor) !==
				undefined ||
			searchItems.value.find(
				(si) =>
					si.type === "label" &&
					issue.labels !== undefined &&
					issue.labels.find((l) => l === si.id) !== undefined,
			) !== undefined ||
			searchItems.value.find((si) => si.type === "text" && si.id === issue.id) !== undefined
			// searchItems.value.find(si => si.type === 'author' && si.id === issue.author) !== undefined ||
		);
	});
});

//

const animateLemmas = ref(false);

function updateLemmaById(id: number, u: Partial<IssueLemma>) {
	store.issue.updateLemma(id, u);
}

function onEndDrag(e: any) {
	if (e.to instanceof HTMLElement && e.item instanceof HTMLElement) {
		const issueLemmaId = Number(e.item.dataset.issueLemmaId);
		const statusId = Number(e.to.dataset.statusId);
		store.issue.updateLemma(issueLemmaId, { status: statusId });
	}
}

function updateLemmaStatus(statusId: LemmaStatus["id"], lemma: WithId<IssueLemma>) {
	const index = issueLemmas.value.findIndex((i) => i.id === lemma.id);

	if (index > -1) {
		animateLemmas.value = true;
		issueLemmas.value[index]!.status = statusId;
		updateLemmaById(lemma.id, { status: statusId });
		setTimeout(() => {
			animateLemmas.value = false;
		}, 300);
	}
}

//

async function deleteIssueLemma(id: number) {
	if (
		await confirm.confirm("Wollen Sie dieses Lemma aus der Abgabe entfernen?", {
			icon: "mdi-delete-outline",
		})
	) {
		store.issue.deleteIssueLemma(id);
	}
}

//

function onUpdateColumn(status: LemmaStatus, lemmas: Array<WithId<IssueLemma>>) {
	const lemmaIds = lemmas.map((l) => l.id);
	const withoutColumn = issueLemmas.value.filter((l) => !lemmaIds.includes(l.id));
	const updatedColumn: Array<WithId<IssueLemma>> = [];
	lemmas.forEach((lemma, i) => {
		const order =
			(lemma.order || 0) <= (updatedColumn[i - 1]?.order || 0)
				? (updatedColumn[i - 1]!.order || 0) + 1
				: lemma.order;
		updatedColumn.push({
			...lemma,
			order,
			status: status.id,
		});
	});
	issueLemmas.value = [...withoutColumn, ...updatedColumn];
}

const columns = computed(() => {
	return store.issue.statuses.map((s) => {
		return {
			...s,
			items: chain(filteredIssues.value)
				.filter((i) => i.status === s.id)
				.orderBy("order")
				.value(),
		};
	});
});

//

const viewAs = computed({
	get() {
		return store.settings.issueLayout;
	},
	set(layout) {
		store.settings = { ...store.settings, issueLayout: layout };
	},
});

function toggleDrawer() {
	store.settings = {
		...store.settings,
		showNavDrawer: !store.settings.showNavDrawer,
	};
}

const viewOptions = {
	showAuthor: true,
	showEditor: true,
	showDescription: true,
	showLabels: Infinity,
};

onMounted(() => {
	// FIXME: what happens when id is null?
	store.issue.loadIssue(props.id);
});
</script>

<template>
	<div class="fill-height background darken-1">
		<VAppBar app color="background darken-1" class="elevation-0 pt-3 pr-3">
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
			<div>
				<h1>{{ store.issue.activeIssue ? store.issue.activeIssue.name : "…" }}</h1>
				<div class="caption mt-1 text-no-wrap">
					<span style="opacity: 70%">
						{{ issueLemmas.length }} Ergebnisse. {{ filteredIssues.length }} angezeigt
					</span>
				</div>
			</div>
			<VSpacer />
			<VAutocomplete
				v-model="searchItems"
				single-line
				style="max-width: 50%"
				class="rounded-lg ml-5 mr-1 text-body-2"
				background-color="background darken-2"
				dense
				multiple
				clearable
				hide-details
				:menu-props="{
					maxWidth: `calc(50% - ${
						store.settings.drawerLeftWidth + store.settings.drawerRightWidth
					}px)`,
					rounded: 'lg',
					contentClass: 'soft-shadow',
				}"
				return-object
				:items="autocompleteItems"
				placeholder="Filter…"
				:search-input.sync="searchText"
				prepend-inner-icon="mdi-magnify"
				solo
				flat
				@keyup.esc="searchText = ''"
				@change="searchText = ''"
				@click:append-inner="searchItems = []"
			>
				<template #append>
					<VBtn x-small elevation="0" rounded color="background" @click.stop.prevent="log">
						{{
							searchItems.length > 0
								? filteredIssues.length + "/" + issueLemmas.length
								: issueLemmas.length
						}}
					</VBtn>
				</template>
				<template #item="{ item, on, props }">
					<VListItem
						v-bind="props"
						:key="item.type + '__' + item.id"
						v-ripple="false"
						class="filter-autocomplete-item mx-2 mb-1"
						:class="{
							selected:
								searchItems.find((i) => i.id === item.id && i.type === item.type) !== undefined,
						}"
						v-on="on"
					>
						<VListItemAvatar>
							<img
								v-if="item.type === 'editor' && item.image !== undefined"
								:key="item.type + '__' + item.id"
								alt=""
								:src="item.image"
							/>
							<VIcon v-if="item.type === 'author'">mdi-account-edit-outline</VIcon>
							<VIcon v-if="item.type === 'label' && item.color !== undefined" :color="item.color">
								mdi-checkbox-blank-circle
							</VIcon>
							<VIcon v-if="item.type === 'text'">mdi-card-text-outline</VIcon>
						</VListItemAvatar>
						<VListItemContent>
							<VListItemTitle>
								{{ item.text }}
							</VListItemTitle>
							<VListItemSubtitle>
								{{ item.description }}
							</VListItemSubtitle>
						</VListItemContent>
						<VListItemAction
							v-if="searchItems.find((i) => i.id === item.id && i.type === item.type) !== undefined"
							width="20"
						>
							<VIcon small>mdi-check</VIcon>
						</VListItemAction>
					</VListItem>
				</template>
			</VAutocomplete>
			<VMenu content-class="soft-shadow" offset-y left bottom :close-on-content-click="false">
				<template #activator="{ on, attrs }">
					<VBtn v-bind="attrs" tile class="rounded-lg" icon v-on="on">
						<VIcon>mdi-dots-horizontal-circle-outline</VIcon>
					</VBtn>
				</template>
				<VList color="background lighten-2" class="text-body-2 rounded-lg elevation-0s" dense nav>
					<VSubheader>Layout</VSubheader>
					<VListItem class="pa-1 rounded-lg">
						<SwitchButton
							v-model="viewAs"
							:items="[
								{ icon: 'mdi-chart-box-outline', value: 'board' },
								{ icon: 'mdi-format-list-bulleted', value: 'list' },
							]"
						/>
					</VListItem>
					<VListItem
						@click="
							store.settings = {
								...store.settings,
								issueViewOptions: {
									...store.settings.issueViewOptions,
									showAuthor: !store.settings.issueViewOptions.showAuthor,
								},
							}
						"
					>
						<VListItemAvatar size="15">
							<VIcon v-if="store.settings.issueViewOptions.showAuthor">mdi-check</VIcon>
						</VListItemAvatar>
						<VListItemContent>Autor anzeigen</VListItemContent>
					</VListItem>
					<VListItem
						@click="
							store.settings = {
								...store.settings,
								issueViewOptions: {
									...store.settings.issueViewOptions,
									showEditor: !store.settings.issueViewOptions.showEditor,
								},
							}
						"
					>
						<VListItemAvatar size="15">
							<VIcon v-if="store.settings.issueViewOptions.showEditor">mdi-check</VIcon>
						</VListItemAvatar>
						<VListItemContent>Redakteur anzeigen</VListItemContent>
					</VListItem>
					<VListItem
						@click="
							store.settings = {
								...store.settings,
								issueViewOptions: {
									...store.settings.issueViewOptions,
									showBirthAndDeath: !store.settings.issueViewOptions.showBirthAndDeath,
								},
							}
						"
					>
						<VListItemAvatar size="15">
							<VIcon v-if="store.settings.issueViewOptions.showBirthAndDeath">mdi-check</VIcon>
						</VListItemAvatar>
						<VListItemContent>Geburtsdaten anzeigen</VListItemContent>
					</VListItem>
					<VDivider />
					<VSubheader>Farbschema</VSubheader>
					<VListItem
						:style="{ backgroundColor: 'var(--v-background-darken-2)' }"
						class="pa-1 rounded-lg"
					>
						<ThemeToggle />
					</VListItem>
					<VDivider />
					<VListItem dense @click="() => store.logOut()">
						<VListItemAvatar size="15">
							<VIcon small>mdi-power</VIcon>
						</VListItemAvatar>
						<VListItemContent>Ausloggen</VListItemContent>
					</VListItem>
				</VList>
			</VMenu>
			<VBtn
				v-if="!isSideBarVisible"
				tile
				class="rounded-lg"
				icon
				@click="isSideBarVisible = !isSideBarVisible"
			>
				<VIcon>mdi-dock-right</VIcon>
			</VBtn>
		</VAppBar>

		<ResizableDrawer
			color="background"
			:initial-width="store.settings.drawerRightWidth"
			:min-width="300"
			:right="true"
			variant="card"
			:visible="isSideBarVisible"
			@update:width="store.settings = { ...store.settings, drawerRightWidth: $event }"
			@close="isSideBarVisible = false"
		>
			<VBtn
				style="position: absolute; top: 5px; right: 0; z-index: 1"
				width="48"
				height="48"
				tile
				class="rounded-lg mr-2"
				icon
				@click="isSideBarVisible = false"
			>
				<VIcon>mdi-dock-right</VIcon>
			</VBtn>
			<IssueDetail
				v-if="selectedLemma !== null"
				:lemma="selectedLemma"
				:value="selectedLemma !== null"
				@update="updateLemmaById"
				@update-status="updateLemmaStatus"
				@delete-issue-lemma="deleteIssueLemma"
				@close="isSideBarVisible = false"
			>
				<VRow dense>
					<VCol>
						<VBtn
							class="rounded-lg"
							color="background darken-2"
							elevation="0"
							block
							@click="deleteIssueLemma"
						>
							<VIcon style="opacity: 70%" left>mdi-bookshelf</VIcon>
							löschen
						</VBtn>
					</VCol>
					<VCol>
						<VBtn class="rounded-lg" elevation="0" block color="primary">
							<VIcon style="opacity: 70%" left>mdi-pen</VIcon>
							Artikel anzeigen
						</VBtn>
					</VCol>
				</VRow>
			</IssueDetail>
		</ResizableDrawer>

		<VMain class="fill-height rounded-lg">
			<IssueBoard
				v-if="store.settings.issueLayout === 'board'"
				:animate="animateLemmas"
				class="fill-height"
				:columns="columns"
				:selected-lemma="selectedLemma"
				:view-options="viewOptions"
				@dblclick.native="onToggleSideBar"
				@end-drag="onEndDrag"
				@select-lemma="onSelectLemma"
				@update-column="onUpdateColumn"
			/>

			<IssueList
				v-if="store.settings.issueLayout === 'list'"
				:animate="animateLemmas"
				class="fill-height"
				:columns="columns"
				:selected-lemma="selectedLemma"
				:view-options="viewOptions"
				@dblclick.native="onToggleSideBar"
				@end-drag="onEndDrag"
				@select-lemma="onSelectLemma"
				@update-column="onUpdateColumn"
			/>
		</VMain>
	</div>
</template>

<style scoped>
.selected {
	background: hsl(0deg 0% 0%);
}

.filter-autocomplete-item {
	border-radius: 7px;
}

.filter-autocomplete-item::before {
	border-radius: 7px;
}

.issue-selector {
	height: 70vh;
}
</style>
