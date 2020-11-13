
import { Person as LdPerson } from 'schema-dts'

declare module '*'

export interface Column {
  value: string|null;
  text: string;
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

export interface Person {
  firstName: string|null
  lastName: string|null
  dateOfBirth: string|null
  dateOfDeath: string|null
  placeOfBirth: string|null
  placeOfDeath: string|null
  gnd: string|null
}

export interface PersonMatchable extends Person {
  id: string
  lobid: LdPerson[]
  candidateSelected: number
  loaded: boolean
}

export interface PersonField {
  value: keyof Person
  text: string
  hint?: string
  rules?: Array<(e: string) => boolean>
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

declare module 'vue-multipane'
