<script lang="ts" setup>
import { debounce } from "@acdh-oeaw/lib";
import { clone } from "lodash";
import { computed } from "vue";

import SelectMenu from "@/features/ui/select-menu.vue";
import { type LemmaColumn, type LemmaFilterComparator, type LemmaFilterItem } from "@/types/lemma";

const props = defineProps<{
	columns: Array<LemmaColumn>;
	value: Array<LemmaFilterItem>;
	comparators: Array<LemmaFilterComparator>;
}>();

const emit = defineEmits<{
	(event: "input", value: Array<LemmaFilterItem>): void;
}>();

const defaultFilterItem = computed(() => ({
	column: props.columns[1]!,
	comparator: props.comparators[0]!.value,
	query: "",
}));

function emitInput() {
	emit("input", localFilterItems.value);
}

const debouncedEmitInput = debounce(emitInput, 150);

function isFilterWithInput(f: LemmaFilterItem): boolean {
	return f.comparator !== "exists" && f.comparator !== "exists-not";
}

const localFilterItems = computed(() => {
	if (props.value.length === 0) {
		return [clone(defaultFilterItem.value)];
	} else {
		return props.value;
	}
});

function addFilterItem() {
	emit("input", localFilterItems.value.concat(clone(defaultFilterItem.value)));
}

function removeFilterItem(i: number) {
	if (props.value.length === 1) {
		// reset first query value
		emit("input", [{ ...props.value[0]!, query: "" }]);
	} else {
		// remove filter item
		emit(
			"input",
			props.value.filter((f, fi) => i !== fi),
		);
	}
}
</script>

<template>
	<div>
		<div v-for="(filter, i) in localFilterItems" :key="i">
			<VCard
				flat
				color="transparent"
				height="38"
				class="text-body-2 input-no-stroke d-flex pa-1 pr-2 flex-nowrap align-center"
			>
				<SelectMenu
					v-model="filter.column"
					btn-class="caption"
					:width="80"
					:items="columns.filter((c) => c.filterable === true)"
					search-placeholder="Spalte wählen …"
					key-name="name"
					key-value="value"
					@input="emitInput"
				/>
				<SelectMenu
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
					<VSelect
						v-if="filter.column?.type === 'boolean'"
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
					<VTextField
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
					<VBtn
						:disabled="
							localFilterItems.length === 1 && (filter.query === '' || filter.query == null)
						"
						icon
						small
						@click="removeFilterItem(i)"
					>
						<VIcon
							v-if="localFilterItems.length === 1 && filter.query != null && filter.query !== ''"
							style="transform: rotate(45deg)"
						>
							mdi-plus-circle-outline
						</VIcon>
						<VIcon v-else>mdi-minus-circle-outline</VIcon>
					</VBtn>
					<VBtn icon small @click="addFilterItem">
						<VIcon>mdi-plus-circle-outline</VIcon>
					</VBtn>
				</div>
			</VCard>
			<VDdivider
				v-if="localFilterItems.length > 1 && i !== localFilterItems.length - 1"
				class="mx-2"
			/>
		</div>
	</div>
</template>
