<script lang="ts" setup>
import { ref } from "vue";

import LemmaScrapeResult from "@/features/lemmata/lemma-scrape-result.vue";
import LobidPreviewCard from "@/features/lemmata/lobid-preview-card.vue";
import { convertZoteroItemToView, ZoteroLemmaManagmentController } from "@/service/zotero";
import store from "@/store";
import { LemmaDatabase } from "@/store/lemma";
import { type LemmaRow } from "@/types/lemma";
import { type ZoteroView } from "@/types/zotero";
import { lemmaRowTranslations } from "@/util/labels";

// FIXME: why is this needed when we have ?minimal search param?
store.settings.showNavDrawer = false;
const db = new LemmaDatabase();
const zoteroBy = new ZoteroLemmaManagmentController();
const zoteroAbout = new ZoteroLemmaManagmentController();

const props = defineProps<{
	id: number;
}>();

const lemma = ref<LemmaRow | null>(null);
const labels = lemmaRowTranslations;

const zoteroCitationsBy = ref<Array<ZoteroView>>([]);
const zoteroCitationsAbout = ref<Array<ZoteroView>>([]);

function print() {
	window.print();
}

db.lemmas
	.get(props.id)
	.then((lemmaRow) => {
		if (lemmaRow == null) {
			window.alert(`Das Lemma mit der id <${props.id}> konnte nicht gefunden werden`);

			throw new Error(`Could not find Lemma with id <${props.id}>`);
		}

		lemma.value = lemmaRow;

		zoteroBy.load(lemmaRow.zoteroKeysBy).then((z) => {
			zoteroCitationsBy.value = z.zoteroItems.map(convertZoteroItemToView);
		});

		zoteroAbout.load(lemmaRow.zoteroKeysAbout).then((z) => {
			zoteroCitationsAbout.value = z.zoteroItems.map(convertZoteroItemToView);
		});
	})
	.catch((error) => {
		window.alert("Die Datenbank konnt nicht geladen werden.");

		console.error({
			message: "Could not select from db",
			lemmaId: props.id,
			error,
		});

		throw new Error("Could not select from db");
	});
</script>

