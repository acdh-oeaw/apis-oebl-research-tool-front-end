<template>
  <v-data-table
    locale="de-AT"
    fixed-header
    dense
    disable-sort
    :page="tablePage"
    :color="color"
    height="500"
    hide-default-footer
    :headers="headers"
    :items="initialTable"
    :items-per-page="100">
    <template v-for="(h, i) in headers" v-slot:[`header.${h.value}`]="{}">
      <div class="py-1 custom-header" :key="h.value">
        <span class="initial-header">
          {{h.text}}
        </span>
        <v-select
          hide-details
          solo
          flat
          :value="h.matchWith"
          @input="matchHeaderWith(i, $event)"
          class="col-select"
          dense
          :items="getTargetColumnsOptions(h)" />
      </div>
    </template>
    <template v-slot:item="{ item }">
      <tr>
        <td
          v-for="(h, i) in headers"
          :class="[
            isIgnoredValue(item[h.value]) && 'is-null-equivalent',
            (h.matchWith === null) && 'do-not-import']
          "
          :key="i">
          {{ item[h.value] }}
        </td>
      </tr>
    </template>
    <template v-slot:footer="{}">
      <v-divider />
      <v-row class="px-5 ma-0">
        <v-col cols="3">
          <v-select
            v-if="fileType === mimeTypeCsv"
            dense
            hide-details
            label="Trennzeichen"
            :value="separator"
            @change="updateSeparator"
            :items="allSeparators"
          />
          <v-select
            v-if="fileType === mimeTypeXls || fileType === mimeTypeXlsx"
            dense
            hide-details
            label="Tabellenblatt"
            :value="sheetName"
            @change="updateSheetName"
            :items="sheetNames"
          />
        </v-col>
        <v-col cols="4">
          <v-combobox
            hide-details
            label="Werte ignorieren"
            v-model="nullValues"
            chips
            deletable-chips
            small-chips
            dense
            multiple>
          </v-combobox>
        </v-col>
        <v-col class="text-right">
          <v-btn
            :disabled="tablePage === 1"
            @click="tablePage = tablePage - 1"
            icon>
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <select
            class="px-2"
            :value="tablePage"
            @change="tablePage = Number($event.target.value)">
            <option
              v-for="p in Math.ceil(initialTable.length / 100)"
              :key="p"
              :value="p">
              Seite {{ p }} von {{ Math.ceil(initialTable.length / 100) }}
            </option>
          </select>
          <v-btn
            :disabled="tablePage === Math.ceil(initialTable.length / 100)"
            @click="tablePage = tablePage + 1"
            icon>
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-data-table>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import * as XLSX from 'xlsx'
import * as _ from 'lodash'
import neatCsv from 'neat-csv'
import { Column, Header, Table, Row, SelectOptions } from '../../types/lemma'

@Component
export default class ColumnMatcher extends Vue {

  @Prop({ required: true }) buffer!: ArrayBuffer
  @Prop({ required: true }) targetColumns!: Column[]
  @Prop({ required: true }) fileName!: string
  @Prop({ required: true }) fileType!: string
  @Prop({ default: false }) returnIgnoredColumns!: boolean
  @Prop({ default: undefined }) color!: string
  @Prop({ default: 'ignored.' }) prefixIgnoredColumns!: string

  mimeTypeCsv = 'text/csv'
  mimeTypeXls = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  mimeTypeXlsx = 'application/vnd.ms-excel'

  headers: Header[] = []
  initialTable: Table<Row> = []
  tablePage = 1
  separator = ';'
  sheetName = ''
  sheetNames: string[] = []

  allSeparators: SelectOptions[] = [
    {
      text: ',',
      value: ','
    },
    {
      text: ';',
      value: ';'
    },
    {
      text: '(Tabulator)',
      value: '  '
    }
  ]

  nullValues = [ '?' ]

  @Watch('headers', { deep: true })
  @Watch('nullValues')
  @Watch('separator')
  @Watch('sheetName')
  onChangeOptons() {
    this.$emit('update', this.convertTable(this.initialTable, this.headers))
  }

  updateSheetName(name: string): void {
    this.sheetName = name
    const [h, c] = this.parseExcelToJson(this.buffer, name)
    this.headers = h
    this.initialTable = c
  }

  isIgnoredValue(v: string): boolean {
    return this.nullValues.indexOf(v) > -1
  }

