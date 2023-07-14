<script lang="ts" setup>
import { type LemmaRow } from "@/types/lemma";

const props = defineProps<{
	lemmaRow: LemmaRow;
}>();

function generatePrintWindow(): Window {
	/** Attempt to get a A4-like shape. */
	const height = window.screen.availHeight;
	const width = height * 0.707;

	const printWindow = window.open(
		`/lemmas/${props.lemmaRow.id}/print?minimal=1`,
		"_printLemmaWindow",
		`popup,innerHeight=${height},innerWidth=${width}`,
	);

	if (printWindow == null) {
		alert("Derzeit ist leider kein Druck möglich. Bitte wenden Sie sich an das Entwicklungsteam.");

		throw new Error(
			"Printing failed, whyever: I do not find, where I should look up the reason: Good luck, fellow being!",
		);
	}

	return printWindow;
}
</script>

<template>
	<div>
		<VBtn icon @click="generatePrintWindow">
			<VIcon>mdi-printer</VIcon>
		</VBtn>
	</div>
</template>