<template>
	<VContainer class="lemma-print-view-container">
		<section v-if="lemma !== null" class="lemma-print-view">
			<VRow>
				<VCol cols="11">
					<h1>
						<span class="last-name-title">{{ lemma.lastName }}</span>
						<span v-if="lemma.firstName" class="first-name-title">{{ lemma.firstName }}</span>
					</h1>
				</VCol>
				<v-spacer></v-spacer>
				<VCol class="print-button" cols="1">
					<VBtn icon @click="print">
						<VIcon>mdi-printer</VIcon>
					</VBtn>
				</VCol>
			</VRow>

			<section class="main-data">
				<VRow>
					<VCol>
						<h2>Basisinformationen</h2>
					</VCol>
				</VRow>
				<div class="main-data">
					<div class="name">
						<VRow>
							<VCol>
								<h3>Name</h3>
							</VCol>
						</VRow>
						<VRow class="primary-name" justify="start">
							<VCol class="field last-name" cols="3">
								<span class="fieldname">
									{{ labels.lastName.de }}
								</span>
								<span class="fieldvalue">{{ lemma.lastName }}</span>
							</VCol>
							<VCol class="field first-name" cols="3">
								<span class="fieldname">
									{{ labels.firstName.de }}
								</span>
								<span class="fieldvalue">{{ lemma.firstName }}</span>
							</VCol>
						</VRow>
						<VRow class="alternative-names" justify="start">
							<VCol cols="3">
								<div class="fieldname">
									{{ labels.alternativeNames.de }}
								</div>
							</VCol>
							<VCol cols="9" class="alternative-names-wrapper-column">
								<!-- keep right of fieldname, even when they have more than one line. Seems overly complicated, but I do not know, how to do it better -->
								<VContainer class="alternative-names-wrapper-container">
									<VRow class="alternative-names-wrapper-row">
										<div
											v-for="(alternativeName, index) in lemma.alternativeNames"
											:key="`alternativeNameNo_${index}`"
											class="field alternative-name"
										>
											<VCol cols="1" class="field alternative-last-name">
												<div class="fieldname">
													{{ labels.lastName.de }}
												</div>
												<div class="fieldvalue">{{ alternativeName.lastName }}</div>
											</VCol>
											<VCol cols="1" class="field alternative-first-name">
												<div class="fieldname">
													{{ labels.firstName.de }}
												</div>
												<div class="fieldvalue">{{ alternativeName.firstName }}</div>
											</VCol>
										</div>
									</VRow>
								</VContainer>
							</VCol>
						</VRow>
						<VRow class="demographic-row-1" justify="start">
							<VCol cols="3">
								<div class="field gender">
									<span class="fieldname">
										{{ labels.gender.de }}
									</span>
									<span class="fieldvalue">{{ lemma.gender }}</span>
								</div>
							</VCol>
							<VCol cols="4">
								<div class="field dateOfBirth">
									<span class="fieldname">
										{{ labels.dateOfBirth.de }}
									</span>
									<span class="fieldvalue">{{ lemma.dateOfBirth }}</span>
								</div>
							</VCol>
							<VCol cols="4">
								<div class="field dateOfDeath">
									<span class="fieldname">
										{{ labels.dateOfDeath.de }}
									</span>
									<span class="fieldvalue">{{ lemma.dateOfDeath }}</span>
								</div>
							</VCol>
						</VRow>
						<VRow class="demographic-row-2" justify="start">
							<VCol cols="3">
								<div class="field professionGroup">
									<span class="fieldname">
										{{ labels.professionGroup.de }}
									</span>
									<span class="fieldvalue">
										{{ lemma.professionGroup ? lemma.professionGroup.name : "" }}
									</span>
								</div>
							</VCol>
							<VCol cols="4">
								<div class="field professionDetail">
									<span class="fieldname">
										{{ labels.professionDetail.de }}
									</span>
									<span class="fieldvalue">{{ lemma.professionDetail }}</span>
								</div>
							</VCol>
							<VCol cols="4">
								<div class="field religion">
									<span class="fieldname">
										{{ labels.religion.de }}
									</span>
									<span class="fieldvalue">{{ lemma.religion }}</span>
								</div>
							</VCol>
						</VRow>
						<VRow>
							<VCol>
								<div class="field kinship">
									<div class="fieldname">
										{{ labels.kinship.de }}
									</div>
									<div class="fieldvalue">{{ lemma.kinship }}</div>
								</div>
							</VCol>
						</VRow>
						<VRow>
							<VCol>
								<div class="field bioNote">
									<div class="fieldname">
										{{ labels.bioNote.de }}
									</div>
									<div class="fieldvalue">{{ lemma.bioNote }}</div>
								</div>
							</VCol>
						</VRow>
					</div>
				</div>
			</section>

			<section class="literature">
				<VRow>
					<VCol>
						<h2>
							{{ labels.secondaryLiterature.de }}
						</h2>
					</VCol>
				</VRow>
				<div class="field zoteroKeysBy">
					<VRow>
						<VCol>
							<div class="fieldname">
								"{{ labels.zoteroKeysBy.de }}" ({{ zoteroCitationsBy.length }})
							</div>
						</VCol>
					</VRow>
					<div class="fieldvalue">
						<VRow
							v-for="(zoteroView, index) in zoteroCitationsBy"
							:key="`zoteroCitationBy_${index}`"
							class="zotero-citation"
						>
							<VCol>{{ zoteroView.citation }}</VCol>
						</VRow>
					</div>
				</div>
				<div class="field zoteroCitationsAbout">
					<VRow>
						<VCol>
							<div class="fieldname">
								"{{ labels.zoteroKeysAbout.de }}" ({{ zoteroCitationsAbout.length }})
							</div>
						</VCol>
					</VRow>
					<div class="fieldvalue">
						<VRow
							v-for="(zoteroView, index) in zoteroCitationsAbout"
							:key="`zoteroCitationAbout_${index}`"
							class="zotero-citation"
						>
							<VCol>{{ zoteroView.citation }}</VCol>
						</VRow>
					</div>
				</div>
			</section>

			<section class="external-resources">
				<VRow>
					<VCol><h2>Externe Ressourcen</h2></VCol>
				</VRow>
				<VRow>
					<VCol><h3>GND</h3></VCol>
				</VRow>
				<VRow>
					<VCol>
						<LobidPreviewCard
							v-if="lemma.gnd.length > 0"
							:limit="1"
							:gnd="lemma.gnd"
							:show-full-link="true"
						/>
					</VCol>
				</VRow>
				<div v-if="lemma.columns_scrape" class="scrape-data">
					<LemmaScrapeResult
						v-for="(source, sourceName) in lemma.columns_scrape"
						:key="sourceName"
						:value="source"
						:title="sourceName"
						:default-expand="true"
					/>
				</div>
			</section>
		</section>
	</VContainer>
</template>

<style scoped>
.first-name-title::before {
	content: ", ";
}

.left-align {
	margin-left: 1em;
}

.fieldname {
	margin-right: 1em;
	font-weight: 600;
}

.fieldname::after {
	content: ":";
}

.alternative-names h3::after {
	content: ":";
}

.alternative-names .field .fieldname {
	display: none;
}

.alternative-names .field,
.alternative-names .fieldvalue {
	display: inline;
}

.field.alternative-name .fieldvalue:empty::after {
	content: "(N/A)";
	font-style: italic;
}

.field.alternative-last-name::after {
	content: ",";
}

.field.alternative-name::after {
	content: ";";
}

.field.alternative-first-name {
	padding-right: 0;
}

.field.alternative-last-name {
	padding-right: 0;
}

.external-resources :deep(a),
.scrape-data :deep(div[role="button"]) {
	color: hsl(0deg 0% 0%);
}

@media print {
	.print-button {
		display: none;
	}
}
</style>
