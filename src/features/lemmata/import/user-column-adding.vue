<script lang="ts" setup>
import Vue, { computed, ref, watch } from "vue";

import { type Data2D } from "@/lib/lemmaimport/datacontainers";
import { addUserColumns } from "@/lib/lemmaimport/dataconversion";
import { type ColumnConversions, type UserColumnMapping } from "@/lib/lemmaimport/options";
import { type NewLemmaRow, type UserColumn } from "@/types/lemma";

/**
 * Add custum user columns to lemmas. Called it UserColumn
 */

const props = defineProps<{
	preloadedOptions: UserColumnMapping;
	newLemmas: Array<NewLemmaRow>;
	rawImportData: Data2D;
	// This is needed to show the user, which columns, she/he had already chosen.
	columnMapping: ColumnConversions;
}>();

const emit = defineEmits<{
	(event: "submit"): void;
	(event: "data", value: Array<NewLemmaRow>): void;
	(event: "options", value: UserColumnMapping): void;
}>();

const localOptions = ref<UserColumnMapping>({});

const chosenSourceColumn = ref<string | null>(null);
const chosenTargetColumn = ref<string | null>(null);

const userColumns = ref<Array<UserColumn>>([]);

watch(chosenSourceColumn, () => {
	if (!chosenTargetColumn.value) {
		chosenTargetColumn.value = chosenSourceColumn.value;
	}
});

watch(
	() => props.preloadedOptions,
	() => {
		localOptions.value = props.preloadedOptions;
	},
	{ immediate: true, deep: true },
);

watch(
	[localOptions, () => props.newLemmas],
	() => {
		emit("data", enrichedLemmas.value);
		emit("options", localOptions.value);
	},
	{ deep: true, immediate: true },
);

function submit() {
	emit("submit");
}

function deleteMapping(targetColumn: string) {
	Vue.delete(localOptions.value, targetColumn);
}

const vuetifySourceColumns = computed(() => {
	const allSourceColumns: Array<string> = props.rawImportData.headers;
	const selectedUserSourceColumns: Array<string> = Object.values(localOptions.value);
	const topLevelSelectedSourceColumns: Array<string> = Object.values(props.columnMapping)
		.map((columnConversion): string | null | undefined => columnConversion.extractOptions.sourceKey)
		.filter((sourceKey): sourceKey is string => typeof sourceKey === "string");
	const selectedSourceColumns = selectedUserSourceColumns.concat(topLevelSelectedSourceColumns);
	const notSelectedSourceColumns = allSourceColumns.filter(
		(sourceColumn) => !selectedSourceColumns.includes(sourceColumn),
	);
	return notSelectedSourceColumns.map((sourceColumn) => {
		return {
			text: sourceColumn,
			value: sourceColumn,
		};
	});
});

function targetColumnAlreadyChosen(targetColumn: string): boolean {
	return targetColumn in localOptions.value;
}

function targetColumnChosenMessage(targetColumn: string): string | true {
	if (targetColumnAlreadyChosen(targetColumn)) {
		return "Dieser Namen wurde schon ausgewählt";
	}
	return true;
}

function addMapping(targetColumn: string, sourceColumn: string) {
	localOptions.value = {
		...localOptions.value,
		[targetColumn]: sourceColumn,
	};
}

function addUserColumn() {
	if (
		typeof chosenTargetColumn.value !== "string" ||
		typeof chosenSourceColumn.value !== "string"
	) {
		return;
	}

	addMapping(chosenTargetColumn.value, chosenSourceColumn.value);
	chosenSourceColumn.value = null;
	chosenTargetColumn.value = null;
}

function columnFiledsAreSet(): boolean {
	return (
		typeof chosenTargetColumn.value === "string" && typeof chosenSourceColumn.value === "string"
	);
}

// https://vuetifyjs.com/en/api/v-data-table/#props-headers
const vuetifyUserColumnHeaders = computed(() => {
	return Object.keys(localOptions.value).map((userColumn) => {
		return {
			text: userColumn,
			value: userColumn,
			sortable: false,
			filterable: false,
		};
	});
});

const enrichedLemmas = computed(() => {
	return addUserColumns(props.newLemmas, userColumns.value);
});
</script>

<template>
	<div class="user-columns-adding-container">
		<v-container>
			<v-row class="user-columns-adding-chosen">
				<v-col>
					<v-chip
						v-for="(targetColumn, sourceColumn) in localOptions"
						:key="`${targetColumn}`"
						close
						class="chosen-user-column"
						@click:close="deleteMapping(targetColumn)"
					>
						{{ sourceColumn }}: {{ targetColumn }}
					</v-chip>
				</v-col>
			</v-row>
			<v-row class="user-columns-adding-select">
				<v-col class="user-columns-adding-select-source">
					<v-select
						v-model="chosenSourceColumn"
						label="Quellspalte"
						:items="vuetifySourceColumns"
						clearable
					/>
				</v-col>
				<v-col class="user-columns-adding-select-target">
					<v-text-field
						v-model="chosenTargetColumn"
						label="Zielspalte"
						clearable
						:rules="[targetColumnChosenMessage]"
					/>
				</v-col>
				<v-col class="user-columns-adding-select-submit">
					<v-btn :disabled="!columnFiledsAreSet()" @click="addUserColumn">Hinzufügen</v-btn>
				</v-col>
			</v-row>
			<v-row class="user-columns-adding-submit">
				<v-btn @click="submit">Weiter</v-btn>
			</v-row>
			<v-row class="user-columns-adding-preview">
				<v-data-table label="Vorschau" :headers="vuetifyUserColumnHeaders" :items="userColumns" />
			</v-row>
		</v-container>
	</div>
</template>
