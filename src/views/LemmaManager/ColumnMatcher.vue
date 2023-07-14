<script lang="ts" setup>
import _ from "lodash";
import neatCsv from "neat-csv";
import { ref, watch } from "vue";
import * as XLSX from "xlsx";

import { type Column, type Header, type Row, type SelectOptions, type Table } from "@/types/lemma";

const props = withDefaults(
	defineProps<{
		prefixIgnoredColumns?: string;
		returnIgnoredColumns?: boolean;
		fileType: string;
		fileName: string;
		buffer: ArrayBuffer;
		targetColumns: Array<Column>;
	}>(),
	{
		prefixIgnoredColumns: "ignored.",
	},
);

const emit = defineEmits<{
	(event: "update", value: Table<Row>): void;
}>();

const mimeTypeCsv = "text/csv";
const mimeTypeXls = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const mimeTypeXlsx = "application/vnd.ms-excel";

const headers = ref<Array<Header>>([]);
const initialTable = ref<Table<Row>>([]);
const tablePage = ref(1);
const sheetName = ref("");
const sheetNames = ref<Array<string>>([]);

const separator = ref(";");
const nullValues = ref(["?"]);

const allSeparators: Array<SelectOptions> = [
	{
		text: ",",
		value: ",",
	},
	{
		text: ";",
		value: ";",
	},
	{
		text: "(Tabulator)",
		value: "  ",
	},
];

watch(
	[headers, nullValues, separator, sheetName],
	() => {
		emit("update", convertTable(initialTable.value, headers.value));
	},
	{ deep: true },
);

async function updateSheetName(name: string): Promise<void> {
	sheetName.value = name;
	const [h, c] = await parseExcelToJson(props.buffer, name);
	headers.value = h;
	initialTable.value = c;
}

function isIgnoredValue(v: string): boolean {
	return nullValues.value.indexOf(v) > -1;
}

function convertTable(t: Table<Row>, hs: Array<Header>): Table<Row> {
	const targetColumnsByValue = _.keyBy(props.targetColumns, "value");
	return t.map((r) => {
		return hs.reduce((m, e) => {
			// if the column is selected for import, and the value is not on the ignored list.
			if (e.matchWith !== null && !isIgnoredValue(String(r[e.value]))) {
				if (
					targetColumnsByValue[e.matchWith] !== undefined &&
					targetColumnsByValue[e.matchWith]!.convert !== undefined &&
					r[e.value] !== undefined
				) {
					// console.log(targetColumnsByValue[e.matchWith], r[e.value])
					m[e.matchWith] =
						targetColumnsByValue[e.matchWith]!.convert!(r[e.value]!.toString()) || "";
				} else {
					m[e.matchWith] = r[e.value]!;
				}
				// if the column is ignored, and we should return the ignored columns with a prefix.
			} else if (props.returnIgnoredColumns && e.matchWith === null) {
				m[props.prefixIgnoredColumns + e.value] = r[e.value]!;
			}
			return m;
		}, {} as Row);
	});
}

function getTargetColumnsOptions(h: Header): Array<SelectOptions> {
	return [
		{
			text: props.returnIgnoredColumns ? "erweitertes Feld" : "nicht importieren",
			value: null,
		},
		...props.targetColumns.map((c) => {
			return {
				...c,
				// it’s disabled if it’s already been used in another select/column.
				disabled: h.matchWith !== c.value && headers.value.some((he) => he.matchWith === c.value),
			};
		}),
	];
}

async function parseCsvToJson(
	csv: string,
	separator: string,
): Promise<[Array<Header>, Table<Row>]> {
	const c = await neatCsv(csv, { separator });
	const firstRow = c[0];
	const h = _.map(firstRow, (v, k) => ({
		text: k.trim(),
		value: k.trim(),
		sortable: true,
		matchWith:
			props.targetColumns.find((c) => c.text.toLowerCase() === k.toLowerCase())?.value || null,
	}));
	return [h, c];
}

async function updateSeparator(s: string): Promise<void> {
	const [h, c] = await parseCsvToJson(getTextFromBuffer(props.buffer), s);
	headers.value = h;
	initialTable.value = c;
}

function getTextFromBuffer(f: ArrayBuffer): string {
	const t = new TextDecoder();
	const s = t.decode(f);
	return s;
}

function matchHeaderWith(headerIndex: number, matchWith: string | null): void {
	headers.value[headerIndex]!.matchWith = matchWith;
}

async function parseExcelToJson(
	b: ArrayBuffer,
	useSheetName: string | null = null,
): Promise<[Array<Header>, Table<Row>]> {
	// const { default: XLSX } = await import('xlsx')
	const doc = XLSX.read(b, { type: "buffer", WTF: false });
	const sheets = doc.SheetNames.map((s) => XLSX.utils.sheet_to_json(doc.Sheets[s]!));
	const useSheetIndex = doc.SheetNames.findIndex((s) => s === useSheetName);
	const rows = sheets[useSheetIndex === -1 ? 0 : useSheetIndex] as Array<Row>;
	const headers: Array<Header> = _.map(rows[0], (v, k) => ({
		value: k,
		text: k,
		sortable: true,
		matchWith:
			props.targetColumns.find((c) => c.text.toLowerCase() === k.toLowerCase())?.value || null,
	}));
	sheetNames.value = doc.SheetNames;
	sheetName.value = doc.SheetNames[useSheetIndex === -1 ? 0 : useSheetIndex]!;
	return [headers, rows];
}

