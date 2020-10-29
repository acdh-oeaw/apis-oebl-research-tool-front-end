<template>
  <v-list-item v-on="$listeners" :input-value="selected">
    <v-list-item-avatar>
      <template v-if="item.lobid && item.lobid.length > 0">
        <v-img v-if="item.lobid[0].depiction && item.lobid[0].depiction[0]" :src="item.lobid[0].depiction[0].thumbnail" />
        <v-img v-else src="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" />
      </template>
      <template v-else>
        <v-icon v-if="item.loaded === true" color="grey">mdi-circle-outline</v-icon>
        <v-icon v-if="item.loaded === false" color="red">mdi-alert-circle</v-icon>
      </template>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title v-if="item.lobid && item.lobid.length > 0">
        {{ item.lobid[0].preferredName }}
        ({{ item.lobid[0].dateOfBirth ? item.lobid[0].dateOfBirth[0] : '?' }}
          {{ item.lobid[0].placeOfBirth ? 'in ' + item.lobid[0].placeOfBirth[0].label : '' }}
          —
          {{ item.lobid[0].dateOfDeath ? item.lobid[0].dateOfDeath[0] : '?' }}
          {{ item.lobid[0].placeOfDeath ? 'in ' + item.lobid[0].placeOfDeath[0].label : '' }})
      </v-list-item-title>
      <v-list-item-title v-else>
        {{ item.firstName }} {{ item.lastName }}
      </v-list-item-title>
      <v-list-item-subtitle v-if="item.lobid && item.lobid.length > 0">
        <span v-if="item.lobid[0].biographicalOrHistoricalInformation"> {{ item.lobid[0].biographicalOrHistoricalInformation[0] }}</span>
        <span v-if="item.lobid[0].placeOfActivity">; Wirkungsorte:
          <span v-for="place in item.lobid[0].placeOfActivity" :key="place.id">
            {{ place.label }}
          </span>
        </span>
      </v-list-item-subtitle>
      <v-list-item-subtitle v-else>
        (not found)
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-badge
        overlap
        :value="item.lobid.length > 0"
        :color="item.candidateSelected > -1 ? 'green' : 'red'"
        :content="item.lobid.length">
        <v-icon v-if="item.candidateSelected === -1 && item.lobid.length === 1">mdi-account-outline</v-icon>
        <v-icon v-else-if="item.candidateSelected > -1" color="green">mdi-check</v-icon>
        <v-icon v-else-if="item.lobid.length > 1">mdi-account-group-outline</v-icon>
      </v-badge>
    </v-list-item-action>
  </v-list-item>
</template>
<script lang="ts">
import { PersonMatchable } from '@/types'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class ResearchPersonItem extends Vue {
  @Prop({ default: false }) selected: boolean
  @Prop({ required: true }) item: PersonMatchable
}
</script>

<style lang="scss" scoped>
</style>
