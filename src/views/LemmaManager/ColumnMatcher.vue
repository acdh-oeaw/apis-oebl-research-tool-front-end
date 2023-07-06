<template>
	<v-data-table
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
				<v-select
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
			<v-row no-gutters class="pa-4 ma-0">
				<v-col cols="3">
					<v-select
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
					</v-select>
					<v-select
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
					</v-select>
				</v-col>
				<v-col cols="4" class="pl-4">
					<v-combobox
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
					</v-combobox>
				</v-col>
				<v-col class="text-right">
					<v-btn :disabled="tablePage === 1" icon @click="tablePage = tablePage - 1">
						<v-icon>mdi-chevron-left</v-icon>
					</v-btn>
					<select class="px-2" :value="tablePage" @change="tablePage = Number($event.target.value)">
						<option v-for="p in Math.ceil(initialTable.length / 100)" :key="p" :value="p">
							Seite {{ p }} von {{ Math.ceil(initialTable.length / 100) }}
						</option>
					</select>
					<v-btn
						:disabled="tablePage === Math.ceil(initialTable.length / 100)"
						icon
						@click="tablePage = tablePage + 1"
					>
						<v-icon>mdi-chevron-right</v-icon>
					</v-btn>
				</v-col>
			</v-row>
		</template>
	</v-data-table>
</template>

<script lang="ts">
import * as _ from "lodash";
import neatCsv from "neat-csv";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import * as XLSX from "xlsx";

import {
	type Column,
	type Header,
	type Row,
	type SelectOptions,
	type Table,
} from "../../types/lemma";

@Component
export default class ColumnMatcher extends Vue {
	@Prop({ required: true }) buffer!: ArrayBuffer;
	@Prop({ required: true }) targetColumns!: Array<Column>;
	@Prop({ required: true }) fileName!: string;
	@Prop({ required: true }) fileType!: string;
	@Prop({ default: false }) returnIgnoredColumns!: boolean;
	@Prop({ default: "ignored." }) prefixIgnoredColumns!: string;

	mimeTypeCsv = "text/csv";
	mimeTypeXls = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
	mimeTypeXlsx = "application/vnd.ms-excel";

	headers: Array<Header> = [];
	initialTable: Table<Row> = [];
	tablePage = 1;
	separator = ";";
	sheetName = "";
	sheetNames: Array<string> = [];

