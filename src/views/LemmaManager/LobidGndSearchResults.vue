<template>
	<div class="results">
		<v-overlay v-if="loading" absolute>
			<loading-spinner :color="$vuetify.theme.dark ? 'white' : undefined" />
		</v-overlay>
		<lobid-preview-card
			v-if="resultGnds.length !== 0"
			:gnd="resultGnds"
			@input="$emit('input', $event)"
		/>
		<div v-else style="opacity: 70%" class="caption text-center">(Nichts gefunden)</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { findPerson } from "@/service/lobid";
import { type ImportablePerson } from "@/types/lemma";
import LoadingSpinner from "@/views/lib/LoadingSpinner.vue";

import LobidPreviewCard from "./LobidPreviewCard.vue";

@Component({
	components: {
		LobidPreviewCard,
		LoadingSpinner,
	},
})
export default class LobidGndSearchResults extends Vue {
	@Prop({ default: null }) searchPerson!: Partial<ImportablePerson> | null;
	@Prop({ default: () => [] }) value!: Array<string>;

	loading = false;
	resultGnds: Array<string> = [];

	emptyPerson: ImportablePerson = {
		firstName: null,
		lastName: null,
		dateOfBirth: null,
		dateOfDeath: null,
		gnd: [],
	};

	@Watch("value")
	onChangValue() {
		this.resultGnds = this.value;
	}

	@Watch("person", { deep: true })
	async onChangePersonQuery() {
		if (this.searchPerson != null) {
			this.loading = true;
			this.resultGnds = (
				await findPerson({
					...this.emptyPerson,
					...this.searchPerson,
				})
			).map((l: any) => l.gndIdentifier);
			this.loading = false;
		}
	}
}
</script>

<style lang="scss" scoped></style>