watch(
	() => props.buffer,
	async () => {
		if (props.fileType === mimeTypeCsv) {
			const t = await getTextFromBuffer(props.buffer);
			const [h, c] = await parseCsvToJson(t, ";");
			headers.value = h;
			initialTable.value = c;
		} else if (props.fileType === mimeTypeXls || props.fileType === mimeTypeXlsx) {
			const [h, c] = await parseExcelToJson(props.buffer);
			headers.value = h;
			initialTable.value = c;
		}
	},
	{ immediate: true },
);
</script>

<template>
	<VDataTable
		locale="de-AT"
		fixed-header
		dense
		disable-sort
		:page="tablePage"
		height="500"
		hide-default-footer
		:headers="headers"
		:items="initialTable"
		:items-per-page="100"
	>
		<template v-for="(h, i) in headers" #[`header.${h.value}`]="{}">
			<div :key="h.value" class="py-1 custom-header">
				<span class="initial-header">
					{{ h.text }}
				</span>
				<VSelect
					hide-details
					solo
					flat
					:value="h.matchWith"
					background-color="background darken-1"
					:class="['col-select', h.matchWith === null ? 'not-selected' : '', 'rounded-lg']"
					dense
					:items="getTargetColumnsOptions(h)"
					@input="matchHeaderWith(i, $event)"
				/>
			</div>
		</template>
		<template #item="{ item }">
			<tr>
				<td
					v-for="(h, i) in headers"
					:key="i"
					:class="[
						isIgnoredValue(item[h.value]) && 'is-null-equivalent',
						h.matchWith === null && 'do-not-import',
					]"
				>
					{{ item[h.value] }}
				</td>
			</tr>
		</template>
		<template #footer="{}">
			<v-divider />
			<VRow no-gutters class="pa-4 ma-0">
				<VCol cols="3">
					<VSelect
						v-if="fileType === mimeTypeCsv"
						dense
						hide-details
						flat
						background-color="background darken-1"
						class="rounded-lg"
						solo
						:value="separator"
						:items="allSeparators"
						@change="updateSeparator"
					>
						<template #prepend-inner>
							<span class="caption">Trennzeichen</span>
						</template>
					</VSelect>
					<VSelect
						v-if="fileType === mimeTypeXls || fileType === mimeTypeXlsx"
						dense
						hide-details
						label="Tabellenblatt"
						solo
						background-color="background darken-1"
						class="rounded-lg"
						flat
						:value="sheetName"
						:items="sheetNames"
						@change="updateSheetName"
					>
						<template #prepend-inner>
							<span class="caption">Tabellenblatt</span>
						</template>
					</VSelect>
				</VCol>
				<VCol cols="4" class="pl-4">
					<VCombobox
						v-model="nullValues"
						hide-details
						chips
						deletable-chips
						small-chips
						dense
						solo
						flat
						class="rounded-lg"
						background-color="background darken-1"
						multiple
					>
						<template #prepend-inner>
							<span class="caption text-no-wrap">Zellen Ignorieren</span>
						</template>
					</VCombobox>
				</VCol>
				<VCol class="text-right">
					<VBtn :disabled="tablePage === 1" icon @click="tablePage = tablePage - 1">
						<VIcon>mdi-chevron-left</VIcon>
					</VBtn>
					<select
						class="px-2"
						aria-label="Seite auswählen"
						:value="tablePage"
						@change="tablePage = Number($event.target.value)"
					>
						<option v-for="p in Math.ceil(initialTable.length / 100)" :key="p" :value="p">
							Seite {{ p }} von {{ Math.ceil(initialTable.length / 100) }}
						</option>
					</select>
					<VBtn
						:disabled="tablePage === Math.ceil(initialTable.length / 100)"
						icon
						@click="tablePage = tablePage + 1"
					>
						<VIcon>mdi-chevron-right</VIcon>
					</VBtn>
				</VCol>
			</VRow>
		</template>
	</VDataTable>
</template>

<style scoped>
.do-not-import {
	opacity: 50%;
}

.is-null-equivalent {
	opacity: 30%;
}

.target-selector {
	width: 100%;
}

:deep(.VDataTable th:first-child),
:deep(.VDataTable td:first-child) {
	padding-left: 2em !important;
}

.custom-header .initial-header {
	display: block;
	padding-bottom: 0.3em;
	padding-left: 0;
}

.custom-header .col-select {
	font-weight: 400;
	font-size: 13px;
}

.custom-header .col-select.not-selected {
	opacity: 60%;
}

select {
	user-select: none;
	appearance: none;
}

.theme--dark select {
	color: hsl(0deg 0% 100%);
}
</style>
