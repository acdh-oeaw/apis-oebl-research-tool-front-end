<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { convertZoteroItemToView, ZoteroLemmaManagmentController } from "@/service/zotero";
import store from "@/store";
import { LemmaDatabase, unserializeLemmaRow } from "@/store/lemma";
import { type LemmaRow } from "@/types/lemma";
import { type ZoteroView } from "@/types/zotero";
import { lemmaRowTranslations } from "@/util/labels";
import LemmaScrapeResult from "@/views/LemmaManager/LemmaScrapeResult.vue";
import LobidPreviewCard from "@/views/LemmaManager/LobidPreviewCard.vue";

store.settings.showNavDrawer = false;
const db = new LemmaDatabase();
const zoteroBy: ZoteroLemmaManagmentController = new ZoteroLemmaManagmentController();
const zoteroAbout: ZoteroLemmaManagmentController = new ZoteroLemmaManagmentController();

@Component({
	components: {
		LobidPreviewCard,
		LemmaScrapeResult,
	},
})
export default class LemmaPrintView extends Vue {
	@Prop() lemmaId!: number;
	lemma: LemmaRow | null = null;
	labels = lemmaRowTranslations;

	zoteroCitationsBy: Array<ZoteroView> = [];
	zoteroCitationsAbout: Array<ZoteroView> = [];

	print() {
		window.print();
	}

	// load data
	beforeCreate() {
		db.lemmas
			.get(Number(this.$route.params["lemmaId"]))
			.then((serializedLemmaRow) => {
				if (serializedLemmaRow === undefined) {
					window.alert(`Das Lemma mit der id <${this.lemmaId}> konnte nicht gefunden werden`);
					throw new Error(`Could not find Lemma with id <${this.lemmaId}>`);
				}
				this.lemma = unserializeLemmaRow(serializedLemmaRow);
				zoteroBy
					.load(this.lemma.zoteroKeysBy)
					.then((z) => (this.zoteroCitationsBy = z.zoteroItems.map(convertZoteroItemToView)));
				zoteroAbout
					.load(this.lemma.zoteroKeysAbout)
					.then((z) => (this.zoteroCitationsAbout = z.zoteroItems.map(convertZoteroItemToView)));
			})
			.catch((error) => {
				window.alert("Die Datenbank konnt nicht geladen werden.");
				window.console.error({
					message: "Could not select from db",
					lemmaId: this.lemmaId,
					error,
				});
				throw new Error();
			});
	}
}
</script>

