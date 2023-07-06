<template>
	<div class="lemma-importer-container">
		<v-container>
			<v-row class="lemma-import-saving">
				<v-col>
					<v-card>
						<import-options-saver
							:global-options="importOptions"
							:disabled="rawImportData.empty"
							@options="setOptionsAndAdvanceToEnd($event)"
						/>
					</v-card>
				</v-col>
			</v-row>
			<v-row class="lemma-import-steps">
				<v-col>
					<v-stepper v-model="stepToDisplay">
						<v-stepper-header>
							<v-stepper-step :complete="greatestCompleteStep > 0" step="1">
								Datei auswählen
								<v-btn v-if="greatestCompleteStep > 0" small icon @click="stepToDisplay = 1">
									<v-icon>mdi-lead-pencil</v-icon>
								</v-btn>
							</v-stepper-step>
							<v-stepper-step :complete="2 <= greatestCompleteStep" step="2">
								Spalten zuweisen
								<v-btn v-if="greatestCompleteStep > 1" small icon @click="stepToDisplay = 2">
									<v-icon>mdi-lead-pencil</v-icon>
								</v-btn>
							</v-stepper-step>
							<v-stepper-step :complete="3 <= greatestCompleteStep" step="3">
								Daten formatieren
								<v-btn v-if="greatestCompleteStep > 2" small icon @click="stepToDisplay = 3">
									<v-icon>mdi-lead-pencil</v-icon>
								</v-btn>
							</v-stepper-step>
							<v-stepper-step :complete="4 <= greatestCompleteStep" step="4">
								Benutzerdefinierte Spalten
								<v-btn v-if="greatestCompleteStep > 3" small icon @click="stepToDisplay = 4">
									<v-icon>mdi-lead-pencil</v-icon>
								</v-btn>
							</v-stepper-step>
							<v-stepper-step :complete="5 <= greatestCompleteStep" step="5">
								Liste auswählen
								<v-btn v-if="greatestCompleteStep > 4" small icon @click="stepToDisplay = 5">
									<v-icon>mdi-lead-pencil</v-icon>
								</v-btn>
							</v-stepper-step>
							<v-stepper-step :complete="false" step="6">Import abschließen</v-stepper-step>
						</v-stepper-header>
						<v-stepper-items>
							<v-stepper-content step="1">
								<import-file-dialog
									:preloaded-file-options="importOptions.fileOptions"
									@options="importOptions.fileOptions = $event"
									@data="rawImportData = $event"
									@submit="markStepDone(1)"
								/>
							</v-stepper-content>
							<v-stepper-content step="2">
								<lemma-builder
									:incomming-data="rawImportData"
									:preloaded-options="importOptions.lemmaBuilderOptions"
									@options="importOptions.lemmaBuilderOptions = $event"
									@data="lemmaPrototypes = $event"
									@submit="markStepDone(2)"
								/>
							</v-stepper-content>
							<v-stepper-content step="3">
								<lemma-formatter
									:lemma-prototypes="lemmaPrototypes"
									:preloaded-options="importOptions.lemmaFormatterOptions"
									@options="importOptions.lemmaFormatterOptions = $event"
									@data="newLemmas = $event"
									@missingRowsIndexes="missingRowsIndexes = $event"
									@submit="markStepDone(3)"
								/>
							</v-stepper-content>
							<v-stepper-content step="4">
								<user-column-adding
									:preloaded-options="importOptions.userColumnMapping"
									:new-lemmas="newLemmas"
									:raw-import-data="filteredRawImportData"
									:column-mapping="importOptions.lemmaBuilderOptions"
									@options="importOptions.userColumnMapping = $event"
									@data="newLemmasWithUserColumns = $event"
									@submit="markStepDone(4)"
								/>
							</v-stepper-content>
							<v-stepper-content step="5">
								<list-selector
									:preloaded-options="importOptions.selectedList"
									:new-lemmas-rows="newLemmasWithUserColumns"
									@data="newLemmasWithList = $event"
									@options="importOptions.selectedList = $event"
									@submit="markStepDone(5)"
								/>
							</v-stepper-content>
							<v-stepper-content step="6">
								<lemma-importer :lemmas-to-import="newLemmasWithList" @submit="$emit('submit')" />
							</v-stepper-content>
						</v-stepper-items>
					</v-stepper>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { type NewLemmaRow } from "@/types/lemma";
import { Data2D, type LemmaPrototypeStringType } from "@/util/lemmaimport/datacontainers";
import { ImportOptions } from "@/util/lemmaimport/options";

import ImportFileDialog from "./ImportFileDialog.vue";
import ImportOptionsSaver from "./ImportOptionsSaver.vue";
import LemmaBuilder from "./LemmaBuilder.vue";
import LemmaFormatter from "./LemmaFormatter.vue";
import LemmaImporter from "./LemmaImporter.vue";
import ListSelector from "./ListSelector.vue";
import UserColumnAdding from "./UserColumnAdding.vue";

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
				`Can not adavance more than one step. greatestCompleteStep = ${this.greatestCompleteStep}, required step = ${step}`,
			);
		}

		// No reset of progress
		if (step > this.greatestCompleteStep) {
			this.greatestCompleteStep = step;
			// Jump to next possible step
		}

		this.stepToDisplay =
			this.greatestCompleteStep === lastStep ? lastStep : this.greatestCompleteStep + 1;
	}

	importOptions: ImportOptions = new ImportOptions();

	rawImportData: Data2D = new Data2D([], []);

	// Some rows, will not be imported. These are their indexes.
	missingRowsIndexes: Array<number> = [];

	lemmaPrototypes: Array<LemmaPrototypeStringType> = [];

	newLemmas: Array<NewLemmaRow> = [];
	newLemmasWithUserColumns: Array<NewLemmaRow> = [];
	newLemmasWithList: Array<NewLemmaRow> = [];

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
/* Show background blurred */
div.lemma-importer-container {
	height: 100%;
	background-color: #f5f6f8ee;
}

/**
* For some reasons v-stepper-header has a height of 72px.
 * This leads to some steps being outside of the contantainer, with medium screen sizes.
 * This is an easy solution.
*/
/deep/ .v-stepper__header {
	height: inherit;
}
</style>
