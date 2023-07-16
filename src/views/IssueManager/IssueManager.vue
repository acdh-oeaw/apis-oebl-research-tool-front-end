<template>
	<div class="fill-height background darken-1">
		<v-app-bar app color="background darken-1" class="elevation-0 pt-3 pr-3">
			<v-btn
				v-if="!store.settings.showNavDrawer"
				style="margin-top: -7px"
				tile
				class="rounded-lg"
				icon
				@click="toggleDrawer"
			>
				<v-icon>mdi-dock-left</v-icon>
			</v-btn>
			<div>
				<h1>{{ store.issue.activeIssue ? store.issue.activeIssue.name : "…" }}</h1>
				<div class="caption mt-1 text-no-wrap">
					<span style="opacity: 70%">
						{{ issueLemmas.length }} Ergebnisse. {{ filteredIssues.length }} angezeigt
					</span>
				</div>
			</div>
			<v-spacer />
			<v-autocomplete
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
					<v-btn x-small elevation="0" rounded color="background" @click.stop.prevent="log">
						{{
							searchItems.length > 0
								? filteredIssues.length + "/" + issueLemmas.length
								: issueLemmas.length
						}}
					</v-btn>
				</template>
				<template #item="{ item, on, props }">
					<v-list-item
						v-bind="props"
						:key="item.type + '__' + item.id"
						v-ripple="false"
						class="filter-autocomplete-item mx-2 mb-1"
						:class="{
							selected: searchItems.find((i) => i.id === item.id && i.type === item.type) != null,
						}"
						v-on="on"
					>
						<v-list-item-avatar>
							<img
								v-if="item.type === 'editor' && item.image != null"
								:key="item.type + '__' + item.id"
								alt=""
								:src="item.image"
							/>
							<v-icon v-if="item.type === 'author'">mdi-account-edit-outline</v-icon>
							<v-icon v-if="item.type === 'label' && item.color != null" :color="item.color">
								mdi-checkbox-blank-circle
							</v-icon>
							<v-icon v-if="item.type === 'text'">mdi-card-text-outline</v-icon>
						</v-list-item-avatar>
						<v-list-item-content>
							<v-list-item-title>
								{{ item.text }}
							</v-list-item-title>
							<v-list-item-subtitle>
								{{ item.description }}
							</v-list-item-subtitle>
						</v-list-item-content>
						<v-list-item-action
							v-if="searchItems.find((i) => i.id === item.id && i.type === item.type) != null"
							width="20"
						>
							<v-icon small>mdi-check</v-icon>
						</v-list-item-action>
					</v-list-item>
				</template>
			</v-autocomplete>
			<v-menu content-class="soft-shadow" offset-y left bottom :close-on-content-click="false">
				<template #activator="{ on, attrs }">
					<v-btn v-bind="attrs" tile class="rounded-lg" icon v-on="on">
						<v-icon>mdi-dots-horizontal-circle-outline</v-icon>
					</v-btn>
				</template>
				<v-list color="background lighten-2" class="text-body-2 rounded-lg elevation-0s" dense nav>
					<v-subheader>Layout</v-subheader>
					<v-list-item class="pa-1 rounded-lg">
						<switch-button
							v-model="viewAs"
							:items="[
								{ icon: 'mdi-chart-box-outline', value: 'board' },
								{ icon: 'mdi-format-list-bulleted', value: 'list' },
							]"
						/>
					</v-list-item>
					<v-list-item
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
						<v-list-item-avatar size="15">
							<v-icon v-if="store.settings.issueViewOptions.showAuthor">mdi-check</v-icon>
						</v-list-item-avatar>
						<v-list-item-content>Autor anzeigen</v-list-item-content>
					</v-list-item>
					<v-list-item
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
						<v-list-item-avatar size="15">
							<v-icon v-if="store.settings.issueViewOptions.showEditor">mdi-check</v-icon>
						</v-list-item-avatar>
						<v-list-item-content>Redakteur anzeigen</v-list-item-content>
					</v-list-item>
					<v-list-item
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
						<v-list-item-avatar size="15">
							<v-icon v-if="store.settings.issueViewOptions.showBirthAndDeath">mdi-check</v-icon>
						</v-list-item-avatar>
						<v-list-item-content>Geburtsdaten anzeigen</v-list-item-content>
					</v-list-item>
					<v-divider />
					<v-subheader>Farbschema</v-subheader>
					<v-list-item
						:style="{ backgroundColor: 'var(--v-background-darken-2)' }"
						class="pa-1 rounded-lg"
					>
						<theme-toggle />
					</v-list-item>
					<v-divider />
					<v-list-item dense @click="() => store.logOut()">
						<v-list-item-avatar size="15">
							<v-icon small>mdi-power</v-icon>
						</v-list-item-avatar>
						<v-list-item-content>Ausloggen</v-list-item-content>
					</v-list-item>
				</v-list>
			</v-menu>
			<v-btn v-if="!showSideBar" tile class="rounded-lg" icon @click="showSideBar = !showSideBar">
				<v-icon>mdi-dock-right</v-icon>
			</v-btn>
		</v-app-bar>
		<resizable-drawer
			:card="true"
			:right="true"
			color="background"
			:min-width="300"
			:width="store.settings.drawerRightWidth"
			:value="showSideBar"
			@update:width="store.settings = { ...store.settings, drawerRightWidth: $event }"
			@close="showSideBar = false"
		>
			<v-btn
				style="position: absolute; top: 5px; right: 0; z-index: 1"
				width="48"
				height="48"
				tile
				class="rounded-lg mr-2"
				icon
				@click="showSideBar = false"
			>
				<v-icon>mdi-dock-right</v-icon>
			</v-btn>
			<issue-lemma-detail
				v-if="selectedLemma != null"
				:lemma="selectedLemma"
				:value="selectedLemma != null"
				@update="updateLemmaById"
				@update-status="updateLemmaStatus"
				@delete-issue-lemma="deleteIssueLemma"
				@close="showSideBar = false"
			>
				<v-row dense>
					<v-col>
						<v-btn
							class="rounded-lg"
							color="background darken-2"
							elevation="0"
							block
							@click="deleteIssueLemma"
						>
							<v-icon style="opacity: 70%" left>mdi-bookshelf</v-icon>
							löschen
						</v-btn>
					</v-col>
					<v-col>
						<v-btn class="rounded-lg" elevation="0" block color="primary">
							<v-icon style="opacity: 70%" left>mdi-pen</v-icon>
							Artikel anzeigen
						</v-btn>
					</v-col>
				</v-row>
			</issue-lemma-detail>
		</resizable-drawer>
		<v-main class="fill-height rounded-lg">
			<issue-lemma-board
				v-if="store.settings.issueLayout === 'board'"
				class="fill-height"
				:columns="columns"
				:animate="animateLemmas"
				:selected-lemma="selectedLemma"
				:view-options="viewOptions"
				@end-drag="onEndDrag"
				@update-column="onUpdateColumn"
				@select-lemma="openLemma"
				@dblclick.native="showSideBar = !showSideBar"
			/>
			<issue-lemma-list
				v-if="store.settings.issueLayout === 'list'"
				class="fill-height"
				:columns="columns"
				:animate="animateLemmas"
				:selected-lemma="selectedLemma"
				:view-options="viewOptions"
				@update-column="onUpdateColumn"
				@select-lemma="openLemma"
				@end-drag="onEndDrag"
				@dblclick.native="showSideBar = !showSideBar"
			/>
		</v-main>
	</div>
