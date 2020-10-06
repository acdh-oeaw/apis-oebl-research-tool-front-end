
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
}

export interface PersonMatchable extends Person {
  lobid: LdPerson[]
  candidateSelected: number
  loaded: boolean
}

declare module 'vue-multipane'