<template>
	<v-container class="lemma-print-view-container">
		<section v-if="lemma !== null" class="lemma-print-view">
			<v-row>
				<v-col cols="11">
					<h1>
						<span class="last-name-title">{{ lemma.lastName }}</span>
						<span v-if="lemma.firstName" class="first-name-title">{{ lemma.firstName }}</span>
					</h1>
				</v-col>
				<v-spacer></v-spacer>
				<v-col class="print-button" cols="1">
					<v-btn icon @click="print">
						<v-icon>mdi-printer</v-icon>
					</v-btn>
				</v-col>
			</v-row>
			<section class="main-data">
				<v-row>
					<v-col>
						<h2>Basisinformationen</h2>
					</v-col>
				</v-row>
				<div class="main-data">
					<div class="name">
						<v-row>
							<v-col>
								<h3>Name</h3>
							</v-col>
						</v-row>
						<v-row class="primary-name" justify="start">
							<v-col class="field last-name" cols="3">
								<span class="fieldname">
									<!-- @vue-expect-error -->
									{{ labels.lastName.de }}
								</span>
								<span class="fieldvalue">{{ lemma.lastName }}</span>
							</v-col>
							<v-col class="field first-name" cols="3">
								<span class="fieldname">
									<!-- @vue-expect-error -->
									{{ labels.firstName.de }}
								</span>
								<span class="fieldvalue">{{ lemma.firstName }}</span>
							</v-col>
						</v-row>
						<v-row class="alternative-names" justify="start">
							<v-col cols="3">
								<div class="fieldname">
									<!-- @vue-expect-error -->
									{{ labels.alternativeNames.de }}
								</div>
							</v-col>
							<v-col cols="9" class="alternative-names-wrapper-column">
								<!-- keep right of fieldname, even when they have more than one line. Seems overly complicated, but I do not know, how to do it better -->
								<v-container class="alternative-names-wrapper-container">
									<v-row class="alternative-names-wrapper-row">
										<div
											v-for="(alternativeName, index) in lemma.alternativeNames"
											:key="`alternativeNameNo_${index}`"
											class="field alternative-name"
										>
											<v-col cols="1" class="field alternative-last-name">
												<div class="fieldname">
													<!-- @vue-expect-error -->
													{{ labels.lastName.de }}
												</div>
												<div class="fieldvalue">{{ alternativeName.lastName }}</div>
											</v-col>
											<v-col cols="1" class="field alternative-first-name">
												<div class="fieldname">
													<!-- @vue-expect-error -->
													{{ labels.firstName.de }}
												</div>
												<div class="fieldvalue">{{ alternativeName.firstName }}</div>
											</v-col>
										</div>
									</v-row>
								</v-container>
							</v-col>
						</v-row>
						<v-row class="demographic-row-1" justify="start">
							<v-col cols="3">
								<div class="field gender">
									<span class="fieldname">
										<!-- @vue-expect-error -->
										{{ labels.gender.de }}
									</span>
									<span class="fieldvalue">{{ lemma.gender }}</span>
								</div>
							</v-col>
							<v-col cols="4">
								<div class="field dateOfBirth">
									<span class="fieldname">
										<!-- @vue-expect-error -->
										{{ labels.dateOfBirth.de }}
									</span>
									<span class="fieldvalue">{{ lemma.dateOfBirth }}</span>
								</div>
							</v-col>
							<v-col cols="4">
								<div class="field dateOfDeath">
									<span class="fieldname">
										<!-- @vue-expect-error -->
										{{ labels.dateOfDeath.de }}
									</span>
									<span class="fieldvalue">{{ lemma.dateOfDeath }}</span>
								</div>
							</v-col>
						</v-row>
						<v-row class="demographic-row-2" justify="start">
							<v-col cols="3">
								<div class="field professionGroup">
									<span class="fieldname">
										<!-- @vue-expect-error -->
										{{ labels.professionGroup.de }}
									</span>
									<span class="fieldvalue">
										{{ lemma.professionGroup ? lemma.professionGroup.name : "" }}
									</span>
								</div>
							</v-col>
							<v-col cols="4">
								<div class="field professionDetail">
									<span class="fieldname">
										<!-- @vue-expect-error -->
										{{ labels.professionDetail.de }}
									</span>
									<span class="fieldvalue">{{ lemma.professionDetail }}</span>
								</div>
							</v-col>
							<v-col cols="4">
								<div class="field religion">
									<span class="fieldname">
										<!-- @vue-expect-error -->
										{{ labels.religion.de }}
									</span>
									<span class="fieldvalue">{{ lemma.religion }}</span>
								</div>
							</v-col>
						</v-row>
						<v-row>
							<v-col>
								<div class="field kinship">
									<div class="fieldname">
										<!-- @vue-expect-error -->
										{{ labels.kinship.de }}
									</div>
									<div class="fieldvalue">{{ lemma.kinship }}</div>
								</div>
							</v-col>
						</v-row>
						<v-row>
							<v-col>
								<div class="field bioNote">
									<div class="fieldname">
										<!-- @vue-expect-error -->
										{{ labels.bioNote.de }}
									</div>
									<div class="fieldvalue">{{ lemma.bioNote }}</div>
								</div>
							</v-col>
						</v-row>
					</div>
				</div>
			</section>
			<section class="literature">
				<v-row>
					<v-col>
						<h2>
							<!-- @vue-expect-error -->
							{{ labels.secondaryLiterature.de }}
						</h2>
					</v-col>
				</v-row>
				<div class="field zoteroKeysBy">
					<v-row>
						<v-col>
							<div class="fieldname">
								<!-- @vue-expect-error -->
								"{{ labels.zoteroKeysBy.de }}" ({{ zoteroCitationsBy.length }})
							</div>
						</v-col>
					</v-row>
					<div class="fieldvalue">
						<v-row
							v-for="(zoteroView, index) in zoteroCitationsBy"
							:key="`zoteroCitationBy_${index}`"
							class="zotero-citation"
						>
							<v-col>{{ zoteroView.citation }}</v-col>
						</v-row>
					</div>
				</div>
				<div class="field zoteroCitationsAbout">
					<v-row>
						<v-col>
							<div class="fieldname">
								<!-- @vue-expect-error -->
								"{{ labels.zoteroKeysAbout.de }}" ({{ zoteroCitationsAbout.length }})
							</div>
						</v-col>
					</v-row>
					<div class="fieldvalue">
						<v-row
							v-for="(zoteroView, index) in zoteroCitationsAbout"
							:key="`zoteroCitationAbout_${index}`"
							class="zotero-citation"
						>
							<v-col>{{ zoteroView.citation }}</v-col>
						</v-row>
					</div>
				</div>
			</section>
			<section class="external-resources">
				<v-row>
					<v-col><h2>Externe Ressourcen</h2></v-col>
				</v-row>
				<v-row>
					<v-col><h3>GND</h3></v-col>
				</v-row>
				<v-row>
					<v-col>
						<lobid-preview-card
							v-if="lemma.gnd.length > 0"
							:limit="1"
							:gnd="lemma.gnd"
							:show-full-link="true"
						/>
					</v-col>
				</v-row>
				<div v-if="lemma.columns_scrape" class="scrape-data">
					<lemma-scrape-result
						v-for="(source, sourceName) in lemma.columns_scrape"
						:key="sourceName"
						:value="source"
						:title="sourceName"
						:default-expand="true"
					/>
				</div>
			</section>
		</section>
	</v-container>
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
