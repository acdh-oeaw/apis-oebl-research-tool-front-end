<template>
	<v-card :color="color" rounded="lg" class="soft-shadow">
		<v-card-title>
			<v-row no-gutters>
				<v-col>
					<v-btn
						class="rounded-lg px-4"
						color="background darken-1"
						elevation="0"
						@click="$emit('cancel')"
					>
						Abbrechen
					</v-btn>
				</v-col>
				<v-col class="text-center">Lemma anlegen</v-col>
				<v-col class="text-right">
					<v-btn class="rounded-lg px-4" color="primary" elevation="0" @click="addLemma">
						Lemma hinzufügen
					</v-btn>
				</v-col>
			</v-row>
		</v-card-title>
		<v-divider :style="{ opacity: showDivider ? 1 : 0, transition: '.5s opacity' }" />
		<v-card-text class="pa-0 flex-grow-1 overflow-y-hidden fill-height">
			<v-row no-gutters class="fill-height">
				<v-col class="pa-5 fill-height overflow-y-auto" @scroll.passive="onScroll">
					<lemma-detail
						:show-header="false"
						:value="person"
						@update="person = { ...person, ...$event }"
					/>
				</v-col>
				<v-col
					cols="5"
					class="background darken-1 pa-4 fill-height overflow-y-hidden rounded-lg mr-3"
				>
					<v-window reverse class="pt-1 fill-height" :value="viewLemmaDetail === null ? 0 : 1">
						<v-window-item class="fill-height" :value="0">
							<div class="d-flex flex-column fill-height">
								<v-btn-toggle
									v-model="window"
									borderless
									active-class="background darken-3"
									mandatory
									class="mb-4 mt-4 transparent mx-auto"
								>
									<v-btn text rounded small class="rounded-lg mr-2">
										ÖBL/IRS
										<v-badge
											v-if="filteredList.length > 0"
											offset-x="-3"
											color="secondary"
											:content="filteredList.length.toString()"
										/>
									</v-btn>
									<v-btn text rounded small class="rounded-lg">
										GND-Suche
										<v-badge
											v-if="possibleGnds.length > 0"
											offset-x="-3"
											color="secondary"
											:content="possibleGnds.length.toString()"
										/>
									</v-btn>
								</v-btn-toggle>
								<v-window class="flex-grow-1 fill-height" reverse :value="window">
									<v-window-item class="fill-height">
										<v-overlay
											v-if="filteredList.length === 0"
											absolute
											light
											style="color: #333"
											color="background darken-1"
											class="muted"
										>
											Keine ähnlichen Lemmata gefunden
										</v-overlay>
										<v-list dense class="overflow-y-auto fill-height" color="transparent">
											<v-list-item
												v-for="lemma in filteredList"
												:key="lemma.id"
												class="rounded-lg"
												dense
												@click="viewLemmaDetail = lemma"
											>
												<v-list-item-avatar width="15">
													<span v-if="lemma.selected === true" style="color: var(--v-primary-base)">
														★
													</span>
													<span v-else style="opacity: 50%">☆</span>
												</v-list-item-avatar>
												<v-list-item-content>
													<v-list-item-title>
														{{ lemma.firstName }} {{ lemma.lastName }}
													</v-list-item-title>
													<v-list-item-subtitle>
														{{ lemma.dateOfBirth }} - {{ lemma.dateOfDeath }}
													</v-list-item-subtitle>
												</v-list-item-content>
											</v-list-item>
										</v-list>
									</v-window-item>
									<v-window-item class="fill-height">
										<lobid-preview-card
											class="fill-height overflow-y-auto"
											:value="person.gnd"
											:gnd="possibleGnds"
											@input="person.gnd = $event"
										/>
										<v-overlay
											v-if="possibleGnds.length === 0"
											light
											style="color: #333"
											color="background darken-1"
											class="muted"
											absolute
										>
											Keine GNDs bei Lobid gefunden
										</v-overlay>
									</v-window-item>
								</v-window>
							</div>
						</v-window-item>
						<v-window-item class="fill-height" :value="1">
							<div class="d-flex flex-column fill-height">
								<v-btn color="primary" text @click="viewLemmaDetail = null">
									<v-icon left>mdi-chevron-left</v-icon>
									Ergebnisse
								</v-btn>
								<lemma-detail
									v-if="viewLemmaDetail != null"
									class="flex-grow-1 fill-height background mt-2"
									:value="viewLemmaDetail"
								/>
							</div>
						</v-window-item>
					</v-window>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script lang="ts">
