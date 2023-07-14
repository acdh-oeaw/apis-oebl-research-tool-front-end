<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { importLemmas } from "@/lib/lemmaimport/lemmaimport";
import { type NewLemmaRow } from "@/types/lemma";
import LemmaPreviewer from "@/views/LemmaManager/LemmaImporter/LemmaPreviewer.vue";

@Component({
	components: {
		LemmaPreviewer,
	},
})
export default class LemmaImporter extends Vue {
	@Prop({ required: true }) lemmasToImport!: Array<NewLemmaRow>;

	/**
	 * Percent of already imported lemmas as 0 <= p <= 100
	 */
	percentDone = 0;
	doingImport = false;
	errorMessage: string | null = null;

	importLemmas() {
		this.errorMessage = null;
		this.doingImport = true;
		this.percentDone = 50; // Give feeling of progress
		importLemmas(this.lemmasToImport)
			.then(() => {
				this.percentDone = 100;
				this.doingImport = false;
			})
			.catch((reason) => {
				this.doingImport = false;
				this.percentDone = 0;
				this.errorMessage = "Der Import ist leider fehlgeschlagen";
				console.error({ message: "Could not iport lemmas.", reason });
			});
	}
}
</script>

<template>
	<div class="lemma-importer-container">
		<v-container>
			<v-row class="lemma-importer-dialog">
				<v-col class="lemma-importer-submit">
					<v-btn @click="importLemmas">{{ lemmasToImport.length }} Lemmas importieren</v-btn>
				</v-col>
				<v-col class="lemma-importer-feedback">
					<v-progress-circular v-if="doingImport" :value="percentDone" />
					<v-alert v-else-if="percentDone === 100" type="success">
						{{ lemmasToImport.length }} Lemmas importiert
					</v-alert>
					<v-alert v-else-if="errorMessage !== null" type="error">{{ errorMessage }}</v-alert>
				</v-col>
			</v-row>
			<v-row class="lemma-importer-preview">
				<v-col>
					<lemma-previewer label="Dieses Lemmas werden importiert" :lemmas="lemmasToImport" />
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>
