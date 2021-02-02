<template>
  <div>
    <v-combobox
      multiple
      flat
      solo
      @change="onChange"
      hide-details
      class="rounded-lg label-box text-body-2"
      background-color="background darken-2"
      return-object
      text
      placeholder="  Labels hinzufügen …"
      item-text="name"
      item-value="id"
      :menu-props="{
        rounded: 'lg',
        contentClass: 'soft-shadow text-body-2'
      }"
      :search-input.sync="searchText"
      :value="selectedLabels"
      :items="labels">
      <template v-slot:selection="{ attrs, on, selected, select, item }">
        <v-chip
          :key="item.id"
          v-on="on"
          v-bind="attrs"
          :input-value="selected"
          @click="select"
          close
          class="font-weight-medium label"
          text-color="white"
          close-icon="mdi-close"
          @click:close="onDelete(item)"
          :color="item.color">
          {{ item.name }}
        </v-chip>
      </template>
      <template v-slot:item="{ item, on, props }">
        <v-list-item v-bind="props" v-on="on">
          <v-list-item-avatar size="15">
            <v-icon v-if="value.find(i => i.id === item.id) !== undefined" :color="item.color">mdi-checkbox-marked-circle</v-icon>
            <v-icon v-else :color="item.color">mdi-checkbox-blank-circle</v-icon>
          </v-list-item-avatar>
          <v-list-item-content size="15">
            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
      <template v-slot:prepend-item>
        <v-list-item
          style="border-bottom: 1px solid rgba(0,0,0,.1)"
          @click="addLabel(searchText || 'unbenanntes Label')">
          <v-list-item-avatar size="15">
            <v-icon>mdi-plus</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              Label erstellen…
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-combobox>
    <v-dialog scrollable max-width="400" :value="newLabel !== null" v-if="newLabel !== null">
      <v-card class="rounded-lg elevation-25">
        <v-card-title class="text-center">
          <v-spacer />Label erstellen<v-spacer />
        </v-card-title>
        <v-card-title class="pt-0">
          <v-text-field
            hide-details
            solo
            flat
            class="rounded-lg"
            background-color="background"
            autofocus
            label="Label Name"
            v-model="newLabel.name" />
        </v-card-title>
        <v-divider />
        <v-card-text class="overflow-y-auto pt-3" style="height: 300px">
          <div v-for="(color, name) in colors" :key="name">
            <v-subheader class="pl-0">{{name}}</v-subheader>
            <v-btn
              icon
              v-for="(shade, shadeName) in color"
              :key="shadeName"
              @click="newLabel.color = shade"
              class="mr-1 mb-1"
              :style="{ backgroundColor: shade}"
            />
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-chip
            style="color: white; font-weight: 500"
            class="label mx-auto"
            :color="newLabel.color">
            {{ newLabel.name }}
          </v-chip>
        </v-card-actions>
        <v-divider />
        <v-card-actions>
          <v-btn class="rounded-lg px-4" @click="newLabel = null" elevation="0">Abbrechen</v-btn>
          <v-spacer />
          <v-btn class="rounded-lg px-4" @click="createLabel" color="primary" elevation="0">Speichern</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Label } from '@/types/issue'
import colors from 'vuetify/lib/util/colors'
import store from '@/store'
import _ from 'lodash'

@Component
export default class LemmaLabel extends Vue {

  @Prop({ default: [] }) value!: number[]

  searchText: string|null = null
  newLabel: Label|null = null
  colors = colors
  defaultLabelColor = '#555'

  get selectedLabels() {
    return this.value.map(id => this.labels.find(l => l.id === id)).concat(this.newLabel || [])
  }

  get labels() {
    return store.issue.labels
  }

  isNewLabel(l: string|Label): l is string {
    return typeof l === 'string'
  }

  addLabel(name: string) {
    this.newLabel = {
      name: name,
      color: this.defaultLabelColor,
      id: Math.floor(Math.random() * 1000)
    }
  }

  onChange(ls: (Label|string)[]) {
    this.searchText = ''
    const newLabel = ls.find(this.isNewLabel)
    if (newLabel !== undefined) {
      this.addLabel(newLabel)
    }
    this.$emit('update', ls.filter((l): l is Label => !this.isNewLabel(l)).map(l => l.id))
  }

  async createLabel() {
    if (this.newLabel !== null) {
      const { id } = await store.issue.createLabel(this.newLabel.name, this.newLabel.color || this.defaultLabelColor)
      if (id !== undefined) {
        this.$emit('update', this.value.concat(id))
        this.newLabel = null
      }
    }
  }

  onDelete(label: Label) {
    this.$emit('update', this.value.filter(id => id !== label.id))
  }

}
</script>
<style lang="stylus" scoped>
.label
  color white
  font-weight 600

.label-box /deep/ .v-input__slot
  padding 3px 3px !important
</style>