import _ from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { findPerson } from "@/service/lobid";
import store from "@/store";
import { type LemmaRow } from "@/types/lemma";
import { DateContainer } from "@/util/dates";

import TextField from "../lib/TextField.vue";
import LemmaDetail from "./LemmaDetail.vue";
import LobidPreviewCard from "./LobidPreviewCard.vue";

@Component({
	components: {
		LobidPreviewCard,
		TextField,
		LemmaDetail,
	},
})
export default class LemmaAdd extends Vue {
	@Prop({ default: undefined }) color!: string | undefined;

	importToList: number = store.lemma.selectedLemmaListId || store.lemma.lemmaLists[0]!.id!;
	window = 0;
	showDivider = false;
	store = store;
	possibleGnds: Array<string> = [];
	viewLemmaDetail: LemmaRow | null = null;

	emptyPerson: LemmaRow = {
		id: -1,
		firstName: "",
		lastName: "",
		alternativeNames: [],
		gender: undefined,
		columns_user: {},
		columns_scrape: {},
		loc: null,
		selected: false,
		viaf_id: null,
		wiki_edits: null,
		gnd: [],
		legacyGideonCitations: null,
		secondaryLiterature: [],
		zoteroKeysBy: [],
		zoteroKeysAbout: [],
		professionDetail: "",
		professionGroup: {},
		dateOfBirth: new DateContainer(),
		dateOfDeath: new DateContainer(),
		bioNote: null,
		kinship: null,
		religion: null,
		notes: null,
	};

	person = _.clone(this.emptyPerson);

	onScroll(e: MouseEvent) {
		if (e.target instanceof HTMLElement && e.target.scrollTop > 0) {
			this.showDivider = true;
		} else {
			this.showDivider = false;
		}
	}

	get lemmaLists() {
		return this.store.lemma.lemmaLists.map((ll) => {
			return {
				text: ll.title,
				value: ll.id,
			};
		});
	}

	get filteredList() {
		return store.lemma.lemmas.filter((l) => {
			let firstNameAlike = false;
			let lastNameAlike = false;
			const personFirstName = this.person.firstName ? this.person.firstName.toLowerCase() : "~";
			const personLastName = this.person.lastName ? this.person.lastName.toLowerCase() : "~";

			if (l.firstName) {
				firstNameAlike = l.firstName.startsWith(personFirstName);
			}

			if (l.lastName) {
				lastNameAlike = l.lastName.startsWith(personLastName);
			}

			return firstNameAlike || lastNameAlike;
		});
	}

	async addLemma() {
		this.$emit("confirm", this.person, this.importToList);
	}

	async onChangePerson() {
		this.possibleGnds = (
			await findPerson({
				firstName: this.person.firstName,
				lastName: this.person.lastName,
				dateOfBirth:
					this.person.dateOfBirth.calendarYear === undefined
						? null
						: String(this.person.dateOfBirth.calendarYear),
				dateOfDeath:
					this.person.dateOfDeath.calendarYear === undefined
						? null
						: String(this.person.dateOfDeath.calendarYear),
				gnd: this.person.gnd,
			})
		).map((p) => (p as any).gndIdentifier);
	}

	searchPerson = _.debounce(this.onChangePerson, 500);

	@Watch("person")
	personWatcher() {
		this.searchPerson();
	}
}
</script>

<style lang="scss" scoped></style>
