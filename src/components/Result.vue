<template>
  <v-layout class="fill-height">
    <v-navigation-drawer
      :value="selectedItems.length > 0"
      v-if="selectedItems.length > 0"
      right
      app
      width="25vw">
      <result-detail @close="selectedItems = []" :item="selectedItems[0]" />
    </v-navigation-drawer>
    <v-row class="fill-height">
      <v-col class="fill-height pa-0 white">
        <v-data-table
          class="fill-height pt-4 pl-4"
          locale="de-AT"
          fixed-header
          dense
          multi-sort
          height="calc(100% - 70px)"
          :loading="items.length === 0"
          :page="tablePage"
          :headers="headers"
          hide-default-footer
          @click:row="(e) => selectedItems = [ e ]"
          :items="items"
          :items-per-page="100">
          <template v-slot:item.loc="{ item }">
            <a
              target="_blank"
              class="text-decoration-none"
              v-if="item.loc !== null"
              :href="'https://id.loc.gov/authorities/names/' + item.loc">
              {{ item.loc }}
              <v-icon small color="grey">mdi-open-in-new</v-icon>
            </a>
          </template>
          <template v-slot:item.geburtstag="{ item }">
            <span style="white-space: nowrap">{{ formatDate(item.geburtstag) }}</span>
          </template>
          <template v-slot:item.viaf="{ item }">
            <a
              target="_blank"
              class="text-decoration-none"
              v-if="item.viaf !== null"
              :href="'https://viaf.org/viaf/' + item.viaf">
              {{ item.viaf }}
              <v-icon small color="grey">mdi-open-in-new</v-icon>
            </a>
          </template>
          <template v-slot:footer="{}">
            <v-divider />
            <v-row>
              <v-col class="text-right mr-5">
                <v-btn
                  :disabled="tablePage === 1"
                  @click="tablePage = tablePage - 1"
                  icon>
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <select
                  :disabled="Math.ceil(items.length / 100) === 1"
                  class="px-2"
                  :value="tablePage"
                  @change="tablePage = Number($event.target.value)">
                  <option
                    v-for="p in Math.ceil(items.length / 100)"
                    :key="p"
                    :value="p">
                    Seite {{ p }} von {{ Math.ceil(items.length / 100) }}
                  </option>
                </select>
                <v-btn
                  :disabled="tablePage === Math.ceil(items.length / 100)"
                  @click="tablePage = tablePage + 1"
                  icon>
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-layout>
</template>
<script lang="ts">
import { ApiPersonResult, getResultsForSearch } from '@/service/backend'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ResultDetail from './ResultDetail.vue'

@Component({
  components: {
    ResultDetail
  }
})
export default class Result extends Vue {

  @Prop({required: true}) id!: string

  tablePage = 1
  headers = [
    {
      text: 'Name',
      value: 'label',
      sortable: true
    },
    {
      text: 'Geburtstag',
      value: 'geburtstag',
      sortable: true
    },
    {
      text: 'GND',
      value: 'gnd',
      sortable: true
    },
    {
      text: 'Library of Congress',
      value: 'loc',
      sortable: true
    },
    {
      text: 'OBV Einträge',
      value: 'obv_count',
      sortable: true
    },
    {
      text: 'VIAF ID',
      value: 'viaf',
      sortable: true
    },
    {
      text: 'Wien Wiki ID',
      value: 'wien wiki',
      sortable: true
    },
    {
      text: 'Wikipedia Edits',
      value: 'wikipedia_edits',
      sortable: true
    }
  ]

  selectedItems: ApiPersonResult[] = []
  items: ApiPersonResult[] = []

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString(['de-AT'], {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      // hour: '2-digit',
      // minute: '2-digit'
    })
  }

  async mounted(): Promise<void> {
    this.items = await getResultsForSearch(this.id)
  }
}
</script>
<style lang="stylus" scoped>
/deep/ .v-data-table td {
  padding-top: 6px !important
  vertical-align: top;
}
/deep/ .v-data-table-header {
  white-space nowrap
}
</style>