  convertTable(t: Table<Row>, hs: Header[]): Table<Row> {
    return t.map((r) => {
      return hs.reduce((m, e) => {
        // if the column is selected for import, and the value is not on the ignored list.
        if (e.matchWith !== null && !this.isIgnoredValue(String(r[e.value]))) {
          m[e.matchWith] = r[e.value]
        // if the column is ignored, and we should return the ignored columns with a prefix.
        } else if (this.returnIgnoredColumns && e.matchWith === null) {
          m[this.prefixIgnoredColumns + e.value] = r[e.value]
        }
        return m
      }, {} as Row)
    })
  }

  getTargetColumnsOptions(h: Header): SelectOptions[] {
    return [
      {
        text: 'nicht importieren',
        value: null
      },
      ...this.targetColumns.map(c => {
        return {
          ...c,
          // it’s disabled if it’s already been used in another select/column.
          disabled: h.matchWith !== c.value && this.headers.find(he => he.matchWith === c.value) !== undefined
        }
      })
    ]
  }

  async parseCsvToJson(csv: string, separator: string): Promise<[Header[], Table<Row>]> {
    const c = await neatCsv(csv, { separator })
    const firstRow = c[0]
    const h = _.map(firstRow, (v, k) => ({
      text: k.trim(),
      value: k.trim(),
      sortable: true,
      matchWith: this.targetColumns.find(c => c.text.toLowerCase() === k.toLowerCase())?.value || null
    }))
    return [h, c]
  }

  async updateSeparator(s: string): Promise<void> {
    const [h, c] = await this.parseCsvToJson(await this.getTextFromBuffer(this.buffer), s)
    this.headers = h
    this.initialTable = c
  }

  getTextFromBuffer(f: ArrayBuffer): string {
    const t = new TextDecoder()
    const s = t.decode(f)
    return s
  }

  matchHeaderWith(headerIndex: number, matchWith: string|null): void {
    this.headers[headerIndex].matchWith = matchWith
  }

  parseExcelToJson(b: ArrayBuffer, useSheetName: string|null = null): [ Header[], Table<Row> ] {
    const doc = XLSX.read(b, {type: 'buffer', WTF: false})
    const sheets = doc.SheetNames.map(s => XLSX.utils.sheet_to_json(doc.Sheets[s]))
    const useSheetIndex = doc.SheetNames.findIndex(s => s === useSheetName)
    const rows = sheets[useSheetIndex === -1 ? 0 : useSheetIndex] as Row[]
    const headers: Header[] = _.map(rows[0], (v, k) => ({
      value: k,
      text: k,
      sortable: true,
      matchWith: this.targetColumns.find(c => c.text.toLowerCase() === k.toLowerCase())?.value || null
    }))
    this.sheetNames = doc.SheetNames
    this.sheetName = doc.SheetNames[useSheetIndex === -1 ? 0 : useSheetIndex]
    return [ headers, rows ]
  }

  @Watch('buffer', { immediate: true })
  async onUpdateFile(): Promise<void> {
    if (this.fileType === this.mimeTypeCsv) {
      const t = await this.getTextFromBuffer(this.buffer)
      const [h, c] = await this.parseCsvToJson(t, ';')
      this.headers = h
      this.initialTable = c
    } else if (this.fileType === this.mimeTypeXls || this.fileType === this.mimeTypeXlsx) {
      const [h, c] = this.parseExcelToJson(this.buffer)
      this.headers = h
      this.initialTable = c
    }
  }
}
</script>
<style lang="stylus" scoped>
.do-not-import {
  opacity: .5
}
.is-null-equivalent{
  opcaity: .3
}
.target-selector{
  width: 100%
}
/deep/ .v-data-table-header,
/deep/ .v-data-table-header tr,
/deep/ .v-data-table-header th {
  // background: #f0f0f0 !important;
}
/deep/ .v-data-table th:first-child,
/deep/ .v-data-table td:first-child {
  padding-left: 2em !important;
}
.custom-header .initial-header {
  display: block
  padding-left: 1em
  padding-bottom: .3em
}
.custom-header .col-select {
  font-size: 13px
  font-weight: normal
}
select {
  user-select none
  -webkit-user-select none
  -moz-appearance none
  -webkit-appearance none
  appearance none
}
.theme--dark select
  color white
</style>