	allSeparators: Array<SelectOptions> = [
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

	nullValues = ["?"];

	@Watch("headers", { deep: true })
	@Watch("nullValues")
	@Watch("separator")
	@Watch("sheetName")
	onChangeOptons() {
		this.$emit("update", this.convertTable(this.initialTable, this.headers));
	}

	async updateSheetName(name: string): Promise<void> {
		this.sheetName = name;
		const [h, c] = await this.parseExcelToJson(this.buffer, name);
		this.headers = h;
		this.initialTable = c;
	}

	isIgnoredValue(v: string): boolean {
		return this.nullValues.indexOf(v) > -1;
	}

	convertTable(t: Table<Row>, hs: Array<Header>): Table<Row> {
		const targetColumnsByValue = _.keyBy(this.targetColumns, "value");
		return t.map((r) => {
			return hs.reduce((m, e) => {
				// if the column is selected for import, and the value is not on the ignored list.
				if (e.matchWith !== null && !this.isIgnoredValue(String(r[e.value]))) {
					if (
						targetColumnsByValue[e.matchWith] !== undefined &&
						targetColumnsByValue[e.matchWith].convert !== undefined &&
						r[e.value] !== undefined
					) {
						// console.log(targetColumnsByValue[e.matchWith], r[e.value])
						m[e.matchWith] =
							targetColumnsByValue[e.matchWith].convert!(r[e.value].toString()) || "";
					} else {
						m[e.matchWith] = r[e.value];
					}
					// if the column is ignored, and we should return the ignored columns with a prefix.
				} else if (this.returnIgnoredColumns && e.matchWith === null) {
					m[this.prefixIgnoredColumns + e.value] = r[e.value];
				}
				return m;
			}, {} as Row);
		});
	}

	getTargetColumnsOptions(h: Header): Array<SelectOptions> {
		return [
			{
				text: this.returnIgnoredColumns ? "erweitertes Feld" : "nicht importieren",
				value: null,
			},
			...this.targetColumns.map((c) => {
				return {
					...c,
					// it’s disabled if it’s already been used in another select/column.
					disabled: h.matchWith !== c.value && this.headers.some((he) => he.matchWith === c.value),
				};
			}),
		];
	}

	async parseCsvToJson(csv: string, separator: string): Promise<[Array<Header>, Table<Row>]> {
		const c = await neatCsv(csv, { separator });
		const firstRow = c[0];
		const h = _.map(firstRow, (v, k) => ({
			text: k.trim(),
			value: k.trim(),
			sortable: true,
			matchWith:
				this.targetColumns.find((c) => c.text.toLowerCase() === k.toLowerCase())?.value || null,
		}));
		return [h, c];
	}

	async updateSeparator(s: string): Promise<void> {
		const [h, c] = await this.parseCsvToJson(this.getTextFromBuffer(this.buffer), s);
		this.headers = h;
		this.initialTable = c;
	}

	getTextFromBuffer(f: ArrayBuffer): string {
		const t = new TextDecoder();
		const s = t.decode(f);
		return s;
	}

	matchHeaderWith(headerIndex: number, matchWith: string | null): void {
		this.headers[headerIndex].matchWith = matchWith;
	}

	async parseExcelToJson(
		b: ArrayBuffer,
		useSheetName: string | null = null,
	): Promise<[Array<Header>, Table<Row>]> {
		// const { default: XLSX } = await import('xlsx')
		const doc = XLSX.read(b, { type: "buffer", WTF: false });
		const sheets = doc.SheetNames.map((s) => XLSX.utils.sheet_to_json(doc.Sheets[s]));
		const useSheetIndex = doc.SheetNames.findIndex((s) => s === useSheetName);
		const rows = sheets[useSheetIndex === -1 ? 0 : useSheetIndex] as Array<Row>;
		const headers: Array<Header> = _.map(rows[0], (v, k) => ({
			value: k,
			text: k,
			sortable: true,
			matchWith:
				this.targetColumns.find((c) => c.text.toLowerCase() === k.toLowerCase())?.value || null,
		}));
		this.sheetNames = doc.SheetNames;
		this.sheetName = doc.SheetNames[useSheetIndex === -1 ? 0 : useSheetIndex];
		return [headers, rows];
	}

	@Watch("buffer", { immediate: true })
	async onUpdateFile(): Promise<void> {
		if (this.fileType === this.mimeTypeCsv) {
			const t = await this.getTextFromBuffer(this.buffer);
			const [h, c] = await this.parseCsvToJson(t, ";");
			this.headers = h;
			this.initialTable = c;
		} else if (this.fileType === this.mimeTypeXls || this.fileType === this.mimeTypeXlsx) {
			const [h, c] = await this.parseExcelToJson(this.buffer);
			this.headers = h;
			this.initialTable = c;
		}
	}
}
</script>

<style lang="stylus" scoped>
.do-not-import
  opacity 50%


.is-null-equivalent
  opcaity 0.3


.target-selector
  width 100%


/deep/ .v-data-table-header
/deep/ .v-data-table-header tr
/deep/ .v-data-table-header th
  // background: #f0f0f0 !important;


/deep/ .v-data-table th:first-child
/deep/ .v-data-table td:first-child
  padding-left 2em !important


.custom-header .initial-header
  display block
  padding-bottom 0.3em
  padding-left 0


.custom-header .col-select
  font-weight 400
  font-size 13px


.custom-header .col-select.not-selected
  opacity 60%


select
  user-select none
  appearance none


.theme--dark select
  color white
</style>
