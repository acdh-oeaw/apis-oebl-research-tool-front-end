<template>
  <div>
    <div
      v-for="(filter, i) in localFilterItems"
      :key="i">
      <v-card
        flat
        color="transparent"
        height="38"
        class="text-body-2 input-no-stroke d-flex pa-1 pr-2 flex-nowrap align-center">
        <select-menu
          btn-class="caption"
          :width="80"
          :items="columns.filter(c => c.filterable === true)"
          v-model="filter.column"
          search-placeholder="Spalte suchen …"
          @input="emitInput"
          key-name="name"
          key-value="value"
        />
        <select-menu
          btn-class="caption"
          :width="70"
          :items="comparators"
          v-model="filter.comparator"
          key-value="value"
          key-name="name"
          :return-value="true"
          @input="emitInput"
        />
        <div class="flex-grow-1 pl-2">
          <v-select
            v-if="filter.column.type === 'boolean'"
            :value="'true'"
            :items="[ { value: 'true', text: 'Ja' }, { value: 'false', text: 'Nein' } ]"
            :menu-props="{
              contentClass: 'rounded-lg soft-shadow background darken-2 v-list--nav'
            }"
            color="background darken-2"
            single-line
            flat
            dense
            hide-details
            append-icon=""
            class="text-body-2"
            v-model="filter.query"
            @input="emitInput"
          />
          <v-text-field
            :disabled="!isFilterWithInput(filter)"
            v-else
            autocomplete="false"
            style="min-width: 60px"
            @keydown.esc="() => { filter.query = ''; emitInput() }"
            placeholder="Abfrage…"
            class="text-body-2"
            v-model="filter.query"
            @input="debouncedEmitInput"
            dense
            hide-details
          />
        </div>
        <div class="flex-nowrap text-no-wrap">
          <v-btn @click="removeFilterItem(i)" :disabled="localFilterItems.length === 1 && (filter.query === '' || filter.query === null)" icon small>
            <v-icon v-if="localFilterItems.length === 1 && filter.query !== null && filter.query !== ''" style="transform: rotate(45deg)">mdi-plus-circle-outline</v-icon>
            <v-icon v-else>mdi-minus-circle-outline</v-icon>
          </v-btn>
          <v-btn @click="addFilterItem" icon small>
            <v-icon>mdi-plus-circle-outline</v-icon>
          </v-btn>
        </div>
      </v-card>
      <v-divider class="mx-2" v-if="localFilterItems.length > 1 && i !== localFilterItems.length - 1" />
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { LemmaColumn, LemmaFilterItem, LemmaFilterComparator } from '@/types/lemma'
import { clone, debounce } from 'lodash'
import SelectMenu from './SelectMenu.vue'

@Component({
  components: {
    SelectMenu
  }
})
export default class DataFilter extends Vue {

  @Prop({ default: () => [] }) columns!: LemmaColumn[]
  @Prop({ default: () => [] }) value!: LemmaFilterItem[]
  @Prop({ default: () => [] }) comparators!: LemmaFilterComparator[]

  defaultFilterItem = {
    column: this.columns[1],
    comparator: this.comparators[0].value,
    query: ''
  }

  debouncedEmitInput = debounce(this.emitInput)

  emitInput() {
    this.$emit('input', this.localFilterItems)
  }

  isFilterWithInput(f: LemmaFilterItem): boolean {
    return f.comparator !== 'exists' && f.comparator !== 'exists-not'
  }

  get localFilterItems() {
    if (this.value.length === 0) {
      return [ clone(this.defaultFilterItem) ]
    } else {
      return this.value
    }
  }

  addFilterItem() {
    this.$emit('input', this.localFilterItems.concat(clone(this.defaultFilterItem)))
  }

  removeFilterItem(i: number) {
    if (this.value.length === 1) {
      // reset first query value
      this.$emit('input', [ { ...this.value[0], query: '' } ])
    } else {
      // remove filter item
      this.$emit('input', this.value.filter((f, fi) => i !== fi))
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
