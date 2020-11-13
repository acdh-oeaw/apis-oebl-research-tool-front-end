<template>
  <div :class="['outer-bar text-left', activeFilter.value !== 'all' && 'filter-selected']">
    <div
      v-for="filter in filtersNotAll"
      :key="filter.value"
      :title="filter.count + ' ' + filter.text"
      :class="['bar', activeFilter.value === filter.value && 'active']"
      @click="$emit('select-filter', filter)"
      :style="{width: filter.count / total * 100 + '%', background: filter.color}">
      {{ filter.count + ' ' + filter.text }}
    </div>
  </div>
</template>
<script lang="ts">

import { Filter } from '@/types'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class QueryProgress extends Vue {

  @Prop() filters: Filter[]
  @Prop() activeFilter: Filter
  @Prop() total: number

  get filtersNotAll(): Filter[] {
    return this.filters.filter(f => f.value !== 'all')
  }

}
</script>
<style lang="stylus" scoped>
.outer-bar{
  background: repeating-linear-gradient(45deg, #dcdcdc, #dcdcdc 5px, transparent 5px, transparent 10px)
  border-radius 12px
  overflow hidden
  position relative
  height 20px
}
.outer-bar:hover .bar, .outer-bar.filter-selected .bar{
  filter contrast(.5)
}
.bar{
  text-shadow 1px 1px 4px rgba(0,0,0,0.5)
  border-right: 1px solid rgba(255,255,255,.15)
  text-overflow: ellipsis
  white-space: nowrap;
  padding: 0 0.5em;
  transition .25s width, .25s filter
  text-align center
  font-size small
  color white
  overflow hidden
  float left
  height: 100%
  cursor pointer
}
.bar:hover, .bar.active {
  filter contrast(1) !important
}
.bar:last-child{
  border-top-right-radius: 12px
  border-bottom-right-radius: 12px
}
</style>
