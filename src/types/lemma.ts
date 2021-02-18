/* eslint-disable @typescript-eslint/camelcase */

import { Person as LdPerson } from 'schema-dts'
import * as t from 'io-ts'
import { PathReporter } from 'io-ts/PathReporter'

export interface UserColumn {
  [key: string]: string|number
}

const serverResearchLemma = t.type({
  id: t.number,
  gnd: t.array(t.string),
  list: t.union([t.undefined, t.type({
    id: t.number,
    title: t.string
  })]),
  firstName: t.string,
  lastName: t.string,
  dateOfBirth: t.string,
  dateOfDeath: t.string,
  selected: t.boolean,
  // columns_user: UserColumn,
  columns_user: t.record(t.string, t.union([t.string, t.number])),
  columns_scrape: t.type({
    obv: t.union([
      t.UnknownArray,
      t.type({
        count_obv: t.number,
        count_topic: t.number,
        count_author: t.number,
        count_coauthor: t.number,
        list_coauthors: t.array(t.string),
        count_topic_authors: t.number
      })
    ]),
    wikidata: t.union([
      t.UnknownArray,
      t.type({
        p: t.string,
        loc: t.string,
        viaf: t.string,
        pLabel: t.string,
        wiki_de: t.string,
        date_of_birth: t.string,
        auszeichnungen: t.string,
      })
    ])
  }),
  wikipedia: t.union([
    t.UnknownArray,
    t.type({
      txt: t.string,
      edits_count: t.string,
      number_of_editors: t.string,
    })
  ])
})

export const isValidServerResearchLemma = (l: any) => {
  const result = t.partial(serverResearchLemma.props).decode(l)
  console.log(PathReporter.report(result))
  return t.partial(serverResearchLemma.props).is(t)
}

console.log('is partial', t.partial(serverResearchLemma.props).is({
  firstName: 'arnold'
}))

// TODO: remove assertion
export type ServerResearchLemma = t.TypeOf<typeof serverResearchLemma>

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
