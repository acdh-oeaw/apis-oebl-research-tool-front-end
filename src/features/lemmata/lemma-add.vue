<script lang="ts" setup>
import { debounce } from "@acdh-oeaw/lib";
import { clone } from "lodash";
import { computed, ref, watch } from "vue";

import LemmaDetails from "@/features/lemmata/details/lemma-details.vue";
import LobidPreviewCard from "@/features/lemmata/lobid-preview-card.vue";
import { getYear } from "@/lib/get-year";
import { findPerson } from "@/service/lobid";
import store from "@/store";
import { type LemmaRow } from "@/types/lemma";

const props = defineProps<{
	color?: string;
}>();

const emit = defineEmits<{
	(event: "confirm", lemma: LemmaRow, listId: number | null): void;
}>();

const importToList = computed(() => {
	return store.lemma.selectedLemmaListId || store.lemma.lemmaLists[0]!.id!;
});
const showDivider = ref(false);
const window = ref(0);
const possibleGnds = ref<Array<string>>([]);
const viewLemmaDetail = ref<LemmaRow | null>(null);

const emptyPerson: LemmaRow = {
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
	dateOfBirth: null,
	dateOfDeath: null,
	bioNote: null,
	kinship: null,
	religion: null,
	notes: null,
};

const person = ref(clone(emptyPerson));

function onScroll(e: MouseEvent) {
	if (e.target instanceof HTMLElement && e.target.scrollTop > 0) {
		showDivider.value = true;
	} else {
		showDivider.value = false;
	}
}

const lemmaLists = computed(() => {
	return store.lemma.lemmaLists.map((ll) => {
		return {
			text: ll.title,
			value: ll.id,
		};
	});
});

const filteredList = computed(() => {
	return store.lemma.lemmas.filter((l) => {
		let firstNameAlike = false;
		let lastNameAlike = false;
		const personFirstName = person.value.firstName ? person.value.firstName.toLowerCase() : "~";
		const personLastName = person.value.lastName ? person.value.lastName.toLowerCase() : "~";

		if (l.firstName) {
			firstNameAlike = l.firstName.startsWith(personFirstName);
		}

		if (l.lastName) {
			lastNameAlike = l.lastName.startsWith(personLastName);
		}

		return firstNameAlike || lastNameAlike;
	});
});

async function addLemma() {
	emit("confirm", person.value, importToList.value);
}

async function onChangePerson() {
	const dateOfBirth = getYear(person.value.dateOfBirth);
	const dateOfDeath = getYear(person.value.dateOfDeath);

	possibleGnds.value = (
		await findPerson({
			firstName: person.value.firstName,
			lastName: person.value.lastName,
			dateOfBirth: dateOfBirth ? String(dateOfBirth) : null,
			dateOfDeath: dateOfDeath ? String(dateOfDeath) : null,
			gnd: person.value.gnd,
		})
	).map((p) => (p as any).gndIdentifier);
}

const searchPerson = debounce(onChangePerson, 500);

watch(person, () => {
	searchPerson();
});
</script>

<template>
	<v-card :color="color" rounded="lg" class="soft-shadow">
		<VCardTitle>
			<VRow no-gutters>
				<VCol>
					<VBtn
						class="rounded-lg px-4"
						color="background darken-1"
						elevation="0"
						@click="$emit('cancel')"
					>
						Abbrechen
					</VBtn>
				</VCol>
				<VCol class="text-center">Lemma anlegen</VCol>
				<VCol class="text-right">
					<VBtn class="rounded-lg px-4" color="primary" elevation="0" @click="addLemma">
						Lemma hinzufügen
					</VBtn>
				</VCol>
			</VRow>
		</VCardTitle>

		<VDivider :style="{ opacity: showDivider ? 1 : 0, transition: '.5s opacity' }" />

		<VCardText class="pa-0 flex-grow-1 overflow-y-hidden fill-height">
			<VRow no-gutters class="fill-height">
				<VCol class="pa-5 fill-height overflow-y-auto" @scroll.passive="onScroll">
					<LemmaDetails
						:show-header="false"
						:value="person"
						@update="person = { ...person, ...$event }"
					/>
				</VCol>
				<VCol
					cols="5"
					class="background darken-1 pa-4 fill-height overflow-y-hidden rounded-lg mr-3"
				>
					<VWindow reverse class="pt-1 fill-height" :value="viewLemmaDetail == null ? 0 : 1">
						<VWindowItem class="fill-height" :value="0">
							<div class="d-flex flex-column fill-height">
								<VBtnToggle
									v-model="window"
									borderless
									active-class="background darken-3"
									mandatory
									class="mb-4 mt-4 transparent mx-auto"
								>
									<VBtn text rounded small class="rounded-lg mr-2">
										ÖBL/IRS
										<VBadge
											v-if="filteredList.length > 0"
											offset-x="-3"
											color="secondary"
											:content="filteredList.length.toString()"
										/>
									</VBtn>
									<VBtn text rounded small class="rounded-lg">
										GND-Suche
										<VBadge
											v-if="possibleGnds.length > 0"
											offset-x="-3"
											color="secondary"
											:content="possibleGnds.length.toString()"
										/>
									</VBtn>
								</VBtnToggle>

								<VWindow class="flex-grow-1 fill-height" reverse :value="window">
									<VWindowItem class="fill-height">
										<VOverlay
											v-if="filteredList.length === 0"
											absolute
											light
											style="color: #333"
											color="background darken-1"
											class="muted"
										>
											Keine ähnlichen Lemmata gefunden
										</VOverlay>

										<VList dense class="overflow-y-auto fill-height" color="transparent">
											<VListItem
												v-for="lemma in filteredList"
												:key="lemma.id"
												class="rounded-lg"
												dense
												@click="viewLemmaDetail = lemma"
											>
												<VListItemAvatar width="15">
													<span v-if="lemma.selected === true" style="color: var(--v-primary-base)">
														★
													</span>
													<span v-else style="opacity: 50%">☆</span>
												</VListItemAvatar>
												<VListItemContent>
													<VListItemTitle>
														{{ lemma.firstName }} {{ lemma.lastName }}
													</VListItemTitle>
													<VListItemSubtitle>
														{{ lemma.dateOfBirth }} - {{ lemma.dateOfDeath }}
													</VListItemSubtitle>
												</VListItemContent>
											</VListItem>
										</VList>
									</VWindowItem>

									<VWindowItem class="fill-height">
										<LobidPreviewCard
											class="fill-height overflow-y-auto"
											:value="person.gnd"
											:gnd="possibleGnds"
											@input="person.gnd = $event"
										/>

										<VOverlay
											v-if="possibleGnds.length === 0"
											light
											style="color: #333"
											color="background darken-1"
											class="muted"
											absolute
										>
											Keine GNDs bei Lobid gefunden
										</VOverlay>
									</VWindowItem>
								</VWindow>
							</div>
						</VWindowItem>

						<VWindowItem class="fill-height" :value="1">
							<div class="d-flex flex-column fill-height">
								<VBtn color="primary" text @click="viewLemmaDetail = null">
									<VIcon left>mdi-chevron-left</VIcon>
									Ergebnisse
								</VBtn>
								<LemmaDetails
									v-if="viewLemmaDetail != null"
									class="flex-grow-1 fill-height background mt-2"
									:value="viewLemmaDetail"
								/>
							</div>
						</VWindowItem>
					</VWindow>
				</VCol>
			</VRow>
		</VCardText>
	</v-card>
</template>
