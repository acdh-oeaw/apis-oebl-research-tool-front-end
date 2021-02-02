import Vue from 'vue'

import IssueStore from './issue'
import AuthorStore from './author'
import EditorStore from './editor'
import LemmaStore from './lemma'
import LabelStore from './label'

import { IssueLemma, Lemma, OpenAPI } from '../api'
import { LemmaFilterItem } from '@/types/lemma'

OpenAPI.BASE = 'https://acdh-oeaw-oebl-oebl-irs-devops.10.3.6.53.nip.io'
OpenAPI.WITH_CREDENTIALS = true

// FIXME: use tokens
OpenAPI.USERNAME = atob(localStorage.getItem('user') || '') || undefined
OpenAPI.PASSWORD = atob(localStorage.getItem('pass') || '') || undefined
// OpenAPI.TOKEN = 'e601dc755e635fd6e9ec38eabc2a059ed898d75d'

export interface StoredLemmaFilter {
  name: string,
  id: string,
  filterItems: LemmaFilterItem[]
}

export interface StoredLemmaList {
  name: string,
  id: string,
  items: number[]
}

interface Settings {
  darkTheme: boolean
  issueLayout: 'board'|'list'
  issueLemmaSearchItems: any[]
  selectedIssueLemma: IssueLemma|null
  drawerRightWidth: number
  drawerLeftWidth: number
  storedLemmaFilters: StoredLemmaFilter[]
  storedLemmaLists: StoredLemmaList[]
  selectedLemmaFilter: string
  lemmaManagerNavVisible: boolean
  issueManagerNavVisible: boolean
  issueViewOptions: {
    showDescription: boolean
    showEditor: boolean
    showAuthor: boolean
    showLabels: number
  }
}

class Store {

  public isLoggedIn = OpenAPI.USERNAME !== undefined
  public loginCallbacks: (() => any)[] = []

  private _selectedIssueId = 1
  private _selectedLemmaListId = 1
  private _selectedBiographyId = 1
  private _isLoading = false
  private _settings: Settings = {
    darkTheme: false,
    issueLayout: 'board',
    issueLemmaSearchItems: [],
    selectedIssueLemma: null,
    drawerRightWidth: 370,
    drawerLeftWidth: 370,
    storedLemmaFilters: [],
    selectedLemmaFilter: '-1',
    storedLemmaLists: [],
    lemmaManagerNavVisible: true,
    issueManagerNavVisible: false,
    issueViewOptions: {
      showDescription: true,
      showEditor: true,
      showAuthor: true,
      showLabels: 3
    }
  }

  public onLoginSuccess(cb: () => any) {
    this.loginCallbacks.push(cb)
  }

  private async runCallbacks(cbs: (() => unknown)[]) {
    for (const cb of cbs) {
      await cb()
    }
  }

  async logIn(user: string, pwd: string): Promise<boolean> {
    OpenAPI.USERNAME = user
    OpenAPI.PASSWORD = pwd
    try {
      await this.runCallbacks(this.loginCallbacks)
      this.loginCallbacks = []
      this.isLoggedIn = true
      // FIXME: use token
      localStorage.setItem('user', btoa(user))
      localStorage.setItem('pass', btoa(pwd))
      return true
    } catch (e) {
      return false
    }
  }

  get settings(): Settings {
    return { ...this._settings, ...JSON.parse(localStorage.getItem('settings') || '{}') }
  }

  set settings(s: Settings) {
    console.log('update settings')
    this._settings = s
    localStorage.setItem('settings', JSON.stringify(s))
  }

  get selectedIssue() {
    return this._selectedIssueId
  }

  get selectedLemmaList() {
    return this._selectedLemmaListId
  }

  get selectedBiography() {
    return this._selectedBiographyId
  }

  get isLoading() {
    return this._isLoading
  }

  set isLoading(b: boolean) {
    this._isLoading = b
  }

  editors = new EditorStore()
  lemma = new LemmaStore()
  issue = new IssueStore(this.selectedIssue)
  authors = new AuthorStore()
  labels = new LabelStore()
}

export default Vue.observable(new Store())
