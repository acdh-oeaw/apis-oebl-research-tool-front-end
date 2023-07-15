<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import { ImportOptionsManager } from "@/lib/lemmaimport/optionmanagement";
import { ImportOptions } from "@/lib/lemmaimport/options";

const props = defineProps<{
	disabled?: boolean;
	globalOptions: ImportOptions;
}>();

const emit = defineEmits<{
	(event: "options", value: ImportOptions): void;
}>();

const importOptionsManager = new ImportOptionsManager();

const selectedOptionsName = ref<string | null | undefined>(null);
const newOptionsName = ref<string | null | undefined>(null);
const localOptions = ref<ImportOptions>(new ImportOptions());
const errorMessage = ref<string | null>(null);
const optionsChangedByLoading = ref(false);
const currentlySaving = ref(false);
const changedByUserInteraction = ref(false);
const optionsNames = ref<Array<string>>([]);

watch(
	() => props.globalOptions,
	() => {
		localOptions.value = props.globalOptions;
	},
	{ deep: true, immediate: true },
);

watch(
	localOptions,
	() => {
		if (optionsChangedByLoading.value) {
			emit("options", localOptions.value);
			// These are not the user selected options anymore.
			optionsChangedByLoading.value = false;
			// These are
			changedByUserInteraction.value = false;
			return;
		} else {
			changedByUserInteraction.value = true;
		}
	},
	{ immediate: true, deep: true },
);

function updateOptionsNames(): void {
	optionsNames.value = importOptionsManager.listImportOptionsNames();
}

function loadOption() {
	if (newOptionsName.value == null) {
		console.error("Can not save with no options name defined.");
		return;
	}

	try {
		localOptions.value = importOptionsManager.getImportOptionByName(newOptionsName.value);
	} catch (error) {
		errorMessage.value = `${newOptionsName.value} konnte nicht geladen werden`;
		newOptionsName.value = null;
	} finally {
		optionsChangedByLoading.value = true;
		selectedOptionsName.value = newOptionsName.value;
		newOptionsName.value = null;
	}
}

function saveOption() {
	if (newOptionsName.value == null) {
		console.error("Can not save with no options name defined.");
		return;
	}

	importOptionsManager.addOrUpdateImportOptions(newOptionsName.value, localOptions.value);
	selectedOptionsName.value = newOptionsName.value;
	newOptionsName.value = null;
	currentlySaving.value = false;
	updateOptionsNames();
}

const optionsReady = computed(() => {
	return props.globalOptions.allIsFilledIn();
});

updateOptionsNames();
</script>

<template>
	<div class="import-options-saver-container">
		<VContainer>
			<VRow>
				<VCol class="import-options-saver">
					<VBtn
						:disabled="
							!changedByUserInteraction || currentlySaving || !optionsReady || disabled || !';-)'
						"
						@click="currentlySaving = true"
					>
						Importeinstellungen speichern
					</VBtn>
				</VCol>
				<VCol>
					<div v-if="currentlySaving" class="saving-options-dialog">
						<VCombobox
							v-model="newOptionsName"
							label="Speichern unter"
							:items="optionsNames"
							@input="saveOption"
						/>
					</div>
					<div v-else-if="optionsNames.length > 0" class="load-options-dialog">
						<VSelect
							v-model="newOptionsName"
							label="Einstellungen laden"
							:items="optionsNames"
							:disabled="disabled"
						/>
						<VBtn v-if="newOptionsName" icon @click="loadOption">
							<VIcon>mdi-check</VIcon>
						</VBtn>
					</div>
				</VCol>
				<VCol>
					<div v-if="selectedOptionsName" class="currently-loaded-import-options-name">
						"{{ selectedOptionsName }}" geladen
					</div>
				</VCol>
			</VRow>
		</VContainer>
	</div>
</template>
