<template>
	<div class="lemma-formatter-container">
		<v-container>
			<v-row class="lemma-formatting-options">
				<v-col>
					<v-expansion-panels multiple>
						<v-expansion-panel class="null-managment-row">
							<v-expansion-panel-header>Null-Werte</v-expansion-panel-header>
							<v-expansion-panel-content eager>
								<null-manager
									:lemma-prototypes="lemmaPrototypes"
									:preloaded-null-values="localOptions.nullValues"
									@options="localOptions.nullValues = $event"
									@data="lemmasPrototypesWithNullsAndRequiredFields = $event"
									@missingRowsIndexes="missingRowsIndexes = $event"
								/>
							</v-expansion-panel-content>
						</v-expansion-panel>
						<v-expansion-panel>
							<v-expansion-panel-header>Datumsformattierung</v-expansion-panel-header>
							<v-expansion-panel-content eager>
								<date-formatter
									:lemma-prototypes="lemmasPrototypesWithNullsAndRequiredFields"
									:preloaded-date-format-option="localOptions.dateFormat"
									@data="dates = $event"
									@options="localOptions.dateFormat = $event"
								/>
							</v-expansion-panel-content>
						</v-expansion-panel>
						<v-expansion-panel>
							<v-expansion-panel-header>Gender</v-expansion-panel-header>
							<v-expansion-panel-content eager>
								<gender-mapper
									:lemma-prototypes="lemmasPrototypesWithNullsAndRequiredFields"
									:preloaded-options="localOptions.genderMapping"
									@data="genders = $event"
									@options="localOptions.genderMapping = $event"
								/>
							</v-expansion-panel-content>
						</v-expansion-panel>
					</v-expansion-panels>
				</v-col>
			</v-row>
			<v-row class="submit-lemma-formatting-row">
				<v-col>
					<v-btn @click="submit">Weiter</v-btn>
				</v-col>
			</v-row>
			<v-row class="lemma-formatting-preview-row">
				<v-col>
					<lemma-previewer :lemmas="newLemmas" />
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { type NewLemmaRow } from "@/types/lemma";
import {
	type LemmaDates,
	type LemmaGender,
	type LemmaPrototypeRequiredFieldsType,
	type LemmaPrototypeStringType,
} from "@/util/lemmaimport/datacontainers";
import { mergeBuildNewLemmaRows } from "@/util/lemmaimport/dataconversion";
import {
	defautLemmaFormatterOptions,
	type LemmaFormatterOptions,
} from "@/util/lemmaimport/options";
import DateFormatter from "@/views/LemmaManager/LemmaImporter/DateFormatter.vue";
import GenderMapper from "@/views/LemmaManager/LemmaImporter/GenderMapper.vue";
import LemmaPreviewer from "@/views/LemmaManager/LemmaImporter/LemmaPreviewer.vue";
import NullManager from "@/views/LemmaManager/LemmaImporter/NullManager.vue";

/**
 * Takes LemmaPrototypes And Converts Them To LemmaRows
 */
@Component({
	components: {
		NullManager,
		DateFormatter,
		GenderMapper,
		LemmaPreviewer,
	},
})
export default class LemmaFormatter extends Vue {
	@Prop({ required: true, default: Array })
	lemmaPrototypes!: Array<LemmaPrototypeStringType>;
	@Prop({ required: true }) preloadedOptions!: LemmaFormatterOptions;

	localOptions: LemmaFormatterOptions = defautLemmaFormatterOptions;

	@Watch("preloadedOptions", { immediate: true, deep: true })
	setLocalOptions() {
		this.localOptions = this.preloadedOptions;
	}

	lemmasPrototypesWithNullsAndRequiredFields: Array<LemmaPrototypeRequiredFieldsType> = [];

	// Some rows, will not be imported. These are their indexes.
	missingRowsIndexes: Array<number> = [];

	dates: Array<LemmaDates> = [];
	genders: Array<LemmaGender> = [];

	get newLemmas(): Array<NewLemmaRow> {
		// If not all columns are definied, do not create data.
		if (
			new Set([
				this.lemmasPrototypesWithNullsAndRequiredFields.length, // Basic data
				this.dates.length,
				this.genders.length, // New formatted data
			]).size !== 1
		) {
			return []; // Columns not ready: No result!
		}
		return mergeBuildNewLemmaRows(
			this.lemmasPrototypesWithNullsAndRequiredFields,
			this.dates,
			this.genders,
		);
	}

	@Watch("newLemmas", { immediate: true, deep: true })
	@Watch("options", { immediate: true, deep: true })
	emit() {
		this.$emit("data", this.newLemmas);
		this.$emit("options", this.localOptions);
		this.$emit("missingRowsIndexes", this.missingRowsIndexes);
	}

	submit() {
		this.$emit("submit");
	}
}
</script>
