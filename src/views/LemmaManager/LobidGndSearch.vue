<template>
	<!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
	<div tabindex="-1" @keyup.esc="$emit('cancel')">
		<!-- @vue-expect-error -->
		<text-field
			v-model="localLemma.firstName"
			:label="lemmaRowTranslations.firstName.de"
			@input="debouncedSearchGnd"
		></text-field>
		<!-- @vue-expect-error -->
		<text-field
			v-model="localLemma.lastName"
			:label="lemmaRowTranslations.lastName.de"
			@input="debouncedSearchGnd"
		></text-field>
		<!-- @vue-expect-error -->
		<text-field
			:value="localValue.length > 0 ? localValue[0] : ''"
			placeholder="manuell wählen…"
			:label="lemmaRowTranslations.gnd.de"
			:color="undefined"
			@input="useCustomGnd($event)"
		></text-field>
		<div class="results pt-3">
			<v-overlay v-if="loading" absolute>
				<loading-spinner :color="$vuetify.theme.dark ? 'white' : undefined" />
			</v-overlay>
			<lobid-preview-card
				v-if="resultGnds.length !== 0"
				:value="localValue"
				:gnd="resultGnds"
				@input="onSelectGnd"
			/>
			<div v-else style="opacity: 70%" class="caption text-center">(Nichts gefunden)</div>
		</div>
		<div class="background mt-3 pb-3" style="position: sticky; bottom: 0">
			<v-btn
				color="secondary"
				class="mb-2 rounded-lg"
				block
				elevation="0"
				@click="$emit('input', localValue)"
			>
				{{ localValue.length > 0 ? "Auswahl speichern" : "Zurücksetzten" }}
			</v-btn>
			<v-btn
				color="background darken-2"
				class="rounded-lg"
				block
				elevation="0"
				@click="$emit('cancel')"
			>
				abbrechen
			</v-btn>
		</div>
	</div>
</template>

<script lang="ts">
import { clone, debounce } from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { findPerson } from "@/service/lobid";
import { type LemmaRow } from "@/types/lemma";
import LoadingSpinner from "@/views/lib/LoadingSpinner.vue";
import TextField from "@/views/lib/TextField.vue";

import { lemmaRowTranslations } from "../../util/labels";
import LobidPreviewCard from "./LobidPreviewCard.vue";

@Component({
	components: {
		LobidPreviewCard,
		LoadingSpinner,
		TextField,
	},
})
export default class LobidGndSearch extends Vue {
	@Prop({ required: true }) lemma!: LemmaRow;
	@Prop({ default: () => [] }) gnd!: Array<string>;
	@Prop({ default: Array }) value!: Array<string>;
	lemmaRowTranslations = lemmaRowTranslations;

	loading = false;
	localLemma: LemmaRow = clone(this.lemma);
	localValue: Array<string> = clone(this.value);
	debouncedSearchGnd = debounce(this.searchGnd, 150);
	resultGnds: Array<string> = [];

	@Watch("value", { immediate: true })
	onChangeValue() {
		this.localValue = this.value;
	}

	onSelectGnd(gnds: Array<string>) {
		this.localValue = gnds;
	}

	saveGnd(gnd: string) {
		this.$emit("input", gnd);
	}

	@Watch("gnd", { immediate: true, deep: true })
	onChangeGnd(g: Array<string>) {
		this.resultGnds = clone(g);
	}

	@Watch("lemma", { immediate: true, deep: true })
	onChangeLemma() {
		this.localLemma = clone(this.lemma);
	}

	useCustomGnd(gnd: string | null) {
		if (gnd == null) {
			return;
		}
		const normalizedGND = gnd.trim();

		if (normalizedGND === "") {
			return;
		}
		this.resultGnds = [gnd];
	}

	async searchGnd() {
		this.loading = true;
		this.resultGnds = (
			await findPerson({
				firstName: this.localLemma!.firstName ?? null,
				lastName: this.localLemma!.lastName,
				dateOfBirth: null,
				dateOfDeath: null,
				gnd: this.localLemma!.gnd,
			})
		).map((l: any) => l.gndIdentifier);
		this.loading = false;
	}
}
</script>

<style lang="stylus" scoped>
.results
  position relative
</style>
