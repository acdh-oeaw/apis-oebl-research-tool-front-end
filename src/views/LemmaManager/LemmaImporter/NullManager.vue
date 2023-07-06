<template>
	<div class="null-manager-container">
		<v-container>
			<v-row class="null-managment-options">
				<v-col>
					<v-combobox
						v-model="localNullValues"
						multiple
						:items="vuetifyNullSelect"
						label="Nullwerte"
						deletable-chips
						small-chips
					/>
				</v-col>
			</v-row>
			<v-row v-if="nullPrototypes.length" class="fields-missing">
				<v-col>
					<lemma-previewer
						:lemmas="nullPrototypes"
						label="Lemmas ohne Nachname können nicht importiert werden."
					/>
				</v-col>
			</v-row>
			<v-row class="nulled-result">
				<v-col>
					<lemma-previewer
						:lemmas="lemmaPrototypesWithRequiredFields"
						label="Diese Lemmas werden importiert."
					/>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import {
	type LemmaPrototypeNullableStringType,
	type LemmaPrototypeRequiredFieldsType,
	type LemmaPrototypeStringType,
} from "@/util/lemmaimport/datacontainers";
import {
	filterMissingRequiredFields,
	getMissingRequiredFieldIndexes,
	replaceNullStrings,
	showMissingRequiredFields,
} from "@/util/lemmaimport/dataconversion";

import LemmaPreviewer from "./LemmaPreviewer.vue";

@Component({
	components: {
		LemmaPreviewer,
	},
})
export default class NullManager extends Vue {
	@Prop({ required: true }) lemmaPrototypes!: Array<LemmaPrototypeStringType>;
	@Prop({ required: true }) preloadedNullValues!: Array<string>;

	localNullValues: Array<string> = [];

	@Watch("preloadedNullValues", { immediate: true, deep: true })
	setLocalOptions() {
		this.localNullValues = this.preloadedNullValues;
	}

	get lemmasWithNulls(): Array<LemmaPrototypeNullableStringType> {
		return this.lemmaPrototypes.map((lemmaPrototype) =>
			replaceNullStrings(lemmaPrototype, this.localNullValues),
		);
	}

	get lemmaPrototypesWithRequiredFields(): Array<LemmaPrototypeRequiredFieldsType> {
		return filterMissingRequiredFields(this.lemmasWithNulls);
	}

	get nullPrototypes(): Array<LemmaPrototypeNullableStringType> {
		return showMissingRequiredFields(this.lemmasWithNulls);
	}

	get missingRequiredFieldIndexes(): Array<number> {
		return getMissingRequiredFieldIndexes(this.nullPrototypes);
	}

	@Watch("options", { deep: true, immediate: true })
	@Watch("lemmaPrototypesWithRequiredFields", { deep: true, immediate: true })
	submit() {
		this.$emit("options", this.localNullValues);
		this.$emit("data", this.lemmaPrototypesWithRequiredFields);
		this.$emit("missingRowsIndexes", this.missingRequiredFieldIndexes);
	}

	// https://vuetifyjs.com/en/api/v-autocomplete/#props-items
	get vuetifyNullSelect() {
		return this.localNullValues.map((nullValue) => {
			return {
				text: JSON.stringify(nullValue),
				value: nullValue,
			};
		});
	}
}
</script>
