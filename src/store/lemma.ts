/* eslint-disable @typescript-eslint/camelcase */
import _ from 'lodash'
import Dexie from 'dexie'
import * as jaroWinkler from 'jaro-winkler'
import { ResearchService, List as LemmaList, IssueLemma, List, Editor, GenderAe0Enum } from '@/api'
import notifyService from '@/service/notify/notify'
import { FullName, ImportablePerson, LemmaColumn, LemmaFilterComparator, LemmaFilterItem, LemmaRow, SecondaryCitation, ServerResearchLemma } from '@/types/lemma'
import { WithId } from '@/types'
import store from '.'
import { UserProfile } from './user'

interface LemmaFilter {
  id: string
  name: string
  filterItems: { [key: string]: string|boolean|null }
}

// if incremented, the local DBs will be wiped and repopulated from the server.
const currentDbVersion = '1.1'

class LemmaDatabase extends Dexie {
  public lemmas: Dexie.Table<LemmaRow, number>
  public constructor() {
    super('LemmaDb')
    this.version(5).stores({
      lemmas: 'id,firstName,lastName,gender,birthYear,deathYear,gnd,loc,viaf_id,selected'
    })
    this.lemmas = this.table('lemmas')
  }
}

export default class LemmaStore {

  private localDb = new LemmaDatabase()

  private _lemmas: LemmaRow[] = []
  private _lemmaLists: LemmaList[] = []
  private _columns: LemmaColumn[] = []

  private _selectedLemmaListId: null|number = null
  private _selectedLemmaFilterId: null|string = null
  private _selectedLemmaIssueId: null|number = null
  private _selectedLemmas: LemmaRow[] = []

  private _storedLemmaFilters: LemmaFilter[] = []

  public currentFilters: { [key: string]: string|boolean|null } = {}
  public importStatus = {

    target: 0,
    status: 0,

    incrementTarget(n: number) {
      this.target = this.target + n
    },

    incrementStatus(ls: LemmaRow[]) {
      const userLemmasCount = ls.filter(l => l.list !== undefined && l.list.editor === store.user.userProfile.userId).length
      this.status = this.status + userLemmasCount
      // reset if we’re finished
      if (this.target === this.status) {
        this.target = 0
        this.status = 0
      }
    },

    get progress() {
      return this.status / this.target
    },

    get isImporting() {
      return this.target !== 0 && !isNaN(this.progress) && this.progress !== 1
    }
  }

  public showSideBar = true
  public selectedIssueLemmas: WithId<IssueLemma>[] = []
  public newLemmasInUserList: { [listId: number]: { [lemmaId: number]: { editor: Editor, item: LemmaRow } } } = {}

  readonly comparators: LemmaFilterComparator[] = [
    {
      icon: '∈',
      name: 'enthält',
      value: 'contains',
      predicate: (e: string|number|null, q: string) => String(e).toLocaleLowerCase().indexOf(q) > -1
    },
    {
      name: 'enthält nicht',
      value: 'not-contains',
      icon: '∉',
      predicate: (e: string|number|null, q: string) => String(e).toLocaleLowerCase().indexOf(q) === -1
    },
    {
      name: 'ist',
      value: 'equals',
      icon: '=',
      predicate: (e: string|number|null, q: string|number|null) => String(e).toLocaleLowerCase() === String(q).toLocaleLowerCase()
    },
    {
      name: 'ist nicht',
      value: 'not',
      icon: '≠',
      predicate: (e: string|number|null, q: string|number|null) => String(e).toLocaleLowerCase() !== String(q).toLocaleLowerCase()
    },
    {
      name: 'ist vorhanden',
      value: 'exists',
      icon: '.',
      predicate: (e: string|number|null|number[], q: unknown) => e !== '' && e !== null && e !== undefined && e !== 'Not available' && e !== 'None' && (Array.isArray(e) ? e : []).length > 0
    },
    {
      name: 'ist nicht vorhanden',
      value: 'exists-not',
      icon: '.',
      predicate: (e: string|number|null|number[], q: unknown) => !e
    },
    {
      name: 'größer als',
      value: 'gt',
      icon: '>',
      predicate: (e: number, q: number) => e > q
    },
    {
      name: 'größer gleich',
      value: 'gte',
      icon: '≥',
      predicate: (e: number, q: number) => e >= q
    },
    {
      name: 'kleiner als',
      value: 'lt',
      icon: '<',
      predicate: (e: number, q: number) => e < q
    },
    {
      name: 'kleiner gleich',
      value: 'lte',
      icon: '≤',
      predicate: (e: number, q: number) => e <= q
    },
  ]

