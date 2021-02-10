
import { Person as LdPerson } from 'schema-dts'

export interface UserColumn {
  [key: string]: string|number
}
// TODO: remove assertion
export interface ServerResearchLemma {
  id: number
  gnd: string[]
  list?: {
    id: number
    title: string
  }
  firstName: string
  lastName: string
  dateOfBirth: string
  dateOfDeath: string
  selected?: boolean
  columns_user: UserColumn
  columns_scrape: {
    obv: {
      count_obv: number
      count_topic: number
      count_author: number
      count_coauthor: number
      list_coauthors: string[]
      count_topic_authors: number
    }
    wikidata: {
      p: string
      loc: string
      viaf: string
      pLabel: string
      wiki_de: string
      date_of_birth: string
      auszeichnungen: string
    } | [],
    wikipedia: {
      txt: string
      edits_count: string
      number_of_editors: string
    } | []
  }
}

export interface LemmaRow {
  id: number
  list?: {
    id: number
    title: string
  }
  columns_user: UserColumn
  columns_scrape?: ServerResearchLemma['columns_scrape']
  selected: boolean
  firstName: string
  lastName: string
  birthYear: string|null
  deathYear: string|null
  gnd: string[]
  loc: number|null
  viaf_id: number|null
  wiki_edits: number|null
  [userColumn: string]: any
}

export interface LemmaColumn {
  name: string
  value: keyof LemmaRow
  type: 'text'|'link'|'number'|'boolean'|'array',
  filterable: boolean
  show: boolean
  getSimilarityFactor?: (a: LemmaRow, b: LemmaRow) => number
  width?: number
  sort?: null|'asc'|'desc',
  isUserColumn: boolean
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
  firstName: string|null
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