</template>

<script lang="ts">
import _ from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import store from "@/store";
import confirm from "@/store/confirm";

import { type IssueLemma, type LemmaLabel, type LemmaStatus } from "../../api/index";
import { type WithId } from "../../types";
import { DateContainer } from "../../util/dates";
import LoadingSpinner from "../lib/LoadingSpinner.vue";
import ResizableDrawer from "../lib/ResizableDrawer.vue";
import SwitchButton from "../lib/SwitchButton.vue";
import ThemeToggle from "../ThemeToggle.vue";
import IssueLemmaBoard from "./IssueLemmaBoard.vue";
import IssueLemmaDetail from "./IssueLemmaDetail.vue";
import IssueLemmaList from "./IssueLemmaList.vue";

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	return value != null;
}

@Component({
	components: {
		IssueLemmaDetail,
		IssueLemmaBoard,
		IssueLemmaList,
		ResizableDrawer,
		LoadingSpinner,
		ThemeToggle,
		SwitchButton,
	},
})
export default class IssueManager extends Vue {
	@Prop({ default: "-1" }) issueId!: string;

	searchText: string | null = null;
	searchItems: Array<any> = store.settings.issueLemmaSearchItems;
	animateLemmas = false;
	store = store;
	showSideBar = false;

	log = console.log;