  public defaultColumns: LemmaColumn[] = [
    {
      name: 'Markiert',
      value: 'selected',
      type: 'boolean',
      filterable: true,
      show: true,
      width: 70,
      isUserColumn: false,
      editable: false
    },
    {
      name: 'Nachname',
      value: 'lastName',
      type: 'text',
      filterable: true,
      show: true,
      isUserColumn: false,
      editable: true
    },
    {
      name: 'Vorname',
      value: 'firstName',
      type: 'text',
      filterable: true,
      show: true,
      isUserColumn: false,
      editable: true
    },
    {
      name: 'Geschlecht',
      value: 'gender',
      type: 'text',
      filterable: true,
      show: true,
      isUserColumn: false,
      editable: true
    },
    {
      name: 'Geburtsjahr',
      value: 'birthYear',
      type: 'number',
      filterable: true,
      show: true,
      isUserColumn: false,
      editable: true
    },
    {
      name: 'Sterbejahr',
      value: 'deathYear',
      type: 'number',
      filterable: true,
      show: true,
      isUserColumn: false,
      editable: true
    },
    {
      name: 'GND',
      value: 'gnd',
      type: 'array',
      filterable: true,
      show: true,
      isUserColumn: false,
      editable: false
    },
    {
      name: 'Library of Congress',
      value: 'loc',
      type: 'link',
      filterable: true,
      show: true,
      isUserColumn: false,
      editable: false
    },
    {
      name: 'VIAF ID',
      value: 'viaf_id',
      type: 'link',
      filterable: true,
      show: true,
      isUserColumn: false,
      editable: false
    },
    {
      name: 'Wikipedia Edits',
      value: 'wiki_edits',
      type: 'number',
      filterable: true,
      show: true,
      isUserColumn: false,
      editable: false
    },
    {
      name: 'id',
      value: 'id',
      type: 'number',
      filterable: true,
      show: false,
      isUserColumn: false,
      editable: false
    }
  ]

  constructor() {
    this.initLemmaData()
    this.loadRemoteLemmaLists()
    this.listenForRemoteEvents()
  }

