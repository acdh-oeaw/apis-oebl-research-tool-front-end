<template>
  <div
    class="virtual-table-outer"
    tabindex="-1"
    @keydown="handleKey">
    <draggable
      :disabled="sortableColumns === false"
      :value="visibleColumns"
      @start.stop.prevent.capture=""
      @end.stop.prevent.capture=""
      @input="updateColumnOrder"
      tag="div"
      class="header-row"
      animation="200"
      drag-class="header-row-drag"
      ghost-class="header-row-ghost"
      direction="horizontal"
      >
      <div
        v-for="column in visibleColumns"
        :key="column.value"
        :style="{width: column.width ? column.width + 'px' : defaultWidth, height: rowHeight}"
        :class="[
          'header-cell',
          $listeners['click:header'] && 'clickable',
          (column.sort !== null && column.sort !== undefined) && 'sort-active'
        ]"
        @click="$emit('click:header', column)">
        <span
          v-if="column.sort === 'asc'"
          class="header-sort-arrow">▲</span>
        <span
          v-if="column.sort === 'desc'"
          class="header-sort-arrow">▼</span>
        {{ column.name }}
      </div>
    </draggable>
    <v-virtual-scroll
      style="contain: content"
      ref="scroller"
      class="virtual-scroller"
      :items="data"
      :height="height - rowHeight"
      :item-height="rowHeight">
      <template v-slot:default="{ item, index }">
        <div
          :draggable="$listeners['drag:row']"
          :style="{ height: rowHeight + 'px' }"
          :class="['table-row', selected[item.id] && 'selected']"
          @dragstart="$emit('drag:row', item, $event)"
          @click="selectItem(item, $event)"
          @dblclick="onDblClick($event, item, index)"
          @keydown="handleKey">
          <div
            v-for="column in visibleColumns"
            :key="index + '__' + column.value"
            :style="{
              width: column.width ? column.width + 'px' : defaultWidth,
              maxHeight: (rowHeight - 5) + 'px'
            }"
            @click="$emit('click:cell', item, $event, column.value, index)"
            class="table-cell">
            <slot
              name="cell"
              draggable
              :item="item"
              :index="index"
              :column="column"
              :value="item[column.value]" />
          </div>
        </div>
      </template>
    </v-virtual-scroll>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import Draggable from 'vuedraggable'
import _ from 'lodash'

interface Row {
  id: number
  [key: string]: any
}

interface Column {
  value: keyof Row
  name: string
  width?: number
  show?: boolean
  sort?: null|'desc'|'asc'
}

@Component({
  components: {
    Draggable
  }
})
export default class VirtualTable extends Vue {

  @Prop({ default: [] }) columns!: Column[]
  @Prop({ required: true }) height!: number
  @Prop({ default: [] }) data!: Row[]
  @Prop({ default: 40 }) rowHeight!: number
  @Prop({ default: true }) sortableColumns!: boolean
  @Prop({ default: true }) keyboardSelection!: boolean

  selected: { [key: number]: Row } = {}
  log = console.log

  onDblClick(e: MouseEvent, item: Row, index: number) {
    this.$emit('dblclick:row', item, e)
  }

  handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      this.selectNone()
    }
    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      this.selectAll()
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      this.selectNext()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.selectPrevious()
    }
  }

  scrollToIndex(i: number) {
    const elOffset = i * this.rowHeight
    const el = (this.$refs.scroller as Vue).$el
    const sTop = el.scrollTop
    const sBottom = sTop + el.clientHeight
    if (elOffset < sTop || elOffset > sBottom) {
      el.scrollTo({ top: elOffset })
    }
  }

  async selectPrevious() {
    const selectedIndexes = _.map(this.selected, v => this.data.findIndex(r => r.id === v.id))
    const newIndex = Math.min(...selectedIndexes) - 1
    const prevItem = this.data[ newIndex ]
    if (prevItem !== undefined) {
      this.selected = { [ prevItem.id ]: prevItem }
      this.$emit('change-selection', [ prevItem ])
      this.scrollToIndex(newIndex)
    }
  }

  selectNext() {
    const selectedIndexes = _.map(this.selected, v => this.data.findIndex(r => r.id === v.id))
    const newIndex = Math.max(...selectedIndexes) + 1
    const nextItem = this.data[ newIndex ]
    if (nextItem !== undefined) {
      this.selected = { [nextItem.id]: nextItem }
      this.$emit('change-selection', [ nextItem ])
      this.scrollToIndex(newIndex)
    }
  }

  selectNone() {
    this.selected = {}
    this.$emit('change-selection', [])
  }

  selectAll() {
    this.selected = _.keyBy(this.data, 'id')
    this.$emit('change-selection', this.data)
  }

  selectItem(item: Row, event: MouseEvent) {
    if (event.currentTarget instanceof HTMLElement) {
      if (event.ctrlKey || event.metaKey) {
        // add or remove from selection set
        const selected = event.currentTarget.classList.toggle('selected')
        if (selected) {
          this.selected[item.id] = item
        } else {
          this.$delete(this.selected, item.id)
        }
      } else {
        // deselect everything, then select this.
        if (this.$el instanceof HTMLElement) {
          this.$el.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'))
        }
        event.currentTarget.classList.add('selected')
        this.selected = { [item.id]: item }
      }
    }
    this.$emit('change-selection', _.toArray(this.selected))
  }

  get visibleColumns() {
    return this.columns.filter(c => c.show === true)
  }

  get defaultWidth() {
    return 100 / this.visibleColumns.length + '%'
  }

  updateColumnOrder(cs: Column[]) {
    this.$emit('update-columns', [...cs, ...this.columns.filter(c => c.show === false)])
  }

}
</script>

<style lang="stylus" scoped>

// tell browser NOT to cache the millions
// of rows/DOM elements we’re gonna put here.
/deep/ .v-virtual-scroll__container
  will-change contents, scroll-position

// header when sorting
.header-row-drag
  background var(--v-background-darken2)
  border-radius 10px

.header-row-ghost
  opacity 0 !important

// general layout

.header-row
.table-row
  display flex
  line-height 1.2

.header-row
  align-items stretch
  overflow hidden
  padding-bottom 5px
  // the scrollbar width
  padding-right 8px

.header-cell:first-child,
.table-cell:first-child
  text-align right

.header-row:hover .header-cell
  border-right 1px solid #aaa

.header-cell
  transition opacity .2s, border-color .2s
  border-right 1px solid transparent
  display flex
  opacity .5
  align-items flex-end
  user-select none
  &:hover
    opacity 1
  &.sort-active
    opacity: 1;

.header-sort-arrow
  font-size 70%
  margin-right 2px

.table-row
  align-items center

.header-cell
.table-cell
  overflow hidden
  text-overflow ellipsis

.clickable
  cursor default
</style>
