/* eslint-disable @typescript-eslint/camelcase */
import _ from 'lodash'
import Dexie from 'dexie'
import * as jaroWinkler from 'jaro-winkler'

import { ResearchService, List as LemmaList, IssueLemma, List } from '@/api'
import notifyService from '@/service/notify/notify'
import { ImportablePerson, isValidServerResearchLemma, LemmaColumn, LemmaFilterItem, LemmaRow, ServerResearchLemma } from '@/types/lemma'
import { WithId } from '@/types'
import store from '.'
import { UserProfile } from './user'

interface LemmaFilter {
  id: string
  name: string
  filterItems: LemmaFilterItem[]
}

class LemmaDatabase extends Dexie {
  public lemmas: Dexie.Table<LemmaRow, number>
  public constructor() {
    super('LemmaDb')
    this.version(3).stores({
      lemmas: 'id,firstName,lastName,birthYear,deathYear,gnd,loc,viaf_id,selected'
    })
    this.lemmas = this.table('lemmas')
  }
}

export default class LemmaStore {

  private lastViewDate: Date|null = null
  private localDb = new LemmaDatabase()

  private _lemmas: LemmaRow[] = []
  private _lemmaLists: LemmaList[] = []
  private _columns: LemmaColumn[] = []

  private _selectedLemmaListId: null|number = null
  private _selectedLemmaFilterId: null|string = null
  private _selectedLemmaIssueId: null|number = null
  private _selectedLemmas: LemmaRow[] = []

  private _storedLemmaFilters: LemmaFilter[] = []

  public showSideBar = true
  public selectedIssueLemmas: WithId<IssueLemma>[] = []
  public newLemmasInUserList: { [listId: number]: { [lemmaId: number]: LemmaRow } } = {}