	get selectedLemma() {
		return store.issue.selectedLemma;
	}

	set selectedLemma(l) {
		store.issue.selectedLemma = l;
	}

	get viewAs(): "board" | "list" {
		return store.settings.issueLayout;
	}

	set viewAs(t: "board" | "list") {
		store.settings = { ...store.settings, issueLayout: t };
	}

	toggleDrawer() {
		this.store.settings = {
			...this.store.settings,
			showNavDrawer: !this.store.settings.showNavDrawer,
		};
	}

	viewOptions = {
		showAuthor: true,
		showEditor: true,
		showDescription: true,
		showLabels: Infinity,
	};

	@Watch("searchItems")
	onChangeSearchItems() {
		store.settings = {
			...store.settings,
			issueLemmaSearchItems: this.searchItems,
		};
	}

	mounted() {
		store.issue.loadIssue(Number(this.issueId));
	}

	convertUnknownStatus(l: WithId<IssueLemma>): WithId<IssueLemma> {
		if (this.issueStatus.find((s) => s.id === l.status) === undefined) {
			return { ...l, status: this.issueStatus[0]?.id };
		} else {
			return l;
		}
	}

	get issueLemmas(): Array<WithId<IssueLemma>> {
		return store.issue.issueLemmas.map(this.convertUnknownStatus);
	}

	set issueLemmas(ls: Array<WithId<IssueLemma>>) {
		store.issue.issueLemmas = ls;
	}

	get issueStatus() {
		return store.issue.statuses;
	}

	onEndDrag(e: any) {
		if (e.to instanceof HTMLElement && e.item instanceof HTMLElement) {
			const issueLemmaId = Number(e.item.dataset.issueLemmaId);
			const statusId = Number(e.to.dataset.statusId);
			store.issue.updateLemma(issueLemmaId, { status: statusId });
		}
	}

	updateLemmaStatus(statusId: LemmaStatus["id"], lemma: WithId<IssueLemma>) {
		const index = this.issueLemmas.findIndex((i) => i.id === lemma.id);
		if (index > -1) {
			this.animateLemmas = true;
			this.issueLemmas[index]!.status = statusId;
			this.updateLemmaById(lemma.id, { status: statusId });
			setTimeout(() => {
				this.animateLemmas = false;
			}, 300);
		}
	}

	updateLemmaById(id: number, u: Partial<IssueLemma>) {
		store.issue.updateLemma(id, u);
	}

	onUpdateColumn(status: LemmaStatus, lemmas: Array<WithId<IssueLemma>>) {
		const lemmaIds = lemmas.map((l) => l.id);
		const withoutColumn = this.issueLemmas.filter((l) => !lemmaIds.includes(l.id));
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
		this.issueLemmas = [...withoutColumn, ...updatedColumn];
	}

	get columns(): Array<{ name: string; id: number; items: Array<WithId<IssueLemma>> }> {
		return this.store.issue.statuses.map((s) => {
			return {
				...s,
				items: _(this.filteredIssues)
					.filter((i) => i.status === s.id)
					.orderBy("order")
					.value(),
			};
		});
	}

