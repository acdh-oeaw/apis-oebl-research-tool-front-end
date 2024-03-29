<template>
	<div class="file-options-container">
		<v-container>
			<v-row class="select-file">
				<v-file-input
					:accept="fileType"
					label="Bitte eine Datei auswählen"
					@change="file = $event == null ? null : $event"
				></v-file-input>
				<v-spacer />
				<v-select
					v-model="fileType"
					label="Dateityp"
					:items="[{ text: 'csv', value: 'text/csv' }]"
				/>
			</v-row>
			<v-row class="file-type-options">
				<csv-importer
					v-if="file != null && file.type === 'text/csv'"
					:file="file"
					:preloaded-options="preloadedFileOptions"
					@options="localOptions = $event"
					@data="rawData = $event"
				/>
			</v-row>
			<v-row class="general-file-options">
				<v-col>
					<v-checkbox
						v-if="localOptions"
						v-model="localOptions.useFirstRowAsHeaders"
						label="Enthält Spaltenüberschriften"
					/>
				</v-col>
			</v-row>
			<v-row class="submit">
				<v-col>
					<v-btn :disabled="rawData == null" @click="submit()">Weiter</v-btn>
				</v-col>
			</v-row>
			<v-row class="data-preview">
				<v-data-table dense :headers="vuetifyDataTableHeaders" :items="vuetifyDataTableItems" />
			</v-row>
		</v-container>
	</div>
</template>

<script lang="ts">
import lodash, { truncate } from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { Data2D } from "@/util/lemmaimport/datacontainers";
import { defaultOptions, type SupportedFilesOptions } from "@/util/lemmaimport/options";

import CsvImporter from "./CsvImporter.vue";

/**
 * Select A File, Choose Options, Have A Preview
 */
@Component({
	components: {
		CsvImporter,
	},
})
export default class ImportFileDialog extends Vue {
	/**
	 * Preloaded file options from storage
	 */
	@Prop({ required: true }) preloadedFileOptions!: SupportedFilesOptions;

	file: File | null = null;

	localOptions: SupportedFilesOptions = defaultOptions;

	rawData: Array<Array<string>> | null = null;
	fileType: SupportedFilesOptions["fileType"] = "text/csv";

	get localData(): Data2D | null {
		if (this.rawData == null || this.rawData.length === 0) {
			return null;
		}

		return new Data2D(this.headers, this.tableBody);
	}

	get headers(): Array<string> {
		if (this.rawData == null || this.rawData.length === 0) {
			return [];
		}
		return this.localOptions.useFirstRowAsHeaders
			? this.rawData[0]!
			: lodash.range(1, this.rawData[0]!.length + 1).map(String);
	}

	get tableBody(): Array<Array<string>> {
		if (this.rawData == null || this.rawData.length === 0) {
			return [];
		}

		return this.localOptions.useFirstRowAsHeaders
			? this.rawData.slice(1, this.rawData.length)
			: this.rawData;
	}

	emitOptions(): void {
		this.$emit("options", this.localOptions);
	}

	emitData(): void {
		if (this.localData == null) {
			return;
		}

		this.$emit("data", this.localData);
	}

	submit(): void {
		this.$emit("submit");
	}

	@Watch("preloadedOptions", { deep: true, immediate: true })
	watchPreloadedOptions() {
		this.localOptions = this.preloadedFileOptions;
		this.fileType = this.preloadedFileOptions.fileType;
	}

	@Watch("rawData")
	@Watch("localOptions")
	watchLocalData() {
		this.emitData();
	}

	@Watch("localOptions")
	watchLocalOptions() {
		this.emitOptions();
	}

	/**
	 * Provide this: https://vuetifyjs.com/en/api/v-data-table/#props-headers
	 */
	get vuetifyDataTableHeaders() {
		return this.headers.map((header) => {
			return {
				text: header,
				value: header,
				align: "start",
				sortable: false, // Preview only, don't give the feeling, that you can chnge here anything.
				filterable: false, // Preview only, don't give the feeling, that you can chnge here anything.
			};
		});
	}

	/**
	 * According to the documentation the await any array (https://vuetifyjs.com/en/api/v-data-table/#props-items), but this does not work.
	 *
	 *  In https://github.com/vuetifyjs/vuetify/blob/master/packages/docs/src/examples/v-data-table/prop-custom-filter.vue they await an object with heder names as keys …
	 */
	get vuetifyDataTableItems() {
		const headers = this.headers;
		const truncatedRows = this.tableBody.map((row) =>
			row.map((value) => truncate(value, { length: 25, omission: " […]" })),
		);
		return truncatedRows.map((row) => Object.fromEntries(lodash.zip(headers, row)));
	}
}
</script>
