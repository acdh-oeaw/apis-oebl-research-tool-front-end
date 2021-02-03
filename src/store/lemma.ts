/* eslint-disable @typescript-eslint/camelcase */
import { WorkflowService, Author, Lemma, ResearchService, List as LemmaList, IssueLemma } from '@/api'
import request from './request'
// eslint-disable-next-line @typescript-eslint/camelcase
import random_name from 'node-random-name'
import _ from 'lodash'
import { ImportablePerson, LemmaColumn, LemmaRow, ServerResearchLemma, UserColumn } from '@/types/lemma'
import Dexie from 'dexie'
import * as jaroWinkler from 'jaro-winkler'
import { WithId } from '@/types'

class LemmaDatabase extends Dexie {
  public lemmas: Dexie.Table<LemmaRow, number>
  public constructor() {
    super('LemmaDb')
    this.version(2).stores({
      lemmas: 'id,firstName,lastName,birthYear,deathYear,gnd,loc,viaf_id,starred'
    })
    this.lemmas = this.table('lemmas')
  }
}

export default class LemmaStore {

  private lastViewDate: Date|null = null
  private localDb = new LemmaDatabase()
  private _lemmas: LemmaRow[] = []
  private _selectedLemmaListId: null|number = null
  private _selectedLemmaFilterId: null|string = null
  private _selectedLemmaIssueId: null|number = null

  public showSideBar = true
  public selectedIssueLemmas: WithId<IssueLemma>[] = []
  public selectedLemmas: LemmaRow[] = []
  public lemmaLists: LemmaList[] = []
  public columns: LemmaColumn[] = []
  public defaultColumns: LemmaColumn[] = [
    {
      name: 'Markiert',
      value: 'starred',
      type: 'boolean',
      filterable: true,
      show: true,
      width: 70,
      isUserColumn: false
    },
    {
      name: 'Nachname',
      value: 'lastName',
      type: 'text',
      filterable: true,
      show: true,
      getSimilarityFactor: (a, b) => jaroWinkler(a.lastName, b.lastName) * 3,
      isUserColumn: false
    },
    {
      name: 'Vorname',
      value: 'firstName',
      type: 'text',
      filterable: true,
      show: true,
      getSimilarityFactor: (a, b) => jaroWinkler(a.firstName, b.firstName) * 2,
      isUserColumn: false
    },
    {
      name: 'Geburtsjahr',
      value: 'birthYear',
      type: 'number',
      filterable: true,
      show: true,
      // getSimilarityFactor: (a, b) => {
      //   if (a.birthYear !== null && b.birthYear !== null) {
      //     return Math.abs(a.birthYear - b.birthYear) <= 10 ? 2 : 0
      //   } else {
      //     return 0
      //   }
      // },
      isUserColumn: false
    },
    {
      name: 'Sterbejahr',
      value: 'deathYear',
      type: 'number',
      filterable: true,
      show: true,
      // getSimilarityFactor: (a, b) => Math.abs(a.deathYear - b.deathYear) <= 10 ? 2 : 0,
      isUserColumn: false
    },
    {
      name: 'GND',
      value: 'gnd',
      type: 'array',
      filterable: true,
      show: true,
      isUserColumn: false
    },
    {
      name: 'Library of Congress',
      value: 'loc',
      type: 'link',
      filterable: true,
      show: true,
      isUserColumn: false
    },
    {
      name: 'VIAF ID',
      value: 'viaf_id',
      type: 'link',
      filterable: true,
      show: true,
      isUserColumn: false
    },
    {
      name: 'Wikipedia Edits',
      value: 'wiki_edits',
      type: 'number',
      filterable: true,
      show: true,
      isUserColumn: false
    },
    {
      name: 'id',
      value: 'id',
      type: 'number',
      filterable: true,
      show: false,
      isUserColumn: false
    }
  ]

  constructor() {
    this.initLemmaData()
    this.loadRemoteLemmaLists()
  }

  get selectedLemmaIssueId() {
    return this._selectedLemmaIssueId
  }

