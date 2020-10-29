<template>
  <v-card rounded="lg">
  <v-card-title class="text-center text-caption">
    <v-spacer />Spaltenzuordnung für {{ fileName }}<v-spacer />
  </v-card-title>
  <v-divider />
  <v-card-text class="px-0 pb-0">
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
      :items-per-page="100">
      <template v-for="h in headers" v-slot:[`header.${h.value}`]="{}">
        <div class="py-1 custom-header" :key="h.value">
          <span class="initial-header">
            {{h.text}}
          </span>
          <v-select
            hide-details
            solo
            flat
            v-model="h.matchWith"
            @
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
              (nullValues.indexOf(item[h.value]) > -1) && 'is-null-equivalent',
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
  </v-card-text>
  <v-divider />
  <v-card-actions class="pa-4">
    <v-btn
      small
      rounded
      elevation="0"
      @click="$emit('cancel')">
      abbrechen
    </v-btn>
    <v-spacer />
    <v-btn
      class="px-4"
      small
      rounded
      elevation="0"
      color="primary"
      :disabled="headers.every(h => h.matchWith === null)"
      @click="$emit('confirm', convertTable(initialTable, headers))">
      {{ headers.filter(h => h.matchWith !== null).length }} Spalte(n) importieren
    </v-btn>
  </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import neatCsv from 'neat-csv'
import * as XLSX from 'xlsx'
import * as _ from 'lodash'
import { VCard, VCardTitle, VCardText, VCardActions, VBtn, VSpacer, VDivider, VDataTable, VSelect } from 'vuetify/lib'
import { Column, Header, Table, Row, SelectOptions } from '../types'

@Component({
  components: {
    VCard, VCardTitle, VCardText, VCardActions, VBtn, VSpacer, VDivider, VDataTable, VSelect
  }
})
export default class ColumnMatcher extends Vue {

  @Prop({ required: true }) buffer: ArrayBuffer
  @Prop({ default: [], required: true }) targetColumns: Column[]
  @Prop({ required: true }) fileName: string
  @Prop({ required: true }) fileType: string

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

  updateSheetName(name: string): void {
    this.sheetName = name
    const [h, c] = this.parseExcelToJson(this.buffer, name)
    this.headers = h
    this.initialTable = c
  }

  convertTable(t: Table<Row>, hs: Header[]): Table<Row> {
    // TODO: ignore null values
    return t.map((r) => {
      return hs.reduce((m, e) => {
        if (e.matchWith !== null) {
          m[e.matchWith] = r[e.value]
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
    const c = await neatCsv(csv, {separator})
    const firstRow = c[0]
    const h = _.map(firstRow, (v, k) => ({
      text: k,
      sortable: true,
      value: k,
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
  color: rgba(0,0,0,.5)
}
.is-null-equivalent{
  color: rgba(0,0,0,.3)
}
.target-selector{
  width: 100%
}
/deep/ .v-data-table-header,
/deep/ .v-data-table-header tr,
/deep/ .v-data-table-header th {
  background: #f0f0f0 !important;
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
</style>
