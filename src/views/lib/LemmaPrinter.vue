<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { type LemmaRow } from "@/types/lemma";

@Component
export default class LemmaPrinter extends Vue {
	@Prop() lemmaRow!: LemmaRow;

	generatePrintWindow(): Window {
		// An attempt to get a A4-like shape
		const height = window.screen.availHeight;
		const width = height * 0.707;

		const printWindow = window.open(
			`/lemmas/print/${this.lemmaRow.id}?minimal=1`,
			"_printLemmaWindow",
			`popup,innerHeight=${height},innerWidth=${width}`,
		);

		if (printWindow === null) {
			alert(
				"Derzeit ist leider kein Druck möglich. Bitte wenden Sie sich an das Entwicklungsteam.",
			); // Top message! ;-)
			throw new Error(
				"Printing failed, whyever: I do not find, where I should look up the reason: Good luck, fellow being!",
			);
		}

		return printWindow;
	}
}
</script>

<template>
	<div class="lemma-printer-container">
		<v-btn icon @click="generatePrintWindow">
			<v-icon>mdi-printer</v-icon>
		</v-btn>
	</div>
</template>
