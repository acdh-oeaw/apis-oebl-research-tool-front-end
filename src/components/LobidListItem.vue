<template>
  <v-list-item v-on="$listeners" v-bind="$props">
    <v-list-item-avatar>
      <v-img v-if="person.depiction && person.depiction[0]" :src="person.depiction[0].thumbnail" />
      <v-img v-else src="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ person.preferredName }}
        ({{ person.dateOfBirth ? person.dateOfBirth[0] : '?' }}
          {{ person.placeOfBirth ? 'in ' + person.placeOfBirth[0].label : '' }}
          —
          {{ person.dateOfDeath ? person.dateOfDeath[0] : '?' }}
          {{ person.placeOfDeath ? 'in ' + person.placeOfDeath[0].label : '' }})
      </v-list-item-title>
      <v-list-item-subtitle>
        <template v-if="person.biographicalOrHistoricalInformation"> {{ person.biographicalOrHistoricalInformation[0] }}</template>
      </v-list-item-subtitle>
      <v-list-item-subtitle>
        <template v-if="person.placeOfActivity">
          Wirkungsorte:
          <span v-for="place in person.placeOfActivity" :key="place.id">
            {{ place.label }}
          </span>
        </template>
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class LobidListItem extends Vue {
  @Prop() person: any
}
</script>
<style lang="scss" scoped>
</style>
