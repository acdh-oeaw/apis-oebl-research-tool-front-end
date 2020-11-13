<template>
  <v-container fill-height class="align-stretch">
    <v-row class="pa-3 fill-height">
      <v-col cols="6">
        <v-card class="pa-5" rounded="lg" elevation="0">
          <search-person-detail
            :fields="allowedPersonFields"
            @change="searchOnePersonDebounced"
            :value="person" />
          <v-select
            class="mr-5"
            dense
            hide-details
            disabled
            label="Berufsfeld"
            :items="[ 'Politik und Verwaltung' ]"
          />
        </v-card>
        <div class="pa-3 text-center grey--text">
          oder
        </div>
        <slot />
      </v-col>
      <v-col cols="6" class="fill-height">
        <v-list
          class="rounded-lg pa-0 fill-height flex-column d-flex"
          nav
          avatar
          three-line>
          <v-subheader class="flex-shrink-1">
            Ergebnisse ({{ results.length }})
          </v-subheader>
          <RecycleScroller
            class="scroller fill-height v-list--nav flex-grow-1"
            :items="results"
            key-field="id"
            :item-size="60">
            <template v-if="searchingPerson" v-slot="{item}">
              <v-skeleton-loader :key="item.id" type="list-item-avatar-three-line" />
            </template>
            <template v-else v-slot="{ item }">
              <lobid-list-item
                :key="item.id"
                :person="item" />
            </template>
          </RecycleScroller>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { PersonField, PersonMatchable, Person } from '@/types'
import { Person as LdPerson } from 'schema-dts'
import * as lobid from '../service/lobid'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import SearchPersonDetail from './SearchPersonDetail.vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import LobidListItem from './LobidListItem.vue'
import _ from 'lodash'

@Component({
  components: {
    SearchPersonDetail, LobidListItem, RecycleScroller
  }
})
export default class PersonQuerySingle extends Vue {

  @Prop() allowedPersonFields: PersonField[]

  results: LdPerson[] = []
  searchOnePersonDebounced = _.debounce(this.searchOnePerson, 300)
  searchingPerson = false

  person: PersonMatchable = {
    id: '-1',
    candidateSelected: -1,
    loaded: false,
    firstName: null,
    lastName: null,
    dateOfBirth: null,
    dateOfDeath: null,
    placeOfBirth: null,
    placeOfDeath: null,
    gnd: null,
    lobid: []
  }

  async searchOnePerson(person: PersonMatchable): Promise<void> {
    this.searchingPerson = true
    this.person = person
    this.person.lobid = await this.loadResults(person) || []
    this.searchingPerson = false
  }

  async loadResults(p: Person): Promise<LdPerson[]> {
    if (Object.keys(p).length === 0) {
      this.results = []
    } else {
      this.results = await lobid.findPerson(p)
    }
    return this.results
  }
}
</script>
<style lang="scss" scoped>
</style>
