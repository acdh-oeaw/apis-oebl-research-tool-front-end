<template>
  <div>
    <div v-for="(creator, i) in value.data.creators" :key="i">
      <text-field>
        <template v-slot:prepend>
          <v-icon class="pl-1" small>mdi-chevron-down</v-icon>
          <select
            class="styled-select caption"
            @input="updateCreator(i, { creatorType: $event.target.value })"
            :value="creator.creatorType">
            <option
              :value="creatorType.value"
              v-for="creatorType in creatorTypes"
              :key="creatorType.value">
              {{ creatorType.name }}
            </option>
          </select>
        </template>
        <template v-slot:input>
          <div class="py-2">
            <input @input="updateCreator(i, { firstName: $event.target.value })" type="text" placeholder="Vorname" :value="creator.firstName" />
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
    <div v-for="(field, key) in translatedFields" :key="key">
      <text-field
        :label="field"
        @input="updateSimpleValue(key, $event)"
        :value="value.data[key]"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Title, TitleCreator } from '@/service/zotero'
import TextField from '@/views/lib/TextField.vue'

type PartialRecord<K extends keyof Title['data'], T> = { [P in K]?: T; };

type ZoteroTranslations = PartialRecord<keyof Title['data'], string>

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
  @Prop({ required: true }) value!: Title
  authors: ZoteroAuthor[] = []
  creatorTypes = [
    {
      name: 'Autor',
      value: 'author'
    },
    {
      value: 'editor',
      name: 'Herausgeber'
    },
    {
      name: 'Herausgeber d. Reihe',
      value: 'seriesEditor'
    },
    {
      name: 'Mitarbeiter',
      value: 'contributor'
    },
    {
      name: 'Übersetzter',
      value: 'translator'
    }
  ]

  updateCreator(i: number, c: Partial<TitleCreator>) {
    console.log(i, c)
    this.$emit('input', {
      ...this.value,
      data: {
        ...this.value.data,
        creators: this.value.data.creators.map((cC, iC) => {
          if (i === iC) {
            return { ...cC, ...c }
          } else {
            return cC
          }
        })
      }
    })
  }

  removeCreator(i: number) {
    this.$emit('input', {
      ...this.value,
      data: {
        ...this.value.data,
        creators: this.value.data.creators.filter((_, iC) => iC !== i)
      }
    })
  }

  addCreator() {
    this.$emit('input', {
      ...this.value,
      data: {
        ...this.value.data,
        creators: [
          ...this.value.data.creators,
          {
            firstName: '(Vorname)',
            lastName: '(Nachname)',
            creatorType: 'author'
          }
        ]
      }
    } as Title)
  }

  updateSimpleValue(key: string, value: string) {
    this.$emit('input', {
      ...this.value,
      data: {
        ...this.value.data,
        [key]: value
      }
    })
  }

  translatedFields: ZoteroTranslations = {
    title: 'Titel',
    itemType: 'Eintragsart',
    abstractNote: 'Zusammenfassung',
    series: 'Reihe',
    seriesNumber: 'Nummer der Reihe',
    volume: 'Band',
    numberOfVolumes: '# von Bänden',
    edition: 'Auflage',
    place: 'Ort',
    publisher: 'Verlag',
    date: 'Datum',
    numPages: 'Anzahl der Seiten',
    language: 'Sprache',
    ISBN: 'ISBN',
    shortTitle: 'Kurztitel',
    url: 'URL',
    accessDate: 'Heruntergeladen am',
    libraryCatalog: 'Archiv'
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
