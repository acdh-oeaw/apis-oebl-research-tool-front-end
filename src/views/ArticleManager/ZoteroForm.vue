<template>
  <div>
    <text-field label="Eintragsart">
      <template v-slot:input>
        <select
          @input="updateSimpleValue('itemType', $event.target.value)"
          :value="value.data.itemType"
          class="ma-2 fill-width">
          <option
            v-for="itemType in zotero.itemTypes"
            :key="itemType.itemType"
            :value="itemType.itemType">
            {{ itemType.localized }}
          </option>
        </select>
      </template>
    </text-field>
    <div v-for="(creator, i) in value.data.creators" :key="i">
      <text-field>
        <template v-slot:prepend>
          <v-icon class="pl-1" small>mdi-chevron-down</v-icon>
          <select
            class="styled-select caption muted"
            @input="updateCreator(i, { creatorType: $event.target.value })"
            :value="creator.creatorType">
            <option
              v-for="creatorType in itemTypeCreatorTypes"
              :key="creatorType.creatorType"
              :value="creatorType.creatorType">
              {{ creatorType.localized }}
            </option>
          </select>
        </template>
        <template v-slot:input>
          <div class="py-2">
            <input @input="updateCreator(i, { firstName: $event.target.value })" type="text" placeholder="Vorname" :value="creator.firstName" />
            <v-divider class="ma-0 mr-2 muted" />
            <input @input="updateCreator(i, { lastName: $event.target.value })" type="text" placeholder="Nachname" :value="creator.lastName" />
          </div>
        </template>
        <div class="text-right d-flex flex-nowrap">
          <v-btn
            @click="removeCreator(i)"
            v-if="i > 0"
            class="mt-3 rounded-lg align-self-center"
            icon
            tile
            small>
            <v-icon color="primary">mdi-minus-circle-outline</v-icon>
          </v-btn>
          <v-btn
            @click="addCreator"
            class="mt-3 mr-2 rounded-lg align-self-center"
            icon
            tile
            small>
            <v-icon color="primary">mdi-plus-circle-outline</v-icon>
          </v-btn>
        </div>
      </text-field>
    </div>
    <div v-for="field in itemTypeFields" :key="field.field">
      <text-field
        :label="field.localized"
        @input="updateSimpleValue(field.field, $event)"
        :value="value.data[field.field]"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import zotero, { ZoteroItem, ZoteroItemCreator } from '@/service/zotero'
import TextField from '@/views/lib/TextField.vue'

type PartialRecord<K extends keyof ZoteroItem['data'], T> = { [P in K]?: T; };

type ZoteroTranslations = PartialRecord<keyof ZoteroItem['data'], string>

interface ZoteroAuthor {
  creatorType: string,
  firstName: string,
  lastName: string
}

@Component({
  components: {
    TextField
  }
})
export default class ZoteroForm extends Vue {

  @Prop({ required: true }) value!: ZoteroItem
  zotero = zotero
  authors: ZoteroAuthor[] = []

  emitValue(d: Partial<ZoteroItem['data']>) {
    this.$emit('input', d, this.value.data.version)
  }

  updateCreator(i: number, c: Partial<ZoteroItemCreator>) {
    this.emitValue({
      creators: this.value.data.creators.map((cC, iC) => {
        if (i === iC) {
          return { ...cC, ...c }
        } else {
          return cC
        }
      })
    })
  }

  removeCreator(i: number) {
    this.emitValue({
      creators: this.value.data.creators.filter((_, iC) => iC !== i)
    })
  }

  addCreator() {
    this.emitValue({
      creators: this.value.data.creators.concat({
        firstName: '(Vorname)',
        lastName: '(Nachname)',
        creatorType: 'author'
      })
    })
  }

  updateSimpleValue(key: string, value: string) {
    this.emitValue({ [key]: value })
  }

  get itemTypeFields() {
    return zotero.itemTypeFields[this.value.data.itemType]
  }

  get itemTypeCreatorTypes() {
    return zotero.itemTypeCreators[this.value.data.itemType]
  }

}
</script>
<style lang="stylus" scoped>
.styled-select
  width 80px
  text-overflow ellipsis
  white-space nowrap
  overflow hidden
  position relative
  &:before
    content "▾ "

input[type="text"]
  outline 0
  width 100%
</style>
