<template>
  <div class="fill-height">
    <v-dialog v-model="showColumnMatcher" scrollable max-width="1000px">
      <column-matcher
        v-if="file !== null"
        :target-columns="allowedPersonFields"
        @cancel="showColumnMatcher = false"
        @confirm="loadTable"
        :file-type="file.type"
        :file-name="file.name"
        :buffer="fileBuffer" />
    </v-dialog>
    <person-query-single
      v-if="searchTable.length === 0"
      :allowed-person-fields="allowedPersonFields">
      <v-card rounded="lg" elevation="0" class="pa-4">
        <v-file-input
          accept="text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          dense
          chips
          small-chips
          hide-details
          clearable
          show-size
          @change="updateFile"
          label="CSV oder Excel Datei" />
      </v-card>
    </person-query-single>
    <person-query-multiple
      v-else
      :allowed-person-fields="allowedPersonFields"
      :search-table="searchTable"
      />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ColumnMatcher from './ColumnMatcher.vue'
import LobidListItem from './LobidListItem.vue'
import ResearchPersonItem from './ResearchPersonItem.vue'
import SearchPersonDetail from './SearchPersonDetail.vue'
import { Person as LdPerson } from 'schema-dts'
import { Table, Person, PersonMatchable, PersonField } from '../types'
import * as lobid from '../service/lobid'
import PersonQuerySingle from './PersonQuerySingle.vue'
import PersonQueryMultiple from './PersonQueryMultiple.vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import _ from 'lodash'

@Component({
  components: {
    LobidListItem,
    ColumnMatcher,
    SearchPersonDetail,
    ResearchPersonItem,
    PersonQuerySingle,
    PersonQueryMultiple,
    RecycleScroller
  }
})
export default class PersonQuery extends Vue {

  fileBuffer: ArrayBuffer|null = null
  file: File|null = null
  eMail = ''
  searchingLobidPerson = false
  showColumnMatcher = false
  searchTable: PersonMatchable[] = []

  allowedPersonFields: PersonField[] = [
    {
      value: 'firstName',
      text: 'Vorname'
    },
    {
      value: 'lastName',
      text: 'Nachname'
    },
    {
      value: 'dateOfBirth',
      text: 'Geburtsdatum',
      hint: 'YYYY oder YYYY-MM-DD',
      rules: [ (e?: string): boolean => e !== undefined && (e.trim() === '' || /^(\d{4}-\d{2}-\d{2})|(\d{4})$/.test(e)) ]
    },
    {
      value: 'dateOfDeath',
      text: 'Sterbedatum',
      hint: 'YYYY oder YYYY-MM-DD',
      rules: [ (e?: string): boolean => e !== undefined && (e.trim() === '' || /^(\d{4}-\d{2}-\d{2})|(\d{4})$/.test(e)) ]
    },
    {
      value: 'placeOfDeath',
      text: 'Sterbeort'
    },
    {
      value: 'placeOfBirth',
      text: 'Geburtsort'
    },
    {
      value: 'gnd',
      text: 'GND',
      rules: [ (e: any): boolean => !isNaN(e) ]
    }
  ]

  async updateFile(f: File): Promise<void> {
    if (f !== undefined) {
      this.file = f
      this.fileBuffer = await f.arrayBuffer()
      this.showColumnMatcher = true
    }
  }

  async loadTable(t: Table<Person>): Promise<void> {
    this.showColumnMatcher = false
    this.searchTable = t.map(r => ({
      ...r,
      lobid: [],
      loaded: false,
      candidateSelected: -1,
      id: _.uniqueId()
    }))
    const chunkLength = 30
    let chunkIndex = 0
    let i = -1
    for (const chunk of _.chunk(this.searchTable, chunkLength)) {
      console.log('starting chunk ' + i)
      const rs = await Promise.all(chunk.map(p => {
        return lobid.findPerson(p)
          .then(lp => {
            i = i + 1
            return {
              // i: i,
              ...p,
              lobid: lp,
              candidateSelected: lp.length === 1 ? 0 : -1,
              loaded: true
            }
          })
      }))
      this.searchTable.splice(chunkIndex * chunkLength, chunkLength, ...rs)
      chunkIndex = chunkIndex + 1
      await this.$nextTick()
      console.log('done with chunk ' + chunkIndex, {chunk})
      console.log('searchtable is now', this.searchTable)
    }
  }

  focusNextOfClass(elementClass: string): void {
    const aE = document.activeElement
    if (
      aE instanceof HTMLElement &&
      aE.classList.contains(elementClass) &&
      aE.nextElementSibling instanceof HTMLElement
    ) {
      aE.nextElementSibling.focus()
    } else {
      const e = document.querySelector('.' + elementClass)
      if (e instanceof HTMLElement) {
        e.focus()
      }
    }
  }

  focusPrevOfClass(elementClass: string): void {
    const aE = document.activeElement
    if (
      aE instanceof HTMLElement &&
      aE.classList.contains(elementClass) &&
      aE.previousElementSibling instanceof HTMLElement
    ) {
      aE.previousElementSibling.focus()
    } else {
      const es = document.querySelectorAll('.' + elementClass)
      const last = es[es.length - 1]
      if (last instanceof HTMLElement) {
        last.focus()
      }
    }
  }
}
</script>

<style lang="stylus">
@import '../../node_modules/vue-virtual-scroller/dist/vue-virtual-scroller.css';

</style>