  public defaultColumns: LemmaColumn[] = [
    {
      name: 'Markiert',
      value: 'selected',
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
    this.listenForRemoteUpdates()
    this.listenForRemoteImports()
  }

  updateDescribesListMovement(ls: LemmaRow[], update: Partial<LemmaRow>): boolean {
    return (
      update.list !== undefined &&
      update.list !== undefined &&
      update.list?.id !== undefined &&
      ls.length > 0 &&
      ls[0].list !== undefined &&
      ls[0].list.id !== update.list.id
    )
  }

  getUserLists(lists: List[], u: UserProfile): List[] {
    return lists
      .filter(ll => {
        return (
          ll.editor !== undefined &&
          ll.editor.userId === store.user.userProfile.userId
        )
      })
  }

  isMovementToUserList(ls: LemmaRow[], update: Partial<LemmaRow>): boolean {
    return (
      this.updateDescribesListMovement(ls, update) &&
      this.getUserLists(this.lemmaLists, store.user.userProfile)
        .map(ll => ll.id)
        .includes(update.list?.id)
    )
  }

  listenForRemoteImports() {
    notifyService.on('importLemmas', (ls) => {
      console.log('importing lemmas', ls)
      this.insertLemmasLocally(ls.map(this.convertRemoteLemmaToLemmaRow))
    })
  }

  listenForRemoteUpdates() {
    notifyService.on('updateLemmas', (ls, u) => {
      const updatedLemmas = this.updateLemmasLocally(ls, u)
      if (this.isMovementToUserList(ls, u)) {
        if (u.list?.id !== undefined) {
          this.newLemmasInUserList[u.list?.id] = {
            ...this.newLemmasInUserList[u.list?.id],
            ..._.keyBy(updatedLemmas, 'id')
          }
        }
      }
    })
  }

  get columns() {
    const stored = JSON.parse(localStorage.getItem('columns') || 'null')
    this._columns = stored || this.defaultColumns
    return this._columns
  }

  set columns(cs) {
    this._columns = cs
    localStorage.setItem('columns', JSON.stringify(cs))
  }

  get storedLemmaFilters() {
    this._storedLemmaFilters = JSON.parse(localStorage.getItem('storedLemmaFilters') || '[]')
    return this._storedLemmaFilters
  }

  set storedLemmaFilters(ls: LemmaFilter[]) {
    this._storedLemmaFilters = ls
    localStorage.setItem('storedLemmaFilters', JSON.stringify(ls))
  }

  get lemmaLists(): ({ count?: number, countNew?: number } & LemmaList)[] {
    return this._lemmaLists.map(ll => {
      return {
        ...ll,
        count: this._lemmas.filter(l => l.list?.id === ll.id).length,
        countNew: ll.id !== undefined ? Object.keys(this.newLemmasInUserList[ll.id] || {}).length : 0
      }
    })
  }

  set lemmaLists(ll) {
    this._lemmaLists = ll
  }

  get lemmaCount() {
    return this._lemmas.length
  }

  get selectedLemmas() {
    this._selectedLemmas = JSON.parse(localStorage.getItem('selectedLemmas') || '[]')
    return this._selectedLemmas
  }

  set selectedLemmas(ls: LemmaRow[]) {
    this._selectedLemmas = ls
    localStorage.setItem('selectedLemmas', JSON.stringify(ls))
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

  getStoredLemmaFilterById(id: string) {
    return this._storedLemmaFilters.find(f => f.id === id)
  }

  deleteStoredLemmaFilter(id: string) {
    this.storedLemmaFilters = this.storedLemmaFilters.filter(f => f.id !== id)
  }

  updateStoredLemmaFilter(id: string, u: Partial<LemmaFilter>): LemmaFilter|undefined {
    this.storedLemmaFilters = this.storedLemmaFilters.map(f => {
      return f.id === id ? { ...f, ...u } : f
    })
    return this.getStoredLemmaFilterById(id)
  }

  async addLemmasToList(list: LemmaRow['list'], ls: LemmaRow[]) {
    if (list !== undefined) {
      this.updateLemmasLocally(ls, { list })
      notifyService.emit('updateLemmas', ls, { list })
      await Promise.all(ls.map(async (l) => {
        await ResearchService.researchApiV1LemmaresearchPartialUpdate(l.id, { list: { id: list.id, title: list.title } })
      }))
    }
  }

  private async insertLemmasLocally(ls: LemmaRow[]) {
    // this._lemmas = _.uniqBy(this._lemmas.concat(ls), 'id')
    this._lemmas = this._lemmas.concat(ls)
    await this.localDb.lemmas.bulkPut(ls)
  }

  private updateLemmasLocally(ls: LemmaRow[], u: Partial<LemmaRow>): LemmaRow[] {
    const ids = ls.map(l => l.id)
    const updatedLemmas: LemmaRow[] = []
    this._lemmas = this._lemmas.map((l) => {
      if (ids.includes(l.id)) {
        const nl = {...l, ...u}
        updatedLemmas.push(nl)
        return nl
      } else {
        return l
      }
    })
    this.localDb.lemmas.bulkPut(updatedLemmas)
    return updatedLemmas
  }

  async updateLemmas(ls: LemmaRow[], u: Partial<LemmaRow>) {
    // optimistic update
    this.updateLemmasLocally(ls, u)
    // actual update on the server
    await Promise.all(ls.map(async (l) => {
      await ResearchService.researchApiV1LemmaresearchPartialUpdate(l.id, u)
    }))
    // notify others
    notifyService.emit('updateLemmas', ls, u)
  }

  async deleteLemmaList(id: number) {
    this.lemmaLists = this.lemmaLists.filter(ll => ll.id !== id)
    this.selectedLemmaListId = null
    await ResearchService.researchApiV1ListresearchDestroy(id)
    await this.loadRemoteLemmaLists()
  }

  async addLemma(l: ImportablePerson) {
    await ResearchService.researchApiV1LemmaresearchCreate(({
      listId: this.lemmaLists[0].id!,
      lemmas: [ {
        dateOfBirth: l.dateOfBirth || undefined,
        dateOfDeath: l.dateOfDeath || undefined,
        firstName: l.firstName || undefined,
        lastName: l.lastName || undefined,
        selected: false,
        gnd: l.gnd
      } ]
    }))
  }

  async loadRemoteLemmaLists() {
    this.lemmaLists = (await ResearchService.researchApiV1ListresearchList()).results || []
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
        show: false,
        isUserColumn: true
      }
    })
    return uc
  }

  async initLemmaData() {
    this._lemmas = await this.getLocalLemmaCache()
    this.lastViewDate = await this.getLastViewDate()
    this.lemmas = await this.getRemoteLemmas()
    this.columns = _.uniqBy([
      ...this.columns,
      ...this.getAllUserColumns(this.lemmas)
    ], 'value')
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

  getListById(id: number) {
    return this.lemmaLists.find(i => i.id === id)
  }

  async getLocalLemmaCache() {
    console.time('local cache')
    const x = await this.localDb.lemmas.toArray()
    console.timeEnd('local cache')
    return x
  }

  async deleteLemma(ids: number[]) {
    console.log('delete ids', ids)
    this._lemmas = this._lemmas.filter(l => ids.indexOf(l.id) === -1)
    await Promise.all(ids.map(id => {
      return ResearchService.researchApiV1LemmaresearchDestroy(id)
    }))
  }

  fakeLemma(seed: number): LemmaRow {
    const gnds = _.range(0, _.random(0, 3)).map(() => _.random(100000001, 993183199, false).toString())
    const bYear = _.random(1890, 1990, false)
    return {
      id: seed,
      selected: _.random(0, 1, true) >= 0.95, // 5 percent should be selected
      firstName: 'testname', // random_name({ first: true, seed }),
      lastName: 'random_name', // ({ last: true, seed }),
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

  async importLemmas(ls: ImportablePerson[], listName: string) {
    const list = await (async () => {
      return this.createList(listName)
    })()
    await ResearchService.researchApiV1LemmaresearchCreate(({
      listId: list.id!,
      lemmas: ls.map(l => ({
        ...l,
        firstName: l.firstName || undefined,
        lastName: l.lastName || undefined,
        dateOfBirth: l.dateOfBirth || undefined,
        dateOfDeath: l.dateOfDeath || undefined,
        gnd: l.gnd
      }))
    }))
    return list
  }

  convertRemoteLemmaToLemmaRow(rs: ServerResearchLemma): LemmaRow {
    // TODO: remove options, use only dateOfBirth/Death
    const dateOfBirth = (rs as any).dateOfBirth || _.get(rs, 'columns_scrape.wikidata.date_of_birth') || _.get(rs, 'columns_user.dateOfBirth')
    const dateOfDeath = (rs as any).dateOfDeath || _.get(rs, 'columns_scrape.wikidata.date_of_death') || _.get(rs, 'columns_user.dateOfDeath')
    return {
      id: rs.id,
      selected: rs.selected || false,
      birthYear: dateOfBirth ? (new Date(dateOfBirth).getFullYear().toString()) : null,
      deathYear: dateOfDeath ? (new Date(dateOfDeath).getFullYear().toString()) : null,
      loc: _.get(rs, 'columns_scrape.wikidata.loc'),
      viaf_id: _.get(rs, 'columns_scrape.wikidata.viaf'),
      wiki_edits: _.get(rs, 'columns_scrape.wikipedia.edits_count'),
      ...rs.columns_user,
      firstName: rs.firstName,
      lastName: rs.lastName,
      // TODO: fix on server
      gnd: rs.gnd.filter(g => g !== 'None'),
      columns_user: rs.columns_user,
      columns_scrape: rs.columns_scrape,
      list: rs.list,
    }
  }

  async getRemoteLemmas(modifiedAfter: Date|null = null): Promise<LemmaRow[]> {
    if (modifiedAfter !== null) {
      // TODO: get new ones.
      return []
    } else {
      return ((await ResearchService.researchApiV1LemmaresearchList(1000)).results as ServerResearchLemma[] || [])
        .map(this.convertRemoteLemmaToLemmaRow)
    }
  }

  async updateList(id: number, l: Partial<LemmaList>) {
    this._lemmaLists = this._lemmaLists.map(l2 => {
      return id === l2.id ? {...l2, ...l} : l2
    })
    const newList = await ResearchService.researchApiV1ListresearchPartialUpdate(id, l)
  }

  async createList(title: string): Promise<LemmaList> {
    const s = await ResearchService.researchApiV1ListresearchCreate({ title })
    this.lemmaLists = [ ...this.lemmaLists, s ]
    return s
  }

  getLemmaById(id?: number) {
    return id === undefined ? undefined : this._lemmas.find(l => l.id === id)
  }

  getLemmasByList(listId: number) {
    return this._lemmas.filter(l => l.list?.id === listId)
  }

  getLemmasByIssue(issueId: number) {
    return _(this.selectedIssueLemmas).map(l => {
      return this.getLemmaById(l.lemma || undefined)
    }).compact().value()
  }

  get lemmas() {
    if (this.selectedLemmaListId !== null) {
      return this.getLemmasByList(this.selectedLemmaListId)
    } else if (this.selectedLemmaIssueId !== null) {
      return this.getLemmasByIssue(this.selectedLemmaIssueId)
    } else {
      return this._lemmas
    }
  }

  set lemmas(ls: LemmaRow[]) {
    this._lemmas = ls
    this.localDb.lemmas.clear().then(() => this.localDb.lemmas.bulkAdd(ls))
  }

}