  set selectedLemmaIssueId(id) {
    this._selectedLemmaListId = null
    this._selectedLemmaFilterId = null
    this._selectedLemmaIssueId = id
  }

  get selectedLemmaListId() {
    return this._selectedLemmaListId
  }

  set selectedLemmaListId(val) {
    this._selectedLemmaIssueId = null
    this._selectedLemmaFilterId = null
    this._selectedLemmaListId = val
  }

  get selectedLemmaFilterId() {
    return this._selectedLemmaFilterId
  }

  set selectedLemmaFilterId(val) {
    this._selectedLemmaIssueId = null
    this._selectedLemmaListId = null
    this._selectedLemmaFilterId = val
  }

  async deleteLemmaList(id: number) {
    await request(ResearchService.researchApiV1ListresearchDestroy, id)
    await this.loadRemoteLemmaLists()
  }

  addLemma(l: Lemma) {
    console.log('add lemma', l)
  }

  async loadRemoteLemmaLists() {
    this.lemmaLists = await (await request(ResearchService.researchApiV1ListresearchList, undefined)).results || []
  }

  getAllUserColumns(lemmas: LemmaRow[]): LemmaColumn[] {
    const userColumnIndex: { [key: string]: string } = {}
    // read all user columns from lemmas
    for (const lemma of lemmas) {
      if (lemma.columns_user !== undefined) {
        for (const key in lemma.columns_user) {
          if (userColumnIndex[key] === undefined) {
            userColumnIndex[key] = typeof lemma.columns_user[key]
          }
        }
      }
    }
    const uc = _.map(userColumnIndex, (v, k) => {
      return {
        name: k,
        value: k,
        filterable: true,
        type: 'text' as 'text',
        show: true,
        isUserColumn: true
      }
    })
    console.log({uc})
    return uc
  }

  async initLemmaData() {
    this._lemmas = await this.getLocalLemmaCache()
    this.lastViewDate = await this.getLastViewDate()
    // if (this.lemmas.length === 0) {
    this.lemmas = await this.getRemoteLemmas()
    this.columns = [ ...this.defaultColumns, ...this.getAllUserColumns(this.lemmas) ]
    // } else {
    //   const newLemmasSinceLastVisit = await this.getRemoteLemmas(this.lastViewDate)
    //   if (newLemmasSinceLastVisit.length > 0) {
    //     this.updateLemmasWith(newLemmasSinceLastVisit)
    //   }
    // }
  }

  getSumSimilarity(l: LemmaRow, lc: LemmaRow): number {
    return this.columns.reduce((m, e) => {
      if (e.getSimilarityFactor !== undefined) {
        m = m + e.getSimilarityFactor(l, lc)
      }
      return m
    }, 0)
  }

  getMostSimilarLemmas(l: LemmaRow) {
    console.time('similar')
    const s = _(this.lemmas)
      .map(lc => ({ ...lc, similarity: this.getSumSimilarity(lc, l) }))
      .filter(lc => lc.similarity > 0)
      .orderBy('similarity', 'desc')
      .value()
    console.timeEnd('similar')
    return s
  }

  async getLastViewDate() {
    // TODO:
    return new Date()
  }

  async getLocalLemmaCache() {
    console.time('local cache')
    const x = await this.localDb.lemmas.toArray()
    console.timeEnd('local cache')
    return x
  }

  async deleteLemma(ids: number[]) {
    const deleteRemote = await Promise.all(ids.map(id => {
      return request(ResearchService.researchApiV1LemmaresearchDestroy, id)
    }))
    // TODO:
    // this.lemmas = this.lemmas.filter(l => ids.indexOf(l.id) > -1)
  }

