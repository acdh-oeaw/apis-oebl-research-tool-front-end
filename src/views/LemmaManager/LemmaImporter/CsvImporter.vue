<template>
	<div class="csv-importer-container">
		<v-container>
			<v-row justify="start">
				<v-col cols="4" class="separator-field">
					<v-autocomplete
						v-model="localOptions.separator"
						label="Trennzeichen"
						:items="separatorSuggestions"
					/>
				</v-col>
				<v-col cols="4" class="text-delimiter-field">
					<v-autocomplete
						v-model="localOptions.textDelimiter"
						label="Texttrenner"
						:items="textDelimiterSuggestions"
					/>
				</v-col>
				<v-col cols="4" class="text-delimiter-field">
					<v-autocomplete
						label="Zeilentrenner"
						:value="JSON.stringify(localOptions.newLine)"
						:items="newLineSuggestions.map((value) => JSON.stringify(value))"
						@change="localOptions.newLine = JSON.parse($event)"
					/>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>

<script lang="ts">
import lodash from "lodash";
import neatCsv from "neat-csv";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { type CsvOptions, defaultOptions } from "@/util/lemmaimport/options";

@Component
export default class CsvImporter extends Vue {
	@Prop({ required: true }) file!: File;
	@Prop({ required: true }) preloadedOptions!: CsvOptions;

	@Watch("localOptions", { deep: true, immediate: true })
	emitOptions(): void {
		if (lodash.isEqual(this.localOptions, this.preloadedOptions)) {
			return;
		}
		this.$emit("options", this.localOptions);
	}

	@Watch("data", { deep: true, immediate: false })
	emitData(): void {
		this.$emit("data", this.data);
	}

	plainText: string | null = null;
	data: Array<Array<string>> = [[]];
	localOptions: CsvOptions = defaultOptions;

	separatorSuggestions = [",", ";", "\t"];
	textDelimiterSuggestions = ["'", '"'];
	newLineSuggestions = ["\n", "\r\n"];

	@Watch("preloadedOptions", { deep: true, immediate: true })
	watchPreloadedOptions() {
		this.localOptions = this.preloadedOptions;
	}

	@Watch("file", { deep: true, immediate: true })
	watchFile() {
		this.file.text().then((text: string) => (this.plainText = text));
	}

	@Watch("plainText", { deep: false, immediate: false })
	@Watch("localOptions", { deep: true, immediate: false })
	parsePlainText() {
		if (this.plainText === null) {
			return;
		}
		neatCsv(
			this.plainText,
			// https://github.com/mafintosh/csv-parser#options
			{
				escape: this.localOptions.textDelimiter,
				headers: false,
				newline: this.localOptions.newLine,
				quote: this.localOptions.textDelimiter,
				separator: this.localOptions.separator,
			},
		).then((rows) => (this.data = rows.map((cells) => Object.values(cells).map(String))));
	}
}
</script>