	get lemmaEditors() {
		return _(this.issueLemmas)
			.map((l) => l.editor)
			.filter(notEmpty)
			.uniqBy("userId")
			.map((id) => store.editors.getById(id))
			.filter(notEmpty)
			.value();
	}

	get lemmaAuthors() {
		console.warn("Get lemma authors is currently not implemented. This is a TODO!");
		return [];
		// A reminder, how this woorked. TODO: remove comment
		// return _(this.issueLemmas)
		//   .map(l => l.author)
		//   .filter(notEmpty)
		//   .uniqBy('author')
		//   .map(id => store.authors.getById(id))
		//   .filter(notEmpty)
		//   .value()
		// ;
	}

	get lemmaLabels(): Array<LemmaLabel> {
		return _(this.issueLemmas)
			.flatMap((l) => l.labels)
			.uniq()
			.map((id) => store.issue.getLabelById(id || -1))
			.filter(notEmpty)
			.value();
	}

	get lemmaText(): Array<{ text: string; info: string | null | undefined; issueLemmaId: number }> {
		return this.issueLemmas.map((l) => ({
			text:
				l.lemma.lastName +
				", " +
				l.lemma.firstName +
				" " +
				(DateContainer.fromISO_OnlyDate(l.lemma.dateOfBirth).calendarYear || "") +
				"-" +
				(DateContainer.fromISO_OnlyDate(l.lemma.dateOfDeath).calendarYear || ""),
			info: l.lemma.info,
			issueLemmaId: l.id,
		}));
	}

	get autocompleteItems() {
		console.warn("Auto complete for authors is currently not implemented. This is a TODO!");
		return [
			...this.lemmaEditors.map((e) => ({
				type: "editor",
				text: e.name,
				id: e.userId,
				value: "editor:" + e.userId,
				image: "", // e.profilePicture,
				description: "Redakteur",
			})),
			// This is a reminder, how this used to look like. TODO: Remove that comment.
			// ...this.lemmaAuthors.map(e => ({
			//   type: 'author',
			//   text: e.name,
			//   id: e.userId,
			//   value: 'author:' + e.userId,
			//   description: 'Autor'
			// })),
			...this.lemmaLabels.map((e) => ({
				type: "label",
				text: e.name,
				id: e.id,
				value: "label:" + e.id,
				color: (e as any).color || "orange",
				description: "Label",
			})),
			...this.lemmaText.map((e) => ({
				type: "text",
				text: e.text,
				id: e.issueLemmaId,
				value: "lemma:" + e.issueLemmaId,
				info: e.info,
			})),
		];
	}

	async deleteIssueLemma(id: number) {
		if (
			await confirm.confirm("Wollen Sie dieses Lemma aus der Abgabe entfernen?", {
				icon: "mdi-delete-outline",
			})
		) {
			store.issue.deleteIssueLemma(id);
		}
	}

	get filteredIssues(): Array<WithId<IssueLemma>> {
		console.warn("Filtereing by author is currentl not impemented. this is a TODO!");
		return this.issueLemmas.filter((issue) => {
			return (
				this.searchItems.length === 0 ||
				this.searchItems.find((si) => si.type === "editor" && si.id === issue.editor) !==
					undefined ||
				this.searchItems.find(
					(si) =>
						si.type === "label" &&
						issue.labels != null &&
						issue.labels.find((l) => l === si.id) != null,
				) != null ||
				this.searchItems.find((si) => si.type === "text" && si.id === issue.id) != null
				// this.searchItems.find(si => si.type === 'author' && si.id === issue.author) != null ||
			);
		});
	}

	openLemma(l: WithId<IssueLemma>) {
		this.selectedLemma = l;
	}
}
</script>

<style lang="stylus" scoped>
.selected
  background rgb(0 0 0 / 10%)

.filter-autocomplete-item
  border-radius 7px

  &::before
    border-radius 7px

.issue-selector
  height 70vh
</style>