  fakeLemma(seed: number): LemmaRow {
    const gnds = _.range(0, _.random(0, 3)).map(() => _.random(100000001, 993183199, false).toString())
    const bYear = _.random(1890, 1990, false)
    return {
      id: seed,
      starred: _.random(0, 1, true) >= 0.95, // 5 percent should be starred
      firstName: random_name({ first: true, seed }),
      lastName: random_name({ last: true, seed }),
      birthYear: bYear.toString(),
      deathYear: _.random(bYear, 2000, false).toString(),
      gnd: gnds,
      columns_user: {},
      list: undefined,
      loc: gnds.length > 0 ? _.random(2313882, 9931831, false) : null,
      // eslint-disable-next-line @typescript-eslint/camelcase
      viaf_id: gnds.length > 0 ? _.random(2313882, 9931831, false) : null,
      // eslint-disable-next-line @typescript-eslint/camelcase
      wiki_edits: gnds.length > 0 ? _.random(0, 651, false) : null
    }
  }

  async importLemmas(ls: ImportablePerson[], listName: string|null) {
    const x = await ResearchService.researchApiV1LemmaresearchCreate(({
      list: 3,
      lemmas: ls.map(l => ({
        ...l,
        firstName: l.firstName || undefined,
        lastName: l.lastName || undefined,
        dateOfBirth: l.dateOfBirth || undefined,
        dateOfDeath: l.dateOfDeath || undefined,
        gnd: l.gnd
      }))
    }))
  }

  convertRemoteLemmaToLemmaRow(rs: ServerResearchLemma): LemmaRow {
    const dateOfBirth = _.get(rs, 'columns_scrape.wikidata.date_of_birth')
    const dateOfDeath = _.get(rs, 'columns_scrape.wikidata.date_of_death')
    return {
      id: rs.id!,
      starred: false,
      birthYear: dateOfBirth ? (new Date(dateOfBirth).getFullYear().toString()) : null,
      deathYear: dateOfDeath ? (new Date(dateOfDeath).getFullYear().toString()) : null,
      loc: _.get(rs, 'columns_scrape.wikidata.loc'),
      viaf_id: _.get(rs, 'columns_scrape.wikidata.viaf'),
      wiki_edits: _.get(rs, 'columns_scrape.wikipedia.edits_count'),
      ...rs.columns_user,
      firstName: rs.firstName,
      lastName: rs.lastName,
      // yuck
      gnd: rs.gnd,
      columns_user: rs.columns_user,
      columns_scrape: rs.columns_scrape,
      // yuck
      list: rs.list,
    }
  }

  async getRemoteLemmas(modifiedAfter: Date|null = null): Promise<LemmaRow[]> {
    if (modifiedAfter !== null) {
      // TODO: get new ones.
      return []
    } else {
      // @ts-ignore
      return ((await request(ResearchService.researchApiV1LemmaresearchList, 1000)).results as ServerResearchLemma[] || [] as ServerResearchLemma[]).map(this.convertRemoteLemmaToLemmaRow)
      // get all (mock)
      // return _(_.range(0, 10000))
      //   .map(this.fakeLemma)
      //   .sortBy('birthYear')
      //   .value()
    }
  }

  async updateLemmasWith(ls: LemmaRow[]) {
    await this.localDb.lemmas.bulkPut(ls)
    this._lemmas = await this.localDb.lemmas.toArray()
    return this._lemmas
  }

  async updateLemmaById(id: number, data: Partial<LemmaRow>) {
    console.log({id, data})
    const i = this.lemmas.findIndex(l => l.id === id)
    if (i > -1) {
      const newLemma = {...this.lemmas[i], ...data}
      await this.localDb.lemmas.put(newLemma)
    }
  }

  getLemmaById(id?: number) {
    return id === undefined ? undefined : this._lemmas.find(l => l.id === id)
  }

  get lemmas() {
    if (this.selectedLemmaListId !== null) {
      return this._lemmas.filter(l => l.list?.id === this.selectedLemmaListId)
    } else if (this.selectedLemmaIssueId !== null) {
      return _(this.selectedIssueLemmas).map(l => {
        return this.getLemmaById(l.lemma || undefined)
      }).compact().value()
    } else {
      return this._lemmas
    }
  }

  set lemmas(ls: LemmaRow[]) {
    this._lemmas = ls
    this.localDb.lemmas.clear().then(() => this.localDb.lemmas.bulkAdd(ls))
  }

}
