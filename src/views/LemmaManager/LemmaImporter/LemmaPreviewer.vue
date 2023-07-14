<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { type LemmaRow } from "@/types/lemma";
import { lemmaRowTranslations } from "@/lib/labels";

const showThisColumns: Array<keyof LemmaRow> = [
	"firstName",
	"lastName",
	"gender",
	"dateOfBirth",
	"dateOfDeath",
	"professionDetail",
	"bioNote",
	"kinship",
	"religion",
	"gnd",
	"loc",
	"viaf_id",
];

@Component({})
export default class LemmaPreviewer extends Vue {
	@Prop() lemmas!: Array<Partial<LemmaRow>>;
	@Prop({ default: "Vorschau" }) label!: string;

	/**
	 * https://vuetifyjs.com/en/api/v-data-table/#props-headers
	 */
	get lemmaHeaders() {
		return showThisColumns.map((columnName) => {
			return {
				text: lemmaRowTranslations[columnName]!.de,
				value: columnName,
				sortable: true,
				filterable: true,
			};
		});
	}
}
</script>

<template>
	<div class="import-lemma-preview-container">
		<v-container>
			<v-row>
				<v-col>
					{{ label }}
				</v-col>
			</v-row>
			<v-row>
				<v-col>
					<v-data-table :headers="lemmaHeaders" :items="lemmas"></v-data-table>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>
@/lib/labels
