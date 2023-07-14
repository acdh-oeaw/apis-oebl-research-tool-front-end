<script lang="ts" setup>
import { computed, ref } from "vue";

import ImportFileDialog from "@/features/lemmata/import/import-file-dialog.vue";
import ImportOptionsSaver from "@/features/lemmata/import/ImportOptionsSaver.vue";
import LemmaBuilder from "@/features/lemmata/import/LemmaBuilder.vue";
import LemmaFormatter from "@/features/lemmata/import/LemmaFormatter.vue";
import LemmaImporter from "@/features/lemmata/import/LemmaImporter.vue";
import ListSelector from "@/features/lemmata/import/ListSelector.vue";
import UserColumnAdding from "@/features/lemmata/import/UserColumnAdding.vue";
import { Data2D, type LemmaPrototypeStringType } from "@/lib/lemmaimport/datacontainers";
import { ImportOptions } from "@/lib/lemmaimport/options";
import { type NewLemmaRow } from "@/types/lemma";

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

/**
 * Which step is currently displayed. We start with step 1.
 */
const stepToDisplay = ref(1);

/**
 * Which is the greatest "done" step. We start with nothing is done.
 */
const greatestCompleteStep = ref(0);

function markStepDone(step: number) {
	const lastStep = 6;

	if (step > lastStep) {
		throw new Error("NotImplemented Error");
	}

	// Save guard for logic errors
	if (step - greatestCompleteStep.value > 1) {
		throw new Error(
			`Can not adavance more than one step. greatestCompleteStep = ${greatestCompleteStep.value}, required step = ${step}`,
		);
	}

	// No reset of progress
	if (step > greatestCompleteStep.value) {
		greatestCompleteStep.value = step;
		// Jump to next possible step
	}

	stepToDisplay.value =
		greatestCompleteStep.value === lastStep ? lastStep : greatestCompleteStep.value + 1;
}

const importOptions: ImportOptions = new ImportOptions();

const rawImportData = ref(new Data2D([], []));

// Some rows, will not be imported. These are their indexes.
const missingRowsIndexes = ref<Array<number>>([]);

const lemmaPrototypes = ref<Array<LemmaPrototypeStringType>>([]);

const newLemmas = ref<Array<NewLemmaRow>>([]);
const newLemmasWithUserColumns = ref<Array<NewLemmaRow>>([]);
const newLemmasWithList = ref<Array<NewLemmaRow>>([]);

const filteredRawImportData = computed(() => {
	return rawImportData.value.selectRows(missingRowsIndexes.value, true);
});

function setOptionsAndAdvanceToEnd(options: ImportOptions) {
	importOptions.value = options;
	greatestCompleteStep.value = 6;
	stepToDisplay.value = 6;
}
</script>

<template>
	<div class="lemma-importer-container">
		<VContainer>
			<VRow>
				<VCol>
					<VCard>
						<ImportOptionsSaver
							:global-options="importOptions"
							:disabled="rawImportData.empty"
							@options="setOptionsAndAdvanceToEnd($event)"
						/>
					</VCard>
				</VCol>
			</VRow>

			<VRow class="lemma-import-steps">
				<VCol>
					<VStepper v-model="stepToDisplay">
						<VStepperHeader>
							<VStepperStep :complete="greatestCompleteStep > 0" step="1">
								Datei auswählen
								<VBtn v-if="greatestCompleteStep > 0" small icon @click="stepToDisplay = 1">
									<VIcon>mdi-lead-pencil</VIcon>
								</VBtn>
							</VStepperStep>

							<VStepperStep :complete="2 <= greatestCompleteStep" step="2">
								Spalten zuweisen
								<VBtn v-if="greatestCompleteStep > 1" small icon @click="stepToDisplay = 2">
									<VIcon>mdi-lead-pencil</VIcon>
								</VBtn>
							</VStepperStep>

							<VStepperStep :complete="3 <= greatestCompleteStep" step="3">
								Daten formatieren
								<VBtn v-if="greatestCompleteStep > 2" small icon @click="stepToDisplay = 3">
									<VIcon>mdi-lead-pencil</VIcon>
								</VBtn>
							</VStepperStep>

							<VStepperStep :complete="4 <= greatestCompleteStep" step="4">
								Benutzerdefinierte Spalten
								<VBtn v-if="greatestCompleteStep > 3" small icon @click="stepToDisplay = 4">
									<VIcon>mdi-lead-pencil</VIcon>
								</VBtn>
							</VStepperStep>

							<VStepperStep :complete="5 <= greatestCompleteStep" step="5">
								Liste auswählen
								<VBtn v-if="greatestCompleteStep > 4" small icon @click="stepToDisplay = 5">
									<VIcon>mdi-lead-pencil</VIcon>
								</VBtn>
							</VStepperStep>

							<VStepperStep :complete="false" step="6">Import abschließen</VStepperStep>
						</VStepperHeader>

						<VStepperItems>
							<VStepperContent step="1">
								<ImportFileDialog
									:preloaded-file-options="importOptions.fileOptions"
									@options="importOptions.fileOptions = $event"
									@data="rawImportData = $event"
									@submit="markStepDone(1)"
								/>
							</VStepperContent>

							<VStepperContent step="2">
								<LemmaBuilder
									:incomming-data="rawImportData"
									:preloaded-options="importOptions.lemmaBuilderOptions"
									@options="importOptions.lemmaBuilderOptions = $event"
									@data="lemmaPrototypes = $event"
									@submit="markStepDone(2)"
								/>
							</VStepperContent>

							<VStepperContent step="3">
								<LemmaFormatter
									:lemma-prototypes="lemmaPrototypes"
									:preloaded-options="importOptions.lemmaFormatterOptions"
									@options="importOptions.lemmaFormatterOptions = $event"
									@data="newLemmas = $event"
									@missingRowsIndexes="missingRowsIndexes = $event"
									@submit="markStepDone(3)"
								/>
							</VStepperContent>

							<VStepperContent step="4">
								<UserColumnAdding
									:preloaded-options="importOptions.userColumnMapping"
									:new-lemmas="newLemmas"
									:raw-import-data="filteredRawImportData"
									:column-mapping="importOptions.lemmaBuilderOptions"
									@options="importOptions.userColumnMapping = $event"
									@data="newLemmasWithUserColumns = $event"
									@submit="markStepDone(4)"
								/>
							</VStepperContent>

							<VStepperContent step="5">
								<ListSelector
									:preloaded-options="importOptions.selectedList"
									:new-lemmas-rows="newLemmasWithUserColumns"
									@data="newLemmasWithList = $event"
									@options="importOptions.selectedList = $event"
									@submit="markStepDone(5)"
								/>
							</VStepperContent>

							<VStepperContent step="6">
								<LemmaImporter :lemmas-to-import="newLemmasWithList" @submit="$emit('submit')" />
							</VStepperContent>
						</VStepperItems>
					</VStepper>
				</VCol>
			</VRow>
		</VContainer>
	</div>
</template>

<style scoped>
/* Show background blurred */
div.lemma-importer-container {
	height: 100%;
	background-color: hsl(220deg 18% 97% / 93.3%);
}

/**
 * For some reasons v-stepper-header has a height of 72px.
 * This leads to some steps being outside of the contantainer, with medium screen sizes.
 * This is an easy solution.
 */
:deep(.v-stepper__header) {
	height: inherit;
}
</style>
