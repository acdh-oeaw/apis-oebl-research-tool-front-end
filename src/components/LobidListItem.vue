<template>
  <v-list-item
    v-if="typeof person !== 'string'"
    v-on="$listeners"
    :class="[ selected && 'v-list-item--active' ]"
    v-bind="$props">
    <v-list-item-avatar>
      <v-img
        :src="person.depiction && person.depiction[0]
          ? person.depiction[0].thumbnail
          : 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='"
        :gradient="selected ? 'to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)' : undefined">
        <v-icon style="width: 100%;" color="white" v-if="selected">mdi-check</v-icon>
      </v-img>
    </v-list-item-avatar>
    <v-list-item-content class="align-self-start">
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
        <template v-if="person.placeOfActivity">
          . Wirkungsorte:
          <span v-for="place in person.placeOfActivity" :key="place.id">
            {{ place.label }}
          </span>
        </template>
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-tooltip transition="none" top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="person.gndIdentifier !== undefined"
            @click.prevent.stop="openExternal('https://lobid.org/gnd/' + person.gndIdentifier)"
            :href="'https://lobid.org/gnd/' + person.gndIdentifier"
            v-bind="attrs"
            v-on="on"
            icon>
            <v-icon color="grey">mdi-open-in-new</v-icon>
          </v-btn>
        </template>
        <span>ganzen Eintrag anzeigen</span>
      </v-tooltip>
    </v-list-item-action>
  </v-list-item>
</template>
<script lang="ts">
import { Person as LdPerson } from 'schema-dts'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class LobidListItem extends Vue {

  @Prop() person: any
  @Prop() selected: boolean

  openExternal(url: string): void {
    window.open(url)
  }
}
</script>
<style lang="scss" scoped>
</style>
