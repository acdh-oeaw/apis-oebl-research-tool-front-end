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
              (h.matchWith === null) && 'do-not-import']"
            :key="i">
            {{ item[h.value] }}
          </td>
        </tr>
      </template>
      <template v-slot:footer="{}">
        <v-divider />
        <v-row class="px-5">
          <v-col cols="3">
            <v-select
              dense
              hide-details
              label="Trennzeichen"
              v-model="separator"
              @change="updateSeparator"
              :items="allSeparators"
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
import * as _ from 'lodash'
import { VCard, VCardTitle, VCardText, VCardActions, VBtn, VSpacer, VDivider, VDataTable, VSelect } from 'vuetify/lib'
import { Column, Header, Table, Row } from '../types'

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

  headers: Header[] = []
  initialTable: Table<Row> = []
  tablePage = 1
  separator = ';'
  allSeparators = [
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

  convertTable(t: Table<Row>, hs: Header[]): Table<Row> {
    return t.map((r) => {
      return hs.reduce((m, e) => {
        if (e.matchWith !== null) {
          m[e.matchWith] = r[e.value]
        }
        return m
      }, {} as Row)
    })
  }

  getTargetColumnsOptions(h: Header) {
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
    const [h, c] = await this.parseCsvToJson(await this.getTextFromFile(this.buffer), s)
    this.headers = h
    this.initialTable = c
  }

  getTextFromFile(f: ArrayBuffer): string {
    const t = new TextDecoder()
    const s = t.decode(f)
    return s
  }

  @Watch('buffer', { immediate: true })
  async onUpdateFile(): Promise<void> {
    if (this.fileType === 'text/csv') {
      const t = await this.getTextFromFile(this.buffer)
      const [h, c] = await this.parseCsvToJson(t, ';')
      this.headers = h
      this.initialTable = c
    } else {
      alert('no excel support for now')
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
</style>
