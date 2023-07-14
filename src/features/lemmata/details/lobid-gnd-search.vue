<script lang="ts" setup>
import { clone, debounce } from "lodash";
import { ref, watch } from "vue";

import LobidPreviewCard from "@/features/lemmata/lobid-preview-card.vue";
import LoadingSpinner from "@/features/ui/loading-spinner.vue";
import TextField from "@/features/ui/text-field.vue";
import { lemmaRowTranslations } from "@/lib/labels";
import { findPerson } from "@/service/lobid";
import { type LemmaRow } from "@/types/lemma";

const props = withDefaults(
	defineProps<{
		lemma: LemmaRow;
		gnd?: Array<string>;
		value?: Array<string>;
	}>(),
	{
		gnd: () => [],
		value: () => [],
	},
);

const emit = defineEmits<{
	(event: "cancel"): void;
	(event: "input", value: Array<string>): void;
}>();

const loading = ref(false);
const localLemma = ref(clone(props.lemma));
const localValue = ref(clone(props.value));

const debouncedSearchGnd = debounce(searchGnd, 150);
const resultGnds = ref<Array<string>>([]);

watch(
	() => props.value,
	() => {
		localValue.value = props.value;
	},
	{ immediate: true },
);

function onSelectGnd(gnds: Array<string>) {
	localValue.value = gnds;
}

watch(
	() => props.gnd,
	(gnd) => {
		resultGnds.value = clone(gnd);
	},
	{ immediate: true, deep: true },
);

watch(
	() => props.lemma,
	() => {
		localLemma.value = clone(props.lemma);
	},
	{ immediate: true, deep: true },
);

function useCustomGnd(gnd: string | null) {
	if (gnd === null) {
		return;
	}
	const normalizedGND = gnd.trim();

	if (normalizedGND === "") {
		return;
	}

	resultGnds.value = [gnd];
}

async function searchGnd() {
	loading.value = true;

	resultGnds.value = (
		await findPerson({
			firstName: localLemma.value!.firstName ?? null,
			lastName: localLemma.value!.lastName,
			dateOfBirth: null,
			dateOfDeath: null,
			gnd: localLemma.value!.gnd,
		})
	).map((l: any) => l.gndIdentifier);

	loading.value = false;
}
</script>

<template>
	<!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
	<div tabindex="-1" @keyup.esc="emit('cancel')">
		<TextField
			v-model="localLemma.firstName"
			:label="lemmaRowTranslations.firstName.de"
			@input="debouncedSearchGnd"
		/>

		<TextField
			v-model="localLemma.lastName"
			:label="lemmaRowTranslations.lastName.de"
			@input="debouncedSearchGnd"
		/>

		<TextField
			:value="localValue.length > 0 ? localValue[0] : ''"
			placeholder="manuell wählen…"
			:label="lemmaRowTranslations.gnd.de"
			:color="undefined"
			@input="useCustomGnd($event)"
		/>

		<div class="results pt-3">
			<VOverlay v-if="loading" absolute>
				<LoadingSpinner :color="$vuetify.theme.dark ? 'white' : undefined" />
			</VOverlay>

			<LobidPreviewCard
				v-if="resultGnds.length !== 0"
				:value="localValue"
				:gnd="resultGnds"
				@input="onSelectGnd"
			/>
			<div v-else style="opacity: 70%" class="caption text-center">(Nichts gefunden)</div>
		</div>

		<div class="background mt-3 pb-3" style="position: sticky; bottom: 0">
			<VBtn
				color="secondary"
				class="mb-2 rounded-lg"
				block
				elevation="0"
				@click="emit('input', localValue)"
			>
				{{ localValue.length > 0 ? "Auswahl speichern" : "Zurücksetzten" }}
			</VBtn>

			<VBtn
				color="background darken-2"
				class="rounded-lg"
				block
				elevation="0"
				@click="emit('cancel')"
			>
				abbrechen
			</VBtn>
		</div>
	</div>
</template>

<style scoped>
.results {
	position: relative;
}
</style>
@/lib/labels
