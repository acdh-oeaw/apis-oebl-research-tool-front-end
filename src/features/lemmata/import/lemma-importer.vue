<script lang="ts" setup>
import { ref } from "vue";

import LemmaPreviewer from "@/features/lemmata/import/lemma-previewer.vue";
import { importLemmas } from "@/lib/lemmaimport/lemmaimport";
import { type NewLemmaRow } from "@/types/lemma";

const props = defineProps<{
	lemmasToImport: Array<NewLemmaRow>;
}>();

/**
 * Percent of already imported lemmas as 0 <= p <= 100
 */
const percentDone = ref(0);
const doingImport = ref(false);
const errorMessage = ref<string | null>(null);

function onImportLemmas() {
	errorMessage.value = null;
	doingImport.value = true;
	percentDone.value = 50; // Give feeling of progress

	importLemmas(props.lemmasToImport)
		.then(() => {
			percentDone.value = 100;
			doingImport.value = false;
		})
		.catch((reason) => {
			doingImport.value = false;
			percentDone.value = 0;
			errorMessage.value = "Der Import ist leider fehlgeschlagen";

			console.error({ message: "Could not iport lemmas.", reason });
		});
}
</script>

<template>
	<div class="lemma-importer-container">
		<VContainer>
			<VRow class="lemma-importer-dialog">
				<VCol class="lemma-importer-submit">
					<VBtn @click="onImportLemmas">{{ lemmasToImport.length }} Lemmas importieren</VBtn>
				</VCol>
				<VCol class="lemma-importer-feedback">
					<VProgressCircular v-if="doingImport" :value="percentDone" />
					<VAlert v-else-if="percentDone === 100" type="success">
						{{ lemmasToImport.length }} Lemmas importiert
					</VAlert>
					<VAlert v-else-if="errorMessage !== null" type="error">{{ errorMessage }}</VAlert>
				</VCol>
			</VRow>
			<VRow class="lemma-importer-preview">
				<VCol>
					<LemmaPreviewer label="Dieses Lemmas werden importiert" :lemmas="lemmasToImport" />
				</VCol>
			</VRow>
		</VContainer>
	</div>
</template>
