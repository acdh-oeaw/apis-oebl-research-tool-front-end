<template>
  <v-card class="fill-height transparent d-flex flex-column">
    <v-card-title class="flex-shrink-1 pa-0 pr-3">
      <v-subheader>Details</v-subheader><v-spacer /><v-btn @click="$emit('close')" icon><v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-5" style="overflow-y: auto">
      <section>
        <v-subheader class="pl-0 caption">Query</v-subheader>
        <b>{{ item.query_name }}</b>
      </section>
      <section>
        <v-subheader class="pl-0 caption">Wikipedia<v-spacer />({{ item.wikipedia_edits }} Edits)</v-subheader>
        <div v-if="expandWiki === false" style="word-break: unset !important" v-line-clamp="10">
          {{ item.wikipedia_txt }}
        </div>
        <div v-else>
          {{ item.wikipedia_txt }}
        </div>
        <div class="text-center">
          <v-btn @click="expandWiki = !expandWiki" small text>{{ expandWiki ? 'Weniger' : 'Mehr…'}}</v-btn>
        </div>
      </section>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
import { ApiPersonResult } from '@/service/backend'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class ResultDetail extends Vue {

  @Prop() item: ApiPersonResult
  expandWiki = false
}
</script>
<style lang="scss" scoped>
</style>
