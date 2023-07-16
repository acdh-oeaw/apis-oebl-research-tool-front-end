<template>
	<div
		test-id="sidebar"
		tabindex="-1"
		class="d-flex fill-height flex-column overflow-y-hidden sidebar"
	>
		<div :style="{ zIndex: 1 }">
			<div class="d-flex pb-2">
				<v-btn tile depressed class="rounded-lg mr-1" icon @click="toggleDrawer">
					<v-icon>mdi-dock-left</v-icon>
				</v-btn>
				<text-field
					v-model="searchQuery"
					class="flex-grow-1 mr-2"
					:clearable="true"
					color="background darken-3"
					:placeholder="showLoader === true ? 'Lade…' : 'Listen filtern…'"
					@keydown.esc.native="onEscSearch"
				>
					<template #prepend>
						<div v-if="showLoader === true" class="ml-2 mt-1">
							<loading-spinner
								:size="25"
								:color="$vuetify.theme.dark === true ? 'white' : 'grey'"
							/>
						</div>
						<v-icon v-else size="16" class="ml-2 mr-0">mdi-magnify</v-icon>
					</template>
				</text-field>
				<!-- <v-text-field
          style="position: relative"
          :placeholder="showLoader ? 'Lade…' : 'Listen filtern…'"
          solo
          autofocus
          background-color="background darken-2"
          class="text-body-2 rounded-lg search-field"
          dense
          autocomplete="off"
          @keydown.esc="onEscSearch"
          v-model="searchQuery"
          hide-details
          clearable
          flat>
          <template v-slot:prepend-inner>
            <div v-if="showLoader === true">
              <loading-spinner
                :size="25"
                :color="$vuetify.theme.dark ? 'white' : 'grey'"
                class="" />
            </div>
            <v-icon v-else>
              mdi-magnify
            </v-icon>
          </template>
        </v-text-field> -->
			</div>
			<!-- <v-divider class="mt-3" /> -->
		</div>
		<div style="flex: 1" class="overflow-y-auto pr-2">
			<!-- Lemma Lib -->
			<v-list class="ma-0 mt-4 pa-0 lemma-nav-list x-dense" color="transparent" nav>
				<v-list-item
					:ripple="false"
					to="/lemmas"
					test-id="lemma-library-link"
					exact
					@click="store.lemma.selectedLemmaListId = null"
				>
					<v-list-item-avatar tile>
						<v-icon color="primary darken-1" small>mdi-bookshelf</v-icon>
					</v-list-item-avatar>
					<v-list-item-content>
						<v-list-item-title>Lemmabibliothek</v-list-item-title>
					</v-list-item-content>
					<v-list-item-action>
						<badge :content="store.lemma.lemmaCount" />
					</v-list-item-action>
				</v-list-item>
			</v-list>
			<!-- Abgaben -->
			<v-subheader :class="['pl-1', showIssues && 'active']" @click="showIssues = !showIssues">
				<v-icon class="mr-1" small>mdi-chevron-down</v-icon>
				Abgaben
			</v-subheader>
			<v-list v-show="showIssues" class="pa-0 ma-0 lemma-nav-list x-dense" color="transparent" nav>
				<v-list-item
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
					<v-list-item-avatar tile>
						<v-icon color="primary darken-1" small class="rotate-180">mdi-chart-box-outline</v-icon>
					</v-list-item-avatar>
					<v-list-item-content>
						<v-list-item-title>
							{{ issue.name }}
						</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
			<v-subheader
				:class="['pl-1', 'pr-0', showMyLists && 'active']"
				@click="showMyLists = !showMyLists"
				@dragenter.prevent="onDragEnter($event)"
				@dragover.prevent=""
				@drop.prevent="createLemmaList($event)"
			>
				<v-icon class="mr-1" small>mdi-chevron-down</v-icon>
				Meine Listen
				<v-spacer />
				<v-btn
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
					<v-icon class="ml-2" small>mdi-plus-circle-outline</v-icon>
				</v-btn>
			</v-subheader>
			<v-list v-show="showMyLists" class="pa-0 ma-0 lemma-nav-list x-dense" color="transparent" nav>
				<v-list-item
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
					<v-list-item-avatar tile>
						<v-icon color="primary darken-1" small>mdi-folder-text</v-icon>
					</v-list-item-avatar>
					<v-list-item-content>
						<v-list-item-title>
							{{ list.title }}
						</v-list-item-title>
					</v-list-item-content>
					<v-list-item-action>
						<transition name="roll">
							<badge :key="list.count" test-id="lemma-list-count" :content="list.count" />
						</transition>
					</v-list-item-action>
					<v-list-item-action v-if="list.countNew !== 0" class="ml-0">
						<badge :content="list.countNew ? '+' + list.countNew.toString() : '0'" />
					</v-list-item-action>
				</v-list-item>
			</v-list>
			<v-subheader
				:class="['pl-1', showTeamLists && 'active']"
				@click="showTeamLists = !showTeamLists"
			>
				<v-icon class="mr-1" small>mdi-chevron-down</v-icon>
				Team-Listen
			</v-subheader>
			<v-list
				v-show="showTeamLists"
				two-line
				class="pa-0 ma-0 lemma-nav-list x-dense"
				color="transparent"
				nav
			>
				<v-list-item
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
					<v-list-item-avatar tile>
						<v-icon color="primary darken-1" small>mdi-folder-text-outline</v-icon>
						<!-- <v-icon color="primary darken-1" small>mdi-rhombus-split</v-icon> -->
					</v-list-item-avatar>
					<v-list-item-content>
						<v-list-item-title>
							{{ list.title }}
						</v-list-item-title>
						<v-list-item-subtitle>
							{{ list.editor ? list.editor.name : "" }}
						</v-list-item-subtitle>
					</v-list-item-content>
					<v-list-item-action>
						<transition name="roll">
							<badge :key="list.count" :content="list.count" />
						</transition>
					</v-list-item-action>
				</v-list-item>
			</v-list>
			<v-subheader
				:class="['px-0', showQueries && 'active']"
				class="pl-1"
				@click="showQueries = !showQueries"
			>
				<v-icon class="mr-1" small>mdi-chevron-down</v-icon>
				Meine Abfragen
			</v-subheader>
			<v-list v-show="showQueries" class="pa-0 ma-0 lemma-nav-list x-dense" color="transparent" nav>
				<v-list-item
					v-for="(filter, i) in filteredStoredLemmaFilters"
					:key="'l' + i"
					:ripple="false"
					class="mb-0"
					:input-value="filter.id === store.lemma.selectedLemmaFilterId"
					@click="selectLemmaFilter(filter.id)"
				>
					<v-list-item-avatar tile>
						<v-icon color="primary darken-1" small>mdi-filter-variant</v-icon>
					</v-list-item-avatar>
					<v-list-item-content>
						<v-list-item-title>
							{{ filter.name }}
						</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</div>
		<div v-if="store.lemma.importStatus.isImporting">
			<v-divider />
			<div class="px-4 pb-5">
				<v-subheader class="pl-1">
					<div>Importiere …</div>
					<v-spacer />
					<div>
						({{ store.lemma.importStatus.status }} von {{ store.lemma.importStatus.target }})
					</div>
				</v-subheader>
				<v-progress-linear class="mt-0 rounded" :value="store.lemma.importStatus.progress * 100" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import _ from "lodash";
