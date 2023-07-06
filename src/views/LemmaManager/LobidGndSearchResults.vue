<template>
	<div class="results">
		<v-overlay absolute v-if="loading">
			<loading-spinner :color="$vuetify.theme.dark ? 'white' : undefined" />
		</v-overlay>
		<lobid-preview-card
			v-if="resultGnds.length !== 0"
			@input="$emit('input', $event)"
			:gnd="resultGnds"
		/>
		<div v-else style="opacity: 0.7" class="caption text-center">(Nichts gefunden)</div>
	</div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { findPerson } from "@/service/lobid";
import { ImportablePerson } from "@/types/lemma";
import LobidPreviewCard from "./LobidPreviewCard.vue";
import LoadingSpinner from "@/views/lib/LoadingSpinner.vue";

@Component({
	components: {
		LobidPreviewCard,
		LoadingSpinner,
	},
})
export default class LobidGndSearchResults extends Vue {
	@Prop({ default: null }) searchPerson!: Partial<ImportablePerson> | null;
	@Prop({ default: () => [] }) value!: string[];

	loading = false;
	resultGnds: string[] = [];

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
		if (this.searchPerson !== null) {
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
