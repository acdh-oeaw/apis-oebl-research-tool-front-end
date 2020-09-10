<template>
  <v-card rounded="lg">
  <v-card-title class="text-center text-caption">
    <v-spacer />Spaltenzuordnung für {{ file.name }}<v-spacer />
  </v-card-title>
  <v-divider />
  <v-card-text class="px-0 pb-0">
    <v-data-table
      locale="de-AT"
      fixed-header
      dense
      disable-sort
      height="500"
      :headers="headers"
      :items="initialTable"
      :items-per-page="100"
      :footer-props="{
        'items-per-page-options': [10, 50, 100]
      }"
    >
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
import _ from 'lodash'
import { VCard, VCardTitle, VCardText, VCardActions, VBtn, VSpacer, VDivider, VDataTable, VSelect } from 'vuetify/lib'
import { Column, Header, Table, Row } from '../table'

@Component({
  components: {
    VCard, VCardTitle, VCardText, VCardActions, VBtn, VSpacer, VDivider, VDataTable, VSelect
  }
})
export default class ColumnMatcher extends Vue {

  @Prop() file: File
  @Prop() targetColumns: Column[]

  headers: Header[] = []
  initialTable: Table = []

  convertTable(t: Table, hs: Header[]): Table {
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

  @Watch('file', { immediate: true })
  async onUpdateFile() {
    if (this.file.type === 'text/csv') {
      const t = await this.file.text()
      const c = await neatCsv(t)
      const firstRow = c[0]
      this.headers = _(firstRow)
        .map((v, k) => ({
          text: k,
          sortable: true,
          value: k,
          matchWith: null
        }))
        .value()
      this.initialTable = c
    } else {
      alert('no excel support for now')
    }
  }
}
</script>
<style lang="stylus" scoped>
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
