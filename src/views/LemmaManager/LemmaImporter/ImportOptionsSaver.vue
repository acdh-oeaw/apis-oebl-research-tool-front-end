<template>
	<div class="import-options-saver-container">
		<v-container>
			<v-row>
				<v-col class="import-options-saver">
					<v-btn
						:disabled="
							!changedByUserInteraction || currentlySaving || !optionsReady || disabled || !';-)'
						"
						@click="currentlySaving = true"
					>
						Importeinstellungen speichern
					</v-btn>
				</v-col>
				<v-col>
					<div v-if="currentlySaving" class="saving-options-dialog">
						<v-combobox
							v-model="newOptionsName"
							label="Speichern unter"
							:items="optionsNames"
							@input="saveOption"
						/>
					</div>
					<div v-else-if="optionsNames.length > 0" class="load-options-dialog">
						<v-select
							v-model="newOptionsName"
							label="Einstellungen laden"
							:items="optionsNames"
							:disabled="disabled"
						/>
						<v-btn v-if="newOptionsName" icon @click="loadOption">
							<v-icon>mdi-check</v-icon>
						</v-btn>
					</div>
				</v-col>
				<v-col>
					<div v-if="selectedOptionsName" class="currently-loaded-import-options-name">
						"{{ selectedOptionsName }}" geladen
					</div>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { ImportOptionsManager } from "@/util/lemmaimport/optionmanagement";
import { ImportOptions } from "@/util/lemmaimport/options";

@Component
export default class ImportOptionsSaver extends Vue {
	@Prop({ required: true }) globalOptions!: ImportOptions;
	@Prop({ default: false }) disabled!: boolean;

	importOptionsManager: ImportOptionsManager = new ImportOptionsManager();

	selectedOptionsName: string | null | undefined = null;

	newOptionsName: string | null | undefined = null;

	localOptions: ImportOptions = new ImportOptions();

	errorMessage: string | null = null;

	optionsChangedByLoading = false;

	currentlySaving = false;

	@Watch("globalOptions", { deep: true, immediate: true })
	updateLocalOptions() {
		this.localOptions = this.globalOptions;
	}

	changedByUserInteraction = false;

	@Watch("localOptions", { immediate: true, deep: true })
	setChanged() {
		if (this.optionsChangedByLoading) {
			this.$emit("options", this.localOptions);
			// These are not the user selected options anymore.
			this.optionsChangedByLoading = false;
			// These are
			this.changedByUserInteraction = false;
			return;
		} else {
			this.changedByUserInteraction = true;
		}
	}

	optionsNames: Array<string> = [];

	updateOptionsNames(): void {
		this.optionsNames = this.importOptionsManager.listImportOptionsNames();
	}

	loadOption() {
		if (this.newOptionsName == null) {
			console.error("Can not save with no options name defined.");
			return;
		}
		try {
			this.localOptions = this.importOptionsManager.getImportOptionByName(this.newOptionsName);
		} catch (error) {
			this.errorMessage = `${this.newOptionsName} konnte nicht geladen werden`;
			this.newOptionsName = null;
		} finally {
			this.optionsChangedByLoading = true;
			this.selectedOptionsName = this.newOptionsName;
			this.newOptionsName = null;
		}
	}

	saveOption() {
		if (this.newOptionsName == null) {
			console.error("Can not save with no options name defined.");
			return;
		}
		this.importOptionsManager.addOrUpdateImportOptions(this.newOptionsName, this.localOptions);
		this.selectedOptionsName = this.newOptionsName;
		this.newOptionsName = null;
		this.currentlySaving = false;
		this.updateOptionsNames();
	}

	get optionsReady(): boolean {
		return this.globalOptions.allIsFilledIn();
	}

	created() {
		this.updateOptionsNames();
	}
}
</script>
