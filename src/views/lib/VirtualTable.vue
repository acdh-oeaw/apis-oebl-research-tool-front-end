<template>
  <div tabindex="-1" @keydown="handleKey">
    <draggable
      tag="div"
      class="header-row"
      animation="200"
      drag-class="header-row-drag"
      ghost-class="header-row-ghost"
      direction="horizontal"
      :disabled="sortableColumns === false"
      @end.stop="$event.originalEvent.stopPropagation()"
      @input="updateColumnOrder"
      :value="visibleColumns">
      <div
        :class="['header-cell', $listeners['click:header'] && 'clickable']"
        v-for="column in visibleColumns"
        @mousedown="$emit('click:header', column)"
        :style="{width: column.width ? column.width + 'px' : defaultWidth, height: rowHeight}"
        :key="column.value">
        <span class="header-sort-arrow" v-if="column.sort === 'asc'">▲</span>
        <span class="header-sort-arrow" v-if="column.sort === 'desc'">▼</span>
        {{ column.name }}
      </div>
    </draggable>
    <v-virtual-scroll
      :items="data"
      :height="height - rowHeight"
      :item-height="rowHeight">
      <template v-slot:default="{ item, index }">
        <div
          :draggable="$listeners['drag:row']"
          @dragstart="$emit('drag:row', item, $event)"
          @click="selectItem(item, $event)"
          @dblclick="$emit('dblclick:row', item, $event)"
          :style="{ height: rowHeight + 'px' }"
          @keydown="handleKey"
          :class="['table-row', selected[item.id] && 'selected']">
          <div
            v-for="column in visibleColumns"
            :key="index + '__' + column.value"
            :style="{width: column.width ? column.width + 'px' : defaultWidth}"
            class="table-cell"
            @click="$emit('click:cell', item, $event, column.value, index)"
            @mouseover="$emit('mouseover:cell', item, $event, column.value, index)">
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
      this.selectNext()
    } else if (e.key === 'ArrowUp') {
      this.selectPrevious()
    }
  }

  selectPrevious() {
    const selectedIndexes = _.map(this.selected, v => this.data.findIndex(r => r.id === v.id))
    const prevItem = this.data[ Math.min(...selectedIndexes) - 1 ]
    if (prevItem !== undefined) {
      this.selected = { [ prevItem.id ]: prevItem }
      this.$emit('change-selection', [ prevItem ])
    }
  }

  selectNext() {
    const selectedIndexes = _.map(this.selected, v => this.data.findIndex(r => r.id === v.id))
    const nextItem = this.data[ Math.max(...selectedIndexes) + 1 ]
    if (nextItem !== undefined) {
      this.selected = { [nextItem.id]: nextItem }
      this.$emit('change-selection', [ nextItem ])
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

  isSelected(id: number): boolean {
    if (this.selected[id]) {
      return true
    } else {
      return false
    }
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
