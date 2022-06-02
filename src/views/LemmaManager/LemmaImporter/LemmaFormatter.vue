<template>
  <div class="lemma-formatter-container">
    <v-container>
      <v-row class="lemma-formatting-options">
        <v-col>
          <v-expansion-panels multiple>
            <v-expansion-panel class="null-managment-row">
              <v-expansion-panel-header>Null-Werte</v-expansion-panel-header>
              <v-expansion-panel-content eager>
                <null-manager
                  :lemmaPrototypes="lemmaPrototypes"
                  :preloadedNullValues="localOptions.nullValues"
                  @options="localOptions.nullValues = $event"
                  @data="lemmasPrototypesWithNullsAndRequiredFields = $event"
                  @missingRowsIndexes="missingRowsIndexes = $event"
                />
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header
                >Datumsformattierung</v-expansion-panel-header
              >
              <v-expansion-panel-content eager>
                <date-formatter
                  :lemmaPrototypes="lemmasPrototypesWithNullsAndRequiredFields"
                  :preloadedDateFormatOption="localOptions.dateFormat"
                  @data="dates = $event"
                  @options="localOptions.dateFormat = $event"
                />
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Gender</v-expansion-panel-header>
              <v-expansion-panel-content eager>
                <gender-mapper
                  :lemmaPrototypes="lemmasPrototypesWithNullsAndRequiredFields"
                  :preloadedOptions="localOptions.genderMapping"
                  @data="genders = $event"
                  @options="localOptions.genderMapping = $event"
                />
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
      <v-row class="submit-lemma-formatting-row">
          <v-col>
              <v-btn
                @click="submit"
              >Weiter</v-btn>
          </v-col>
      </v-row>
      <v-row class="lemma-formatting-preview-row">
        <v-col>
          <lemma-previewer
              :lemmas="newLemmas"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { NewLemmaRow } from "@/types/lemma";
import {
  LemmaPrototypeStringType,
  LemmaPrototypeRequiredFieldsType,
  LemmaDates,
  LemmaGender,
} from "@/util/lemmaimport/datacontainers";
import { mergeBuildNewLemmaRows } from "@/util/lemmaimport/dataconversion";
import {
  LemmaFormatterOptions,
  defautLemmaFormatterOptions,
} from "@/util/lemmaimport/options";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import DateFormatter from "./DateFormatter.vue";
import GenderMapper from "./GenderMapper.vue";
import LemmaPreviewer from "./LemmaPreviewer.vue";
import NullManager from "./NullManager.vue";

/**
 * Takes LemmaPrototypes And Converts Them To LemmaRows
 */
@Component({
  components: {
    NullManager,
    DateFormatter,
    GenderMapper,
    LemmaPreviewer,
  },
})
export default class LemmaFormatter extends Vue {
  @Prop({ required: true, default: Array })
  lemmaPrototypes!: LemmaPrototypeStringType[];
  @Prop({ required: true }) preloadedOptions!: LemmaFormatterOptions;

  localOptions: LemmaFormatterOptions = defautLemmaFormatterOptions;

  @Watch('preloadedOptions', {immediate: true, deep: true})
  setLocalOptions() {
    this.localOptions = this.preloadedOptions;
  }

  lemmasPrototypesWithNullsAndRequiredFields: LemmaPrototypeRequiredFieldsType[] = [];

  // Some rows, will not be imported. These are their indexes. 
  missingRowsIndexes: number[] = [];

  dates: LemmaDates[] = [];
  genders: LemmaGender[] = [];

  get newLemmas(): NewLemmaRow[] {
    return mergeBuildNewLemmaRows(
      this.lemmasPrototypesWithNullsAndRequiredFields,
      this.dates,
      this.genders
    );
  }

  @Watch("newLemmas", { immediate: true, deep: false }) // Let the browser rest. Watch options deep should cover all.
  @Watch("options", { immediate: true, deep: true })
  emit() {
    this.$emit("data", this.newLemmas);
    this.$emit("options", this.localOptions);
    this.$emit("missingRowsIndexes", this.missingRowsIndexes);
  }

  submit() {
    this.$emit("submit");
  }
}
</script>