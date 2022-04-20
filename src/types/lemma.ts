/* eslint-disable @typescript-eslint/camelcase */

import { Person as LdPerson } from 'schema-dts'
import { ListEntry } from '@/api/models/ListEntry'
import { GenderAe0Enum } from '@/api/models/GenderAe0Enum'
import { DateContainer } from '@/util/dates'

export interface UserColumn {
  [key: string]: string|number|string[]
}

export interface ServerResearchLemma extends ListEntry {
  id: number,
  columns_user: {
    [key: string]: string|number
  },
  columns_scrape: {
    [source: string]: ({
      [key: string]: string|number|string[]
    } | [])
  }
}

export interface ProfessionGroup {
  id?: number,
  name?: string
}


export interface FullName {
  firstName?: string|null,
  lastName?: string|null,
}

export interface SecondaryCitation {
  id?: number|null,
  title: string,
  pages?: string|null,
}

/**
 * Dynamic property notation breaks keysof (for Omit, Pick)
 */
export interface LemmaRow {
  id: number,
  list?: {
    id?: number,
    title: string,
    editor?: number,
  },
  columns_user: UserColumn,
  columns_scrape?: ServerResearchLemma['columns_scrape'],
  selected: boolean,
  firstName?: string | null,
  lastName: string,
  alternativeNames: Array<FullName>,
  dateOfBirth: DateContainer,
  dateOfDeath: DateContainer,
  gender?: GenderAe0Enum,
  gnd: string[],
  loc: number|null,
  viaf_id: number|null,
  wiki_edits: number|null,
  professionDetail?: string|null,
  professionGroup?: ProfessionGroup|null,
  legacyGideonCitations?: null | Array<{id: Number, value: string}>,
  secondaryLiterature: null|Array<SecondaryCitation>,
  zoteroKeysBy: string[],
  zoteroKeysAbout: string[],
  bioNote?: string|null,
  kinship?: string|null,
  religion?: string|null,
  updated?: string|null,
}

/**
 * A serialized instance of LemmaRow for IndexedDb and LocalStorage
 */
export type SerializedLemmaRow  = LemmaRow & {
  dateOfBirth?: string// ISO
  dateOfDeath?: string// ISO
}

export interface LemmaColumn {
  name: string
  value: string | keyof LemmaRow,
  type: 'text'|'link'|'number'|'boolean'|'array',
  filterable: boolean
  show: boolean
  getSimilarityFactor?: (a: LemmaRow, b: LemmaRow) => number
  width?: number
  sort?: null|'asc'|'desc',
  isUserColumn: boolean
  editable: boolean
}

export interface LemmaFilterItem {
  comparator: LemmaFilterComparator['value']
  query: string
  column: LemmaColumn
}

export interface LemmaFilterComparator {
  icon: string
  name: string
  value: string
  predicate: (e: any, q: any) => boolean
}

export interface Column {
  value: string|null
  text: string
  convert?: (e: string|number) => number|string
}

export interface Header {
  matchWith: string|null;
  text: string;
  sortable: boolean;
  value: string;
}

export interface Row {
  [key: string]: string|number

}
export type Table<T> = T[]

export interface ImportablePerson {
  firstName?: string|null
  lastName: string|null
  dateOfBirth: string|null
  dateOfDeath: string|null
  gnd: string[]
}

export interface PersonMatchable extends ImportablePerson {
  id: string
  lobid: LdPerson[]
  candidateSelected: number
  loaded: boolean
}

export interface PersonField {
  value: keyof ImportablePerson
  text: string
  hint?: string
  rules?: Array<(e: string) => boolean>
  convert?: (e: string) => number|string|Date|null
}

export interface SelectOptions {
  text: string
  value: string|null
  disabled?: boolean
}

export interface Filter {
  text: string
  value: string
  filter: (e: PersonMatchable) => boolean
  count: number
  color: string
}
