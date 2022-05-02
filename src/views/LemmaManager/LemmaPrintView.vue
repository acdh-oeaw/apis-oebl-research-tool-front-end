<template>
  <div class="lemma-print-view-container">
    <section v-if="lemma !== null" class="lemma-print-view">
      <h1>
        <span class="last-name-title">{{ lemma.lastName }}</span>
        <span v-if="lemma.firstName" class="first-name-title">{{
          lemma.firstName
        }}</span>
      </h1>
      <section class="main-data">
        <h2>Basisinformationen</h2>
        <div class="main-data">
          <div class="name">
            <h3>Name</h3>
            <div class="primary-name">
              <div class="field last-name">
                <div class="fieldname">{{ labels.lastName.de }}</div>
                <div class="fieldvalue">{{ lemma.lastName }}</div>
              </div>
              <div class="field first-name">
                <div class="fieldname">{{ labels.firstName.de }}</div>
                <div class="fieldvalue">{{ lemma.firstName }}</div>
              </div>
            </div>
            <div class="alternative-names">
              <h3>{{ labels.alternativeNames.de }}</h3>
              <div
                v-for="(alternativeName, index) in lemma.alternativeNames"
                :key="`alternativeNameNo_${index}`"
              >
                <div class="field alternative-last-name">
                  <div class="fieldname">{{ labels.lastName.de }}</div>
                  <div class="fieldvalue">{{ alternativeName.lastName }}</div>
                </div>
                <div class="field alternative-first-name">
                  <div class="fieldname">{{ labels.firstName.de }}</div>
                  <div class="fieldvalue">{{ alternativeName.firstName }}</div>
                </div>
              </div>
            </div>
            <div class="field gender">
              <div class="fieldname">{{ labels.gender.de }}</div>
              <div class="fieldvalue">{{ lemma.gender }}</div>
            </div>
            <div class="field dateOfBirth">
              <div class="fieldname">{{ labels.dateOfBirth.de }}</div>
              <div class="fieldvalue">{{ lemma.dateOfBirth }}</div>
            </div>
            <div class="field dateOfDeath">
              <div class="fieldname">{{ labels.dateOfDeath.de }}</div>
              <div class="fieldvalue">{{ lemma.dateOfDeath }}</div>
            </div>
            <div class="field kinship">
              <div class="fieldname">{{ labels.kinship.de }}</div>
              <div class="fieldvalue">{{ lemma.kinship }}</div>
            </div>
            <div class="field religion">
              <div class="fieldname">{{ labels.religion.de }}</div>
              <div class="fieldvalue">{{ lemma.religion }}</div>
            </div>
            <div class="field professionDetail">
              <div class="fieldname">{{ labels.professionDetail.de }}</div>
              <div class="fieldvalue">{{ lemma.professionDetail }}</div>
            </div>
            <div class="field professionGroup">
              <div class="fieldname">{{ labels.professionGroup.de }}</div>
              <div class="fieldvalue">
                {{ lemma.professionGroup ? lemma.professionGroup.name : "" }}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="literature">
        <h2>{{ labels.secondaryLiterature.de }}</h2>
        <div class="field zoteroKeysBy">
          <div class="fieldname">{{ labels.zoteroKeysBy.de }}</div>
          <div class="fieldvalue">
            <span
              v-for="(zoteroView, index) in zoteroCitationsBy"
              :key="`zoteroCitationBy_${index}`"
              class="zotero-citation"
              >{{ zoteroView.citation }}</span
            >
          </div>
        </div>
        <div class="field zoteroCitationsAbout">
          <div class="fieldname">{{ labels.zoteroKeysAbout.de }}</div>
          <div class="fieldvalue">
            <span
              v-for="(zoteroView, index) in zoteroCitationsAbout"
              :key="`zoteroCitationAbout_${index}`"
              class="zotero-citation"
              >{{ zoteroView.citation }}</span
            >
          </div>
        </div>
      </section>
      <section class="external-resources">
        <h2>Externe Ressourcen</h2>
        <lobid-preview-card
          v-if="lemma.gnd.length > 0"
          :limit="1"
          :gnd="lemma.gnd" 
        />
        <div 
          v-if="lemma.columns_scrape"
          class="scrape-data">
          <lemma-scrape-result
            v-for="(source, sourceName) in lemma.columns_scrape"
            :key="sourceName"
            :value="source"
            :title="sourceName" 
          />
        </div>
      </section>
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import { LemmaRow } from "@/types/lemma";
import { LemmaDatabase, unserializeLemmaRow } from "@/store/lemma";
import { lemmaRowTranslations } from "@/util/labels";
import {
  convertZoteroItemToView,
  ZoteroLemmaManagmentController,
} from "@/service/zotero";
import { ZoteroView } from "@/types/zotero";

import LobidPreviewCard from './LobidPreviewCard.vue';
import LemmaScrapeResult from './LemmaScrapeResult.vue';


const db = new LemmaDatabase();
const zoteroBy: ZoteroLemmaManagmentController =
  new ZoteroLemmaManagmentController();
const zoteroAbout: ZoteroLemmaManagmentController =
  new ZoteroLemmaManagmentController();

@Component({
  components: {
    LobidPreviewCard,
    LemmaScrapeResult,
  }
})
export default class LemmaPrintView extends Vue {
  @Prop() lemmaId!: number;
  lemma: null | LemmaRow = null;
  labels = lemmaRowTranslations;

  zoteroCitationsBy: ZoteroView[] = [];
  zoteroCitationsAbout: ZoteroView[] = [];

  // load data
  beforeCreate() {
    db.lemmas
      .get(Number(this.$route.params["lemmaId"]))
      .then((serializedLemmaRow) => {
        if (serializedLemmaRow === undefined) {
          window.alert(
            `Das Lemma mit der id <${this.lemmaId}> konnte nicht gefunden werden`
          );
          throw new Error(`Could not find Lemma with id <${this.lemmaId}>`);
        }
        this.lemma = unserializeLemmaRow(serializedLemmaRow);
        zoteroBy
          .load(this.lemma.zoteroKeysBy)
          .then(
            (z) =>
              (this.zoteroCitationsBy = z.zoteroItems.map(
                convertZoteroItemToView
              ))
          );
        zoteroAbout
          .load(this.lemma.zoteroKeysAbout)
          .then(
            (z) =>
              (this.zoteroCitationsAbout = z.zoteroItems.map(
                convertZoteroItemToView
              ))
          );
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
<style scoped>
.first-name-title::before {
  content: ", ";
}

.left-align {
  margin-left: 1em;
}

.fieldname {
  font-weight: 600;
}

.fieldname::after {
  content: ":";
}
</style>