  doesUpdateDescribeListChange(ls: LemmaRow[], update: Partial<LemmaRow>): boolean {
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
          ll.editor.userId === u.userId
        )
      })
  }

  isMovementToUserList(ls: LemmaRow[], update: Partial<LemmaRow>): boolean {
    return (
      this.doesUpdateDescribeListChange(ls, update) &&
      this.getUserLists(this.lemmaLists, store.user.userProfile).some(ll => ll.id === update.list?.id)
    )
  }

  listenForRemoteEvents() {
    this.listenForRemoteLemmaUpdates()
    this.listenForRemoteListUpdates()
    this.listenForRemoteImports()
  }

  listenForRemoteListUpdates() {
    notifyService.on('deleteLemmaList', (l) => this.deleteLemmaListLocally(l.id!))
    notifyService.on('createLemmaList', (l) => this.addLemmaListLocally(l))
    notifyService.on('updateLemmaList', (l) => this.updateLemmaListLocally(l.id!, l))
  }

  listenForRemoteImports() {
    notifyService.on('importLemmas', (ls) => {
      console.log('importing lemmas', ls)
      // convert to local type
      const rows = ls.map(this.convertRemoteLemmaToLemmaRow)
      // insert the lemmas
      this.upsertLemmasLocally(rows)
      // update the status
      this.importStatus.incrementStatus(rows)
    })
  }

  listenForRemoteLemmaUpdates() {
    notifyService.on('updateLemmas', (ls, u, e) => {
      const updatedLemmas = this.updateLemmasLocally(ls, u)
      if (this.isMovementToUserList(ls, u)) {
        if (u.list?.id !== undefined) {
          const lemmasWithEditor = ls.map(l => ({ editor: e, item: l }))
          this.newLemmasInUserList[u.list?.id] = {
            ...this.newLemmasInUserList[u.list?.id],
            ..._.keyBy(lemmasWithEditor, e => e.item.id)
          }
        }
      }
    })
    notifyService.on('deleteLemmas', (ls) => this.deleteLemmasLocally(ls))
  }

  set lastLemmaFetchDate(d) {
    localStorage.setItem('lastLemmaFetchDate', JSON.stringify(d))
  }

  get lastLemmaFetchDate(): Date|null {
    const stored = JSON.parse(localStorage.getItem('lastLemmaFetchDate') || 'null')
    if (stored !== null) {
      return new Date(stored)
    } else {
      return null
    }
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
      notifyService.emit('updateLemmas', ls, { list }, store.user.userProfile)
      await Promise.all(ls.map(async (l) => {
        await ResearchService.researchApiV1LemmaresearchPartialUpdate(l.id, {
          // TODO: remove selected prop when it’s optional.
          selected: l.selected,
          list: {
            id: list.id,
            title: list.title
          }
        })
      }))
    }
  }

  private async upsertLemmasLocally(ls: LemmaRow[]) {
    this._lemmas = _.uniqBy(ls.concat(this._lemmas), 'id')
    await this.localDb.lemmas.bulkPut(ls)
  }

  private async updateLemmasLocally(ls: LemmaRow[], u: Partial<LemmaRow>): Promise<LemmaRow[]> {
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
    await this.localDb.lemmas.bulkPut(updatedLemmas)
    return updatedLemmas
  }

  async updateLemmas(ls: LemmaRow[], u: Partial<LemmaRow>) {
    // optimistic update
    await this.updateLemmasLocally(ls, u)
    // actual update on the server
    await Promise.all(ls.map(async (l) => {
      await ResearchService.researchApiV1LemmaresearchPartialUpdate(l.id, {
        // TODO: remove selected prop when it’s optional.
        // https://github.com/ferdikoomen/openapi-typescript-codegen/issues/636
        selected: l.selected,
        ...u
      })
    }))
    // notify others
    notifyService.emit('updateLemmas', ls, u, store.user.userProfile)
  }

  private deleteLemmaListLocally(id: number) {
    this.lemmaLists = this.lemmaLists.filter(ll => ll.id !== id)
  }

  async deleteLemmaList(id: number) {
    const list = this.lemmaLists.find(ll => ll.id === id)
    this.deleteLemmaListLocally(id)
    this.selectedLemmaListId = null
    await ResearchService.researchApiV1ListresearchDestroy(id)
    if (list !== undefined) {
      notifyService.emit('deleteLemmaList', list)
    }
    await this.loadRemoteLemmaLists()
  }

  async addLemma(l: LemmaRow, listId: number) {
    await ResearchService.researchApiV1LemmaresearchCreate(({
      listId,
      lemmas: [ {
        ...l,
        dateOfBirth: l.birthYear || undefined,
        dateOfDeath: l.deathYear || undefined,
        firstName: l.firstName || undefined,
        lastName: l.lastName || undefined,
        selected: false,
        gnd: l.gnd,
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
        isUserColumn: true,
        editable: true
      }
    })
    return uc
  }

  async initLemmaData() {
    this._lemmas = await this.getLocalLemmaCache()
    const fetchUpdatesFrom = _.clone(this.lastLemmaFetchDate)
    this.lastLemmaFetchDate = new Date()
    await this.getAndApplyRemoteLemmas(fetchUpdatesFrom)
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

  getListById(id: number) {
    return this.lemmaLists.find(i => i.id === id)
  }

  async getLocalLemmaCache() {
    console.time('local cache')
    const x = await this.localDb.lemmas.toArray()
    console.timeEnd('local cache')
    return x
  }

  private async deleteLemmasLocally(ids: number[]) {
    console.log('lemmas to delete:', ids)
    this._lemmas = this._lemmas.filter(l => ids.indexOf(l.id) === -1)
    await this.localDb.lemmas.bulkDelete(ids)
  }

  async deleteLemma(ids: number[]) {
    await this.deleteLemmasLocally(ids)
    await Promise.all(ids.map(id => ResearchService.researchApiV1LemmaresearchDestroy(id)))
    notifyService.emit('deleteLemmas', ids)
  }

  fakeLemma(seed: number): LemmaRow {
    const gnds = _.range(0, _.random(0, 3)).map(() => _.random(100000001, 993183199, false).toString())
    const bYear = _.random(1890, 1990, false)
    return {
      id: seed,
      selected: _.random(0, 1, true) >= 0.95, // 5 percent should be selected
      firstName: 'testname', // random_name({ first: true, seed }),
      lastName: 'random_name', // ({ last: true, seed }),
      alternativeNames: [],
      birthYear: bYear.toString(),
      deathYear: _.random(bYear, 2000, false).toString(),
      gender: undefined,
      gnd: gnds,
      columns_user: {},
      list: undefined,
      loc: gnds.length > 0 ? _.random(2313882, 9931831, false) : null,
      // eslint-disable-next-line @typescript-eslint/camelcase
      viaf_id: gnds.length > 0 ? _.random(2313882, 9931831, false) : null,
      // eslint-disable-next-line @typescript-eslint/camelcase
      wiki_edits: gnds.length > 0 ? _.random(0, 651, false) : null,
      legacyGideonCitations: [{id: 0, value: 'First book'}, {id: 0, value: 'Second book'}],
      secondaryLiterature: [{id: 0, title: 'Another book', pages: '-15 - 8'}, {id: 0, title: 'Still another book', pages: '2.7182 - 3.1415'}],
      zoteroKeysBy: [],
      zoteroKeysAbout: [],
    }
  }

  async importLemmas(ls: ImportablePerson[], listName: string) {
    // create list
    const list = await (async () => {
      return this.createList(listName)
    })()
    // trigger import to list
    await ResearchService.researchApiV1LemmaresearchCreate(({
      listId: list.id!,
      lemmas: ls.map(l => ({
        ...l,
        firstName: l.firstName || undefined,
        lastName: l.lastName || undefined,
        dateOfBirth: l.dateOfBirth || undefined,
        dateOfDeath: l.dateOfDeath || undefined,
        selected: false,
        gnd: l.gnd
      }))
    }))
    // register the lemmas that we’re waiting for
    this.importStatus.incrementTarget(ls.length)
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
      alternativeNames: rs.alternativeNames as FullName[],
      gender: rs.gender as GenderAe0Enum,
      dateOfBirth: rs.dateOfBirth,
      dateOfDeath: rs.dateOfDeath,
      updated: rs.last_updated,
      gnd: rs.gnd !== undefined ? rs.gnd.filter(g => g !== 'None') : [],
      columns_user: rs.columns_user,
      columns_scrape: rs.columns_scrape,
      // TODO: yuck.
      list: rs.list ? {
        id: rs.list.id,
        title: rs.list.title,
        editor: rs.list.editor || undefined
      } : undefined,
      legacyGideonCitations: rs.gideonLegacyLiterature as Array<{id: number, value: string}> | null,
      secondaryLiterature: rs.secondaryLiterature as SecondaryCitation[],
      zoteroKeysBy: rs.zoteroKeysBy as string[],
      zoteroKeysAbout: rs.zoteroKeysAbout as string[],
    }
  }

  async getLemmasIncrementally(
    deleted: boolean|undefined,
    modifiedAfter: string|undefined,
    chunkSize: number,
    onProgress?: (ls: LemmaRow[]) => any
  ): Promise<LemmaRow[]> {
    // get the first page
    const deletedParam = deleted !== undefined ? deleted.toString() : undefined
    const firstRes = await ResearchService.researchApiV1LemmaresearchList(
      deletedParam,
      chunkSize,
      modifiedAfter
    )
    // call progress handler if available
    if (onProgress !== undefined) {
      await onProgress((firstRes.results as ServerResearchLemma[] || []).map(this.convertRemoteLemmaToLemmaRow))
    }
    // if there’s more than on page: loop from second page until we have all items and return
    if (firstRes.count !== undefined && firstRes.count > chunkSize) {
      const chunks = Math.ceil(firstRes.count / chunkSize)
      let lemmaAgg: LemmaRow[] = []
      for (let i = 1; i < chunks; i++) {
        const res = (await ResearchService.researchApiV1LemmaresearchList(
          deletedParam,
          chunkSize,
          modifiedAfter, i * chunkSize
        )).results as ServerResearchLemma[] || []
        const converted = res.map(this.convertRemoteLemmaToLemmaRow)
        if (onProgress !== undefined) {
          await onProgress(converted)
        }
        lemmaAgg = lemmaAgg.concat(converted)
      }
      return lemmaAgg
    // if there’s only one page: return
    } else {
      return (firstRes.results as ServerResearchLemma[] || []).map(this.convertRemoteLemmaToLemmaRow)
    }
  }

  shouldClearDb() {
    const dbVersionLocal = localStorage.getItem('currentDbVersion')
    if (currentDbVersion !== dbVersionLocal) {
      localStorage.setItem('currentDbVersion', currentDbVersion)
      return true
    } else {
      return false
    }
  }

  async getAndApplyRemoteLemmas(modifiedAfter: Date|null = null): Promise<void> {
    const currentLemmasLength = (await this.localDb.lemmas.count())
    // there are no lemmas, or no last modified date,
    // or the DB must be cleared => get all lemmas
    if (
      modifiedAfter === null ||
      currentLemmasLength === 0 ||
      this.shouldClearDb()
    ) {
      this._lemmas = []
      await this.localDb.lemmas.clear()
      this.getLemmasIncrementally(false, undefined, 100, async (ls) => {
        await this.upsertLemmasLocally(ls)
      })
    // just get the updates since last time
    } else {
      const upserted = await this.getLemmasIncrementally(false, modifiedAfter.toISOString(), 100)
      const deleted = await this.getLemmasIncrementally(true, modifiedAfter.toISOString(), 100)
      console.log({upserted, deleted})
      await this.deleteLemmasLocally(deleted.map(l => l.id!))
      await this.upsertLemmasLocally(upserted)
    }
  }

  private updateLemmaListLocally(id: number, l: Partial<LemmaList>) {
    this._lemmaLists = this._lemmaLists.map(l2 => {
      return id === l2.id ? {...l2, ...l} : l2
    })
  }

  async updateList(id: number, l: Partial<LemmaList>) {
    this.updateLemmaListLocally(id, l)
    const newList = await ResearchService.researchApiV1ListresearchPartialUpdate(id, l)
    notifyService.emit('updateLemmaList', newList)
  }

  private addLemmaListLocally(l: LemmaList) {
    this.lemmaLists = [ ...this.lemmaLists, l ]
  }

  async createList(title: string) {
    const s = await ResearchService.researchApiV1ListresearchCreate({ title })
    this.addLemmaListLocally(s)
    notifyService.emit('createLemmaList', s)
    return s
  }

  getLemmaById(id?: number) {
    return id === undefined ? undefined : this._lemmas.find(l => l.id === id)
  }

  getLemmasByList(listId: number) {
    return this._lemmas.filter(l => l.list?.id === listId)
  }

  setFilter(columnQueries: { [key: string]: string|boolean|null } = {}) {
    this.currentFilters = { ...columnQueries }
  }

  filterLemmas(ls: LemmaRow[], fs = this.currentFilters): LemmaRow[] {
    return ls.filter(l => {
      return _(fs).every((value, name) => {
        const v = String(value).toLocaleLowerCase()
        return (
          (l[name] !== undefined && String(l[name]).toLocaleLowerCase().indexOf(v) > -1) ||
          (l.columns_user[name] !== undefined && String(l.columns_user[name]).toLocaleLowerCase().indexOf(v) > -1)
        )
      })
    })
  }

  get lemmas() {
    console.log('trigger lemma getter')
    const ls = this.selectedLemmaListId !== null ? this.getLemmasByList(this.selectedLemmaListId) : this._lemmas
    return this.filterLemmas(ls, this.currentFilters)
  }

  set lemmas(ls: LemmaRow[]) {
    this._lemmas = ls
  }

  get allLemmas() {
    return this._lemmas
  }

}
