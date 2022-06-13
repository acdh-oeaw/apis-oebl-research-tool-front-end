<template>
  <div class="lemma-importer-container">
    <v-container >
      <v-row class="lemma-import-saving">
        <v-col>
          <import-options-saver
              :globalOptions="importOptions"
              :disabled="rawImportData.empty"
              @options="setOptionsAndAdvanceToEnd($event)"
          />
        </v-col>
      </v-row>
      <v-row class="lemma-import-steps">
        <v-col>
          <v-stepper v-model="stepToDisplay">
            <v-stepper-header>
              <v-stepper-step :complete="greatestCompleteStep > 0" step="1">
                Datei auswählen
                <v-btn
                  v-if="greatestCompleteStep > 0"
                  @click="stepToDisplay = 1"
                  small
                  icon
                  ><v-icon>mdi-lead-pencil</v-icon></v-btn
                >
              </v-stepper-step>
              <v-stepper-step :complete="2 <= greatestCompleteStep" step="2">
                Spalten zuweisen
                <v-btn
                  v-if="greatestCompleteStep > 1"
                  @click="stepToDisplay = 2"
                  small
                  icon
                  ><v-icon>mdi-lead-pencil</v-icon></v-btn
                >
              </v-stepper-step>
              <v-stepper-step :complete="3 <= greatestCompleteStep" step="3">
                Daten formatieren
                <v-btn
                  v-if="greatestCompleteStep > 2"
                  @click="stepToDisplay = 3"
                  small
                  icon
                  ><v-icon>mdi-lead-pencil</v-icon></v-btn
                >
              </v-stepper-step>
              <v-stepper-step :complete="4 <= greatestCompleteStep" step="4">
                Benutzerdefinierte Spalten
                <v-btn
                  v-if="greatestCompleteStep > 3"
                  @click="stepToDisplay = 4"
                  small
                  icon
                  ><v-icon>mdi-lead-pencil</v-icon></v-btn
                >
              </v-stepper-step>
              <v-stepper-step :complete="5 <= greatestCompleteStep" step="5"
                >Liste auswählen
                <v-btn
                  v-if="greatestCompleteStep > 4"
                  @click="stepToDisplay = 5"
                  small
                  icon
                  ><v-icon>mdi-lead-pencil</v-icon></v-btn
                >
                </v-stepper-step
              >
              <v-stepper-step :complete="false" step="6"
                >Import abschließen</v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
              <v-stepper-content step="1">
                <import-file-dialog
                  :preloadedFileOptions="importOptions.fileOptions"
                  @options="importOptions.fileOptions = $event"
                  @data="rawImportData = $event"
                  @submit="markStepDone(1)"
                />
              </v-stepper-content>
              <v-stepper-content step="2">
                <lemma-builder
                  :incommingData="rawImportData"
                  :preloadedOptions="importOptions.lemmaBuilderOptions"
                  @options="importOptions.lemmaBuilderOptions = $event"
                  @data="lemmaPrototypes = $event"
                  @submit="markStepDone(2)"
                />
              </v-stepper-content>
              <v-stepper-content step="3">
                <lemma-formatter
                  :lemmaPrototypes="lemmaPrototypes"
                  :preloadedOptions="importOptions.lemmaFormatterOptions"
                  @options="importOptions.lemmaFormatterOptions = $event"
                  @data="newLemmas = $event"
                  @missingRowsIndexes="missingRowsIndexes = $event"
                  @submit="markStepDone(3)"
                />
              </v-stepper-content>
              <v-stepper-content step="4">
                <user-column-adding
                  :preloadedOptions="importOptions.userColumnMapping"
                  :newLemmas="newLemmas"
                  :rawImportData="filteredRawImportData"
                  :columnMapping="importOptions.lemmaBuilderOptions"
                  @options="importOptions.userColumnMapping = $event"
                  @data="newLemmasWithUserColumns = $event"
                  @submit="markStepDone(4)"
                />
              </v-stepper-content>
              <v-stepper-content step="5">
                <list-selector
                  :preloadedOptions="importOptions.selectedList"
                  :newLemmasRows="newLemmasWithUserColumns"
                  @data="newLemmasWithList = $event"
                  @options="importOptions.selectedList = $event"
                  @submit="markStepDone(5)"
                />
              </v-stepper-content>
              <v-stepper-content step="6">
                <lemma-importer
                  :lemmasToImport="newLemmasWithList"
                  @submit="$emit('submit')"
                />
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import {
  Data2D,
  LemmaPrototypeStringType,
} from "@/util/lemmaimport/datacontainers";
import { ImportOptions } from "@/util/lemmaimport/options";

import ImportFileDialog from "./ImportFileDialog.vue";
import LemmaBuilder from "./LemmaBuilder.vue";
import LemmaFormatter from "./LemmaFormatter.vue";
import { NewLemmaRow } from "@/types/lemma";
import UserColumnAdding from "./UserColumnAdding.vue";
import ListSelector from "./ListSelector.vue";
import ImportOptionsSaver from "./ImportOptionsSaver.vue";
import LemmaImporter from "./LemmaImporter.vue";

/**
 * Manage Import Steps
 *
 * 1. Pass data between child importer components and organize order:
 *  1. Import file
 *  2. Asign source/target (LemmaRow) columns
 *  3. Format data to match target's (LemmaRow) requirements
 *  4. Select or create a list to import: Start import.
 * 2. Some kind of options management to save and load: (This is not well defined yet)
 *  - Get them from child importer components,
 *  - pass them to some save component,
 *  - load them from save component,
 *  - pass them to child importer components …
 */
@Component({
  components: {
    ImportFileDialog,
    LemmaBuilder,
    LemmaFormatter,
    UserColumnAdding,
    ListSelector,
    ImportOptionsSaver,
    LemmaImporter,
  },
})
export default class LemmaImportManager extends Vue {
  /**
   * Which step is currently displayed. We start with step 1.
   */
  stepToDisplay = 1;
  /**
   * Which is the greatest "done" step. We start with nothing is done.
   */
  greatestCompleteStep = 0;

  markStepDone(step: number) {
    
    const lastStep = 6;
    if (step > lastStep) {
      throw new Error("NotImplemented Error");
    }
    
    // Save guard for logic errors
    if (step - this.greatestCompleteStep > 1) {
      throw new Error(
        `Can not adavance more than one step. greatestCompleteStep = ${this.greatestCompleteStep}, required step = ${step}`
      );
    }


    // No reset of progress
    if (step > this.greatestCompleteStep) {
      this.greatestCompleteStep = step;
      // Jump to next possible step
      this.stepToDisplay = this.greatestCompleteStep + 1;
    } else {
      this.stepToDisplay = lastStep;
    }

    
  }

  importOptions: ImportOptions = new ImportOptions();

  rawImportData: Data2D = new Data2D([], []);

  // Some rows, will not be imported. These are their indexes.
  missingRowsIndexes: number[] = [];

  lemmaPrototypes: LemmaPrototypeStringType[] = [];

  newLemmas: NewLemmaRow[] = [];
  newLemmasWithUserColumns: NewLemmaRow[] = [];
  newLemmasWithList: NewLemmaRow[] = [];
  

  get filteredRawImportData(): Data2D {
    return this.rawImportData.selectRows(this.missingRowsIndexes, true);
  }

  setOptionsAndAdvanceToEnd(options: ImportOptions) {
    this.importOptions = options;
    this.greatestCompleteStep = 6;
    this.stepToDisplay = 6;
  }
}
</script>

<style scoped>
div.lemma-importer-container {
  background-color: #f5f6f8ee;
  height: 100%;
}
</style>

