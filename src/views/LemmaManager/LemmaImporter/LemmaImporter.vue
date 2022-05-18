<template>
  <div class="lemma-importer-container">
      <v-stepper
        v-model="stepToDisplay"
        >
        <v-stepper-header>
          <v-stepper-step
            :complete="1 <= greatestCompleteStep"
            step="1"
          >
            Datei auswählen
            <v-btn
              v-if="greatestCompleteStep > 0"
              @click="stepToDisplay = 1 "
              small icon
            ><v-icon>mdi-lead-pencil</v-icon></v-btn>
            </v-stepper-step>
          <v-stepper-step
            :complete="2 <= greatestCompleteStep"
            step="2"
          >Spalten zuweisen</v-stepper-step>
          <v-stepper-step
            :complete="3 <= greatestCompleteStep"
            step="3"
          >Daten formatieren</v-stepper-step>
          <v-stepper-step
            :complete="4 <= greatestCompleteStep"
            step="4"
          >Benutzerdefinierte Spalten</v-stepper-step>
          <v-stepper-step
            :complete="5 <= greatestCompleteStep"
            step="5"
          >Liste auswählen</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1">
            <import-file-dialog
              :preloadedFileOptions="importOptions.fileOptions"
              @options="importOptions.fileOptions = $event"
              @data="rawImportData = $event"
            />
            <v-btn
              @click="markStepDone(1)"
              :disabled="rawImportData === null"
            >Weiter</v-btn>
          </v-stepper-content>
          <v-stepper-content step="2">
            <lemma-builder 
              :incommingData="rawImportData"
              :preloadedOptions="importOptions.lemmaBuilderOptions"
            />
          </v-stepper-content>
          <v-stepper-content step="3">
            TODO: Daten formatieren
          </v-stepper-content>
          <v-stepper-content step="4">
            TODO: Benutzerdefinierte Spalten
          </v-stepper-content>
          <v-stepper-content step="4">
            TODO: Liste auswählen
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
  </div>
</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator';

import { Data2D } from '@/util/lemmaimport/datacontainers';
import { ImportOptions } from '@/util/lemmaimport/options';

import ImportFileDialog from './ImportFileDialog.vue';
import LemmaBuilder from './LemmaBuilder.vue';



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
  }
})
export default class LemmaImporter extends Vue {

  /**
   * Which step is currently displayed. We start with step 1.
   */
  stepToDisplay = 1;
  /**
   * Which is the greatest "done" step. We start with nothing is done.
   */
  greatestCompleteStep = 0;

  markStepDone(step: number) {
    this.stepToDisplay = step + 1;
    // Make one step
    if (this.greatestCompleteStep === (step - 1)) {
      this.greatestCompleteStep = 1;
    // Nothing to do
    } else if (step <= this.greatestCompleteStep) {
      return;
    // We have a logic error:
    } else {
      throw new Error(`Can not adavance more than one step. greatestCompleteStep = ${this.greatestCompleteStep}, required step = ${step}`);
    }
  }

  importOptions: ImportOptions = new ImportOptions();

  rawImportData: Data2D = new Data2D([], []);

}
</script>

<style scoped>

div.lemma-importer-container {
  background-color: #f5f6f8ee;
  height: 100%;
}

</style>

