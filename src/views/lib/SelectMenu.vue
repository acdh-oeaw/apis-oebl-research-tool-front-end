<template>
  <v-menu
    max-height="80vh"
    content-class="soft-shadow">
    <template v-slot:activator="{ on, attrs, }">
      <v-btn
        small
        :width="width"
        text
        class="px-1 ellipsis select-button caption"
        @click="onClickActivator"
        v-bind="attrs"
        v-on="on">
        {{ displayValue }}
      </v-btn>
    </template>
    <v-card class="pa-0 fill-height d-flex flex-column" color="background" style="max-height: inherit;">
      <v-card-title class="py-2 px-3 d-flex flex-row flex-nowrap">
        <input
          ref="input"
          placeholder="Suchen …"
          class="search-input text-body-2"
          v-model.trim="searchText"
          @keydown="onKeyDownSearch"
          @click.prevent.stop="" />
        <v-btn color="primary" @click="searchText =  ''" v-if="searchText !== null && searchText !== ''" icon x-small text>
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider class="ma-0" />
      <v-list
        v-if="filteredItems.length > 0"
        color="transparent"
        class="text-body-2 overflow-y-auto"
        nav
        dense>
        <v-list-item
          @click="selectItem(item)"
          dense
          v-for="item in filteredItems"
          :key="item[keyValue]">
          <v-list-item-avatar class="mr-2" size="15">
            <v-icon small v-if="value === item[keyValue] || value.value === item[keyValue]">mdi-check</v-icon>
          </v-list-item-avatar>
          <v-list-item-content class="text-body-2">
            {{ item[keyName] }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list
        v-else
        color="transparent"
        class="text-body-2 overflow-y-auto"
        nav
        dense>
        <v-list-item>
          <v-list-item-content style="opacity: .7" class="caption text-center">nichts gefunden</v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

type Item = any;

@Component
export default class SelectMenu extends Vue {

  @Prop({ default: () => [] }) items!: Item[]
  @Prop({ default: null }) value!: Item|null
  @Prop({ default: 'name' }) keyName!: string
  @Prop({ default: 'value' }) keyValue!: string
  @Prop({ default: false }) returnValue!: boolean
  @Prop({ default: null }) width!: number

  searchText: string|null = null

  onKeyDownSearch(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.searchText !== '' && this.searchText !== null) {
      e.preventDefault()
      e.stopPropagation()
      this.searchText = ''
    }
  }

  selectItem(item: Item) {
    console.log(item[this.keyName])
    if (this.returnValue) {
      this.$emit('input', item.value)
    } else {
      this.$emit('input', item)
    }
  }

  async onClickActivator() {
    await this.$nextTick()
    setTimeout(() => {
      if (this.$refs.input instanceof HTMLInputElement) {
        this.$nextTick()
        this.$refs.input.focus()
        this.$refs.input.select()
      }
    }, 100)
  }

  get displayValue() {
    if (this.value === null) {
      return 'nichts ausgewählt'
    } if (typeof this.value === 'string') {
      const item = this.items.find(i => i[this.keyValue] === this.value)
      if (item && item[this.keyName]) {
        return item[this.keyName]
      } else {
        return 'nichts ausgewählt'
      }
    } else {
      return this.value[this.keyName]
    }
  }

  get filteredItems() {
    if (this.searchText !== null) {
      const searchTextLow = this.searchText.toLowerCase()
      return this.items.filter(i => i[this.keyName].toLowerCase().indexOf(searchTextLow) > -1)
    } else {
      return this.items
    }
  }

}
</script>
<style lang="stylus" scoped>
.search-input
  width 100%
  outline 0
</style>
<style lang="stylus">
.theme--dark .search-input
  color white

.select-button .v-btn__content
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block;
</style>
