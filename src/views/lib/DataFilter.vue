<template>
	<div>
		<div v-for="(filter, i) in localFilterItems" :key="i">
			<v-card
				flat
				color="transparent"
				height="38"
				class="text-body-2 input-no-stroke d-flex pa-1 pr-2 flex-nowrap align-center"
			>
				<select-menu
					v-model="filter.column"
					btn-class="caption"
					:width="80"
					:items="columns.filter((c) => c.filterable === true)"
					search-placeholder="Spalte wählen …"
					key-name="name"
					key-value="value"
					@input="emitInput"
				/>
				<select-menu
					v-model="filter.comparator"
					btn-class="caption"
					:width="70"
					:items="comparators"
					search-placeholder="Vergleich nach …"
					key-value="value"
					key-name="name"
					:return-value="true"
					@input="emitInput"
				/>
				<div class="flex-grow-1 pl-2">
					<v-select
						v-if="filter.column.type === 'boolean'"
						v-model="filter.query"
						:value="'true'"
						:items="[
							{ value: 'true', text: 'Ja' },
							{ value: 'false', text: 'Nein' },
						]"
						:menu-props="{
							contentClass: 'rounded-lg soft-shadow background darken-2 v-list--nav',
						}"
						color="background darken-2"
						single-line
						flat
						dense
						hide-details
						append-icon=""
						class="text-body-2"
						@input="emitInput"
					/>
					<v-text-field
						v-else
						v-model="filter.query"
						:disabled="!isFilterWithInput(filter)"
						autocomplete="off"
						style="min-width: 60px"
						placeholder="Abfrage…"
						class="text-body-2"
						dense
						hide-details
						@keydown.esc="
							() => {
								filter.query = '';
								emitInput();
							}
						"
						@input="debouncedEmitInput"
					/>
				</div>
				<div class="flex-nowrap text-no-wrap">
					<v-btn
						:disabled="
							localFilterItems.length === 1 && (filter.query === '' || filter.query === null)
						"
						icon
						small
						@click="removeFilterItem(i)"
					>
						<v-icon
							v-if="localFilterItems.length === 1 && filter.query !== null && filter.query !== ''"
							style="transform: rotate(45deg)"
						>
							mdi-plus-circle-outline
						</v-icon>
						<v-icon v-else>mdi-minus-circle-outline</v-icon>
					</v-btn>
					<v-btn icon small @click="addFilterItem">
						<v-icon>mdi-plus-circle-outline</v-icon>
					</v-btn>
				</div>
			</v-card>
			<v-divider
				v-if="localFilterItems.length > 1 && i !== localFilterItems.length - 1"
				class="mx-2"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { clone, debounce } from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { type LemmaColumn, type LemmaFilterComparator,type LemmaFilterItem } from "@/types/lemma";

import SelectMenu from "./SelectMenu.vue";

@Component({
	components: {
		SelectMenu,
	},
})
export default class DataFilter extends Vue {
	@Prop({ default: () => [] }) columns!: Array<LemmaColumn>;
	@Prop({ default: () => [] }) value!: Array<LemmaFilterItem>;
	@Prop({ default: () => [] }) comparators!: Array<LemmaFilterComparator>;

	defaultFilterItem = {
		column: this.columns[1],
		comparator: this.comparators[0].value,
		query: "",
	};

	debouncedEmitInput = debounce(this.emitInput);

	emitInput() {
		this.$emit("input", this.localFilterItems);
	}

	isFilterWithInput(f: LemmaFilterItem): boolean {
		return f.comparator !== "exists" && f.comparator !== "exists-not";
	}

	get localFilterItems() {
		if (this.value.length === 0) {
			return [clone(this.defaultFilterItem)];
		} else {
			return this.value;
		}
	}

	addFilterItem() {
		this.$emit("input", this.localFilterItems.concat(clone(this.defaultFilterItem)));
	}

	removeFilterItem(i: number) {
		if (this.value.length === 1) {
			// reset first query value
			this.$emit("input", [{ ...this.value[0], query: "" }]);
		} else {
			// remove filter item
			this.$emit(
				"input",
				this.value.filter((f, fi) => i !== fi),
			);
		}
	}
}
</script>

<style lang="scss" scoped></style>
