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
        contentClass: 'soft-shadow text-body-2 v-list--dense background lighten-1'
      }"
      :search-input.sync="searchText"
      :value="selectedLabels"
      :items="labels">
      <template v-slot:selection="{ selected, select, item }">
        <v-chip
          :key="item.id"
          :input-value="selected"
          @click="select"
          close
          small
          class="font-weight-medium label"
          text-color="white"
          close-icon="mdi-close"
          @click:close="onRemove(item)"
          :color="item.color">
          {{ item.name }}
        </v-chip>
      </template>
      <template v-slot:item="{ item, on, props }">
        <v-list-item :ripple="false" class="label-list-item" v-bind="props" v-on="on">
          <v-list-item-avatar size="15">
            <v-icon v-if="value.find(id => id === item.id) !== undefined" :color="item.color">mdi-checkbox-marked-circle</v-icon>
            <v-icon v-else :color="item.color">mdi-checkbox-blank-circle</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
              {{ item.name }}
          </v-list-item-content>
          <v-list-item-action-text class="action">
            <v-btn @click.stop.capture.prevent="editLabel(item)" depressed small rounded>bearbeiten</v-btn>
          </v-list-item-action-text>
        </v-list-item>
      </template>
      <template v-slot:prepend-item>
        <v-list-item
          style="border-bottom: 1px solid rgba(0,0,0,.1)"
          @click="addLabel(searchText || 'unbenanntes Label')">
          <v-list-item-avatar size="15">
            <v-icon>mdi-plus</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>Label erstellen…</v-list-item-content>
        </v-list-item>
        <v-divider />
      </template>
    </v-combobox>
    <v-dialog
      scrollable
      max-width="620"
      :value="editingLabel !== null"
      v-if="editingLabel !== null">
      <v-card color="background" class="rounded-lg elevation-25">
        <v-card-title class="px-2">
          <v-row dense>
            <v-col class="">
              <v-btn color="background darken-2" class="rounded-lg px-4" @click="editingLabel = null" elevation="0">Abbrechen</v-btn>
            </v-col>
            <v-col class="text-center">
              Label erstellen
            </v-col>
            <v-col class="text-right">
              <v-btn
                class="rounded-lg px-4"
                @click="saveLabel"
                color="primary"
                :disabled="!editingLabel.name"
                elevation="0">Speichern</v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-title class="pt-0 px-2">
          <v-text-field
            solo
            flat
            class="rounded-lg"
            background-color="background darken-2"
            autofocus
            :rules="labelNameRules"
            label="Label Name"
            v-model="editingLabel.name">
            <template v-slot:prepend-inner>
              <span class="caption pr-2">Labelname</span>
            </template>
          </v-text-field>
        </v-card-title>
        <v-divider />
        <v-card-text class="overflow-y-auto pt-3 background lighten-2" style="height: 300px">
          <div v-for="(color, name) in colors" :key="name">
            <v-subheader class="pl-0">{{name}}</v-subheader>
            <v-btn
              icon
              v-for="(shade, shadeName) in color"
              :key="shadeName"
              @click="editingLabel.color = shade"
              class="mr-1 mb-1"
              :style="{ backgroundColor: shade}"
            />
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-row dense>
            <v-col cols="2">
              <v-btn
                v-if="editingLabel !== undefined && editingLabel.id !== undefined && editingLabel.id > -1"
                @click="deleteEditingLabel"
                class="rounded-lg"
                color="background darken-2">Löschen</v-btn>
            </v-col>
            <v-col cols="8" class="text-center">
              <v-chip
                style="color: white; font-weight: 500"
                class="label mx-auto"
                :color="editingLabel.color">
                {{ editingLabel.name }}
              </v-chip>
            </v-col>
            <v-col cols="2">
            </v-col>
          </v-row>
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
import confirm from '@/store/confirm'
import _ from 'lodash'

@Component
export default class LemmaLabels extends Vue {

  @Prop({ default: [] }) value!: number[]

  searchText: string|null = null
  editingLabel: Label|null = null
  defaultLabelColor = colors.blueGrey.base

  labelNameRules = [
    (n: string) => (n === null || (typeof n === 'string' && n.trim() === '')) && 'Geben Sie einen Namen ein.',
    (n: string) => this.labels.findIndex(l => l.name.trim().toLocaleLowerCase() === n.trim().toLocaleLowerCase()) > -1 && 'Dieses Label exisitiert bereits.'
  ]

  get colors() {
    return _.mapKeys(colors, (v, k) => _.startCase(k))
  }

  get selectedLabels() {
    return this.value
      .map(id => this.labels.find(l => l.id === id))
      .filter(v => v !== undefined)
  }

  get labels() {
    return store.issue.labels
  }

  isNewLabel(l: string|Label): l is string {
    return typeof l === 'string'
  }

  addLabel(name: string) {
    this.editingLabel = {
      name: name,
      color: this.defaultLabelColor,
      id: -1
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

  async deleteEditingLabel() {
    const i = this.editingLabel
    if (i !== null && i.id !== undefined && i.id > -1) {
      if (await confirm.confirm('Wollen Sie dieses Label löschen? Das Label wird von allen Einträgen entfernt.')) {
        store.issue.deleteLabel(i.id)
        this.editingLabel = null
      }
    }
  }

  async editLabel(item: Label) {
    this.editingLabel = item
  }

  async saveLabel() {
    if (this.editingLabel !== null) {
      if (this.editingLabel.id === -1) {
        const { id } = await store.issue.createLabel(this.editingLabel.name, this.editingLabel.color || this.defaultLabelColor)
        if (id !== undefined) {
          this.$emit('update', this.value.concat(id))
        }
      } else {
        await store.issue.updateLabel(this.editingLabel.id!, this.editingLabel.color || this.defaultLabelColor, this.editingLabel.name)
      }
      this.editingLabel = null
    }
  }

  onRemove(label: Label) {
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

.label-list-item .action
  opacity 0

.label-list-item:hover .action
  opacity 1
</style>
