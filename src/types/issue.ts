import { IssueLemma as ApiIssueLemma, LemmaLabel, LemmaStatus as ApiLemmaStatus } from '@/api'
import { Modify } from './index'

export interface Requests {

  /** GET /issues */
  getIssues: Issue[]

  /** GET /issues/:issue_id/lemma */
  getLemmata: IssueLemma[]

  /** GET /authors */
  getAuthors: Author[]

  /** GET /editors */
  getEditors: Editor[]

  /** GET /lemma-status */
  getStatuses: LemmaStatus[]

  /** POST /lemmas/:id/note */
  postLemmaComment: Pick<LemmaNote, 'text'>

  /** PUT /lemmas/:id/status */
  putLemmaStatus: Pick<LemmaStatus, 'id'>

  /** PUT /lemmas/:id/assignee */
  putLemmaEditor: Pick<Editor, 'userId'>

  /** PUT /lemmas/:id/author */
  putLemmaAuthor: Pick<Author, 'userId'>

}

export type ID = string

export interface Issue {
  publicationDate: string
  name: string
  id: ID
}

export interface Lemma {
  /** @nullable */
  firstName: string|null
  /** @nullable */
  lastName: string|null
  /** @nullable */
  dateOfBirth: string|null
  /** @nullable */
  dateOfDeath: string|null
  /** @nullable */
  [key: string]: string|null
}

export type IssueLemma = Modify<ApiIssueLemma, {
  id: number
  lemma: Lemma
  status: number|null
  editor: number|null
  order: number
  author: number|null
  tokenCount: number
  characterCount: number
  entityCount: number
  labels: number[]
  notes: LemmaNote[]
}>

export interface LemmaNote {
  id: ID
  user: User
  date: string
  text: string
}

export type Label = LemmaLabel

export type LemmaStatus = ApiLemmaStatus

// export interface LemmaStatus {
//   order: number
//   name: 'verteilt'|
//     'ausgeschrieben'|
//     'zugesagt'|
//     'eingelangt'|
//     'autordurchsicht'|
//     'gruppenredaktion'|
//     'endredaktion'
//   id: ID
// }

export interface Role {
  id: ID
  name: string
}

export interface User {
  userId: ID
  name: string
  role: Role
  email: string
}

export interface Editor extends User {
  /** @nullable */
  profilePicture: string|null
}

export type Author = User
