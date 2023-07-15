<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import ColumnSelect from "@/features/lemmata/import/column-select.vue";
import LemmaPreviewer from "@/features/lemmata/import/lemma-previewer.vue";
import { type Data2D, type LemmaPrototypeStringType } from "@/lib/lemmaimport/datacontainers";
import { createEmptyLemmaPrototype } from "@/lib/lemmaimport/dataconversion";
import {
	type ColumnConversion,
	type ColumnConversions,
	defaultLemmaBuilderOptions,
	type ExtractColumnOptions,
	getEmptyColumnConversion,
} from "@/lib/lemmaimport/options";

/**
 * This components takes any tabular data, helps to user to map it to a LemmaPrototype, and if succesful emits an array of LemmaPrototypes.
 */

const props = defineProps<{
	incomingData: Data2D;
	preloadedOptions: ColumnConversions;
}>();

const emit = defineEmits<{
	(event: "options", value: ColumnConversions): void;
	(event: "data", value: Array<LemmaPrototypeStringType>): void;
	(event: "submit"): void;
}>();

const options = ref<ColumnConversions>(defaultLemmaBuilderOptions);
// Interdmidiate lemma prototypes, before they are ready to submit
const partialLemmaPrototypes = ref<Array<Partial<LemmaPrototypeStringType>>>([]);
// Result to emit
const lemmaPrototypes = ref<Array<LemmaPrototypeStringType>>([]);

// Used to display column selections in an structured way.
const columnGroups = computed(() => {
	return {
		Basisdaten: [
			{ name: "firstName" },
			{ name: "lastName", required: true },
			{ name: "dateOfBirth" },
			{ name: "dateOfDeath" },
			{ name: "gender" },
		],
		"Erweiterte Daten": [
			{ name: "professionDetail" },
			{ name: "bioNote" },
			{ name: "kinship" },
			{ name: "religion" },
		],
		"Linked Data": [{ name: "gnd" }, { name: "loc" }, { name: "viaf_id" }],
	};
});

const allRequiredFieldsSet = computed(() => {
	for (const groupName in columnGroups.value) {
		if (groupHasMissingRequiredValue(groupName)) {
			return false;
		}
	}
	return true;
});

watch(
	() => props.preloadedOptions,
	() => {
		// Update local options, when preloaded options change.
		options.value = props.preloadedOptions;
	},
	{ immediate: true, deep: true },
);

watch(
	() => props.incomingData,
	() => {
		if (props.incomingData.data.length === partialLemmaPrototypes.value.length) {
			return; // Do not loose data, if there are already the same amount of lemmas.
		}
		// Else create the right amount of empty lemma objects
		partialLemmaPrototypes.value = props.incomingData.data.map(() => new Object());
	},
	{ immediate: true, deep: true },
);

watch(
	[lemmaPrototypes, options],
	() => {
		emit("options", options.value);
		emit("data", lemmaPrototypes.value);
	},
	{ immediate: true, deep: true },
);

watch(
	[partialLemmaPrototypes, options],
	() => {
		// if it is not possible to compute any lemma prototype -> go empty list => empty preview and computations in the next components.
		if (!allRequiredFieldsSet.value && lemmaPrototypes.value.length > 0) {
			lemmaPrototypes.value = [];
		}

		lemmaPrototypes.value = partialLemmaPrototypes.value.map((partialLemmaPrototype) => {
			return {
				// Add all properties empty
				...createEmptyLemmaPrototype(),
				// And overwrite them with data
				...partialLemmaPrototype,
			};
		});
	},
	{ immediate: true, deep: false },
);

function submit() {
	emit("submit");
}

function updateData(column: Array<Partial<LemmaPrototypeStringType>>) {
	partialLemmaPrototypes.value = partialLemmaPrototypes.value.map((newLemma, index) => {
		return {
			...newLemma,
			...column[index],
		};
	});
}

function removeData(columnName: string) {
	partialLemmaPrototypes.value.forEach(
		(partialLemmaPrototype) =>
			delete partialLemmaPrototype[columnName as keyof Partial<LemmaPrototypeStringType>],
	);
}

function getOptionsByName(name: keyof ColumnConversions): ExtractColumnOptions {
	return options.value[name]?.extractOptions ?? getEmptyColumnConversion().extractOptions;
}

function setOptionsByName(name: keyof ColumnConversions, option: ExtractColumnOptions) {
	/*
	 * Could not get a more simple typeguard to work here – maybe I am to much of a full stack dev, to find a better solution.
	 */
	const storedColumnConversion: ColumnConversion | undefined = options.value[name];
	const columnConversionInUse: ColumnConversion =
		storedColumnConversion ?? getEmptyColumnConversion();
	if (storedColumnConversion == null) {
		options.value[name] = columnConversionInUse;
	}
	columnConversionInUse.extractOptions = option;
	// Trigger vue watch. Apperently, the above does not, event though it is deep.
	options.value[name] = columnConversionInUse;
}

function groupHasMissingRequiredValue(group: string): boolean {
	const columnConversions = columnGroups.value[group];
	if (columnConversions == null) {
		return false;
	}

	const requiredColumns = columnConversions.filter((columnConversion) => columnConversion.required);

	if (requiredColumns.length === 0) {
		return false;
	}

	for (const requiredColumn of requiredColumns) {
		const option = options.value[requiredColumn.name];
		if (option == null || option.extractOptions.sourceKey == null) {
			return true;
		}
	}

	return false;
}
</script>

<template>
	<div class="lemma-builder-container">
		<VContainer>
			<VRow class="lemma-builder-ux">
				<VCol>
					<VExpansionPanels multiple>
						<VExpansionPanel
							v-for="(columns, groupName) in columnGroups"
							:key="groupName"
							class="import-column-select-group"
						>
							<VExpansionPanelHeader
								:class="
									'import-column-select-group-name' +
									(groupHasMissingRequiredValue(String(groupName)) ? ' warning' : '')
								"
							>
								{{ groupName }}
							</VExpansionPanelHeader>
							<VExpansionPanelContent eager>
								<VContainer>
									<VRow v-for="(column, index) in columns" :key="`${column}-${index}`">
										<VCol>
											<ColumnSelect
												:lemma-key="column.name"
												:source-data="incomingData"
												:preloaded-options="getOptionsByName(column.name)"
												@options="setOptionsByName(column.name, $event)"
												@cancel="removeData(column.name)"
												@data="updateData($event)"
											/>
										</VCol>
										<VCol>
											<div
												v-if="column.required && getOptionsByName(column.name).sourceKey == null"
												class="missing-required-field-column-select"
											>
												<VAlert type="warning">Dieses Feld muss ausgefüllt werden</VAlert>
											</div>
										</VCol>
									</VRow>
								</VContainer>
							</VExpansionPanelContent>
						</VExpansionPanel>
					</VExpansionPanels>
				</VCol>
			</VRow>

			<VRow class="submit-column-selects">
				<VCol>
					<VBtn :disabled="!allRequiredFieldsSet" @click="submit">Weiter</VBtn>
				</VCol>
			</VRow>
			<VRow class="data-comparision-area">
				<LemmaPreviewer :lemmas="partialLemmaPrototypes" />
			</VRow>
		</VContainer>
	</div>
</template>
