<template>
  <v-card class="rounded-lg soft-shadow" style="position: absolute; left: -1000px">
    <badge
      color="primary darken-2"
      style="position: absolute; right: -6px; top: -6px;"
      :content="rows.length" />
    <v-list class="text-body-2" dense>
      <v-list-item v-for="(s, i) in limitedRows" :key="i">
        <v-list-item-content>
          {{s.lastName}}, {{ s.firstName }}
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="font-weight-bold" style="opacity: .7" v-if="limitedRows.length < rows.length">
        <v-list-item-content>
          + {{ rows.length - maxItems }} weitere…
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import _ from 'lodash'
import Badge from '../lib/Badge.vue'

@Component({
  components: {
    Badge
  }
})
export default class DragImage extends Vue {
  @Prop({ default: [] }) rows!: any[]
  @Prop({ default: 5 }) maxItems!: number

  get limitedRows() {
    return _.takeRight(this.rows, this.maxItems)
  }

}
</script>
<style lang="scss" scoped>
</style>