import { Component, Vue, Watch } from "vue-property-decorator";

import { requestState } from "@/api/core/request";
import { type List as LemmaList, type List } from "@/api/models/List";
import confirm from "@/store/confirm";
import prompt from "@/store/prompt";
import { type WithId } from "@/types";
import { type LemmaRow } from "@/types/lemma";
import LoadingSpinner from "@/views/lib/LoadingSpinner.vue";

import store from "../store";
import Badge from "./lib/Badge.vue";
import TextField from "./lib/TextField.vue";

@Component({
	components: {
		LoadingSpinner,
		Badge,
		TextField,
	},
})
export default class Sidebar extends Vue {
	searchQuery: string | null = null;
	editingNameKey: string | null = null;
	store = store;
	log = console.log;
	requestState = requestState;

	showLoader = false;

	showIssues = true;
	showMyLists = true;
	showTeamLists = true;
	showQueries = true;

	@Watch("requestState.isLoading")
	onChangeIsLoading(v: boolean, oldV: boolean) {
		if (v !== oldV) {
			setTimeout(() => {
				// if the loading value is still the same after
				// a set time, actually update the value.
				if (requestState.isLoading === v) {
					this.showLoader = v;
				}
			}, 300);
		}
	}

	onDragEnter(e: DragEvent, clickAfterLingering = false) {
		console.log("Dragenter!!");
		if (e.currentTarget instanceof HTMLElement) {
			const target = e.currentTarget;
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

	selectLemmaFilter(i: string) {
		store.lemma.selectedLemmaFilterId = i;
	}

	onEscSearch(e: KeyboardEvent) {
		if (this.searchQuery !== "" && this.searchQuery != null) {
			this.searchQuery = null;
		} else {
			if (e.target instanceof HTMLInputElement) {
				e.target.blur();
			}
		}
	}

	async loadIssue(issueId: number | null) {
		if (issueId != null) {
			store.lemma.selectedLemmaIssueId = issueId;
			store.issue.loadIssue(issueId);
		}
	}

	async loadIssueLemmas(issueId: number | null) {
		if (issueId != null) {
			store.lemma.selectedLemmaIssueId = issueId;
			const ls = await store.issue.getIssueLemmas(issueId);
			store.lemma.selectedIssueLemmas = ls;
		}
	}

	async deleteList(list: LemmaList) {
		if (list.id != null) {
			if (await confirm.confirm(`Liste ”${list.title}” löschen?`, { icon: "mdi-delete-outline" })) {
				store.lemma.deleteLemmaList(list.id);
			}
		}
	}

	async copyLemmasToList(list: WithId<List>, e: DragEvent) {
		console.log("copy lemma to list", e);
		console.log("data transfer!", e.dataTransfer?.getData("text/plain"));
		const lemmas = JSON.parse(e.dataTransfer?.getData("text/plain") || "[]") as Array<LemmaRow>;
		const listItems = store.lemma.getLemmasByList(list.id);
		const newLemmaList = _.uniq([...lemmas.map((l) => l.id), ...listItems]);
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

	async addLemmaToIssue(issueId: number, e: DragEvent) {
		const lemmas =
			e instanceof DragEvent
				? (JSON.parse(e.dataTransfer?.getData("text/plain") || "[]") as Array<LemmaRow>)
				: [];
		store.issue.addLemmaToIssue(issueId, lemmas);
	}

	async createLemmaList(e: DragEvent | MouseEvent) {
		const lemmas =
			e instanceof DragEvent
				? (JSON.parse(e.dataTransfer?.getData("text/plain") || "[]") as Array<LemmaRow>)
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
					this.filteredLemmaLists.findIndex(
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
		if (name != null) {
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

	get filteredStoredLemmaFilters() {
		if (this.searchQuery != null && this.searchQuery.trim() !== "") {
			return store.lemma.storedLemmaFilters.filter((l) =>
				l.name.toLocaleLowerCase().includes(this.searchQuery || ""),
			);
		} else {
			return store.lemma.storedLemmaFilters;
		}
	}

	get filteredLemmaLists() {
		if (this.searchQuery != null && this.searchQuery.trim() !== "") {
			return store.lemma.lemmaLists.filter((l) =>
				l.title.toLocaleLowerCase().includes(this.searchQuery || ""),
			);
		} else {
			return store.lemma.lemmaLists;
		}
	}

	get filteredLemmaListsCurrentUser() {
		return this.filteredLemmaLists.filter(
			(l) => l.editor != null && l.editor.userId === store.user.userProfile.userId,
		);
	}

	get filteredLemmaListsOtherUsers() {
		return this.filteredLemmaLists.filter(
			(l) => l.editor === undefined || l.editor.userId !== store.user.userProfile.userId,
		);
	}

	toggleDrawer() {
		this.store.settings = {
			...this.store.settings,
			showNavDrawer: !this.store.settings.showNavDrawer,
		};
	}
}
</script>

<style lang="stylus">

.droppable *
  pointer-events none !important
</style>

<style lang="stylus" scoped>

.sidebar:focus .v-list-item--active
.v-list-item--active:focus
  background var(--v-primary-base)
  color #fff

.drag-over
  box-shadow inset 0 0 0 3px var(--v-primary-base) !important

.v-subheader
  height 24px
  margin-top 16px
  margin-bottom 3px
  font-weight 500
  font-size 0.75rem
  opacity 80%
  cursor default
  user-select none

.v-subheader .v-icon
  width 10px
  transform rotate(-90deg)

.v-subheader.active .v-icon
  transform rotate(0deg)

.search-field /deep/ .v-icon.v-icon
  font-size 130%

.v-list-item
  min-height 32px !important

.v-list-item .v-list-item__content
  opacity 80%

.v-list-item__action
  margin 0

.lemma-nav-list /deep/ .v-list-group__header
  &::before
    opacity 0% !important

  .v-icon
    opacity 0%

  &:hover .v-icon
    opacity 100%

.lemma-nav-list
.lemma-nav-list /deep/ *
  cursor default !important

.roll-enter-active
.roll-leave-active
  position relative
  transition all 0.3s ease

.roll-enter
.roll-leave-to
  position absolute
  opacity 0%

.roll-enter
  transform translateY(20px)

.roll-leave-to
  transform translateY(-20px)
</style>
