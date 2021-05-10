import Vue from 'vue'
import './fetch'

import IssueStore from './issue'
import AuthorStore from './author'
import EditorStore from './editor'
import LemmaStore from './lemma'
import LabelStore from './label'
import UserStore from './user'
import SearchStore from './search'
import ArticleStore from './article'

import { OpenAPI } from '../api'
import { LemmaFilterItem } from '@/types/lemma'

OpenAPI.BASE = process.env.VUE_APP_API_HOST || ''
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

interface Settings {
  darkTheme: boolean
  issueLayout: 'board'|'list'
  issueLemmaSearchItems: any[]
  drawerRightWidth: number
  drawerLeftWidth: number
  showNavDrawer: boolean
  articleZoomFactor: number
  issueViewOptions: {
    showBirthAndDeath: boolean
    showEditor: boolean
    showAuthor: boolean
    showLabels: number
  }
}

class Store {

  public isLoggedIn = OpenAPI.USERNAME !== undefined
  public loginCallbacks: (() => any)[] = []

  private _selectedIssueId = 1
  private _selectedBiographyId = 1
  private _settings: Settings = {
    darkTheme: false,
    issueLayout: 'board',
    articleZoomFactor: 1,
    issueLemmaSearchItems: [],
    drawerRightWidth: 370,
    drawerLeftWidth: 370,
    showNavDrawer: true,
    issueViewOptions: {
      showBirthAndDeath: true,
      showEditor: true,
      showAuthor: true,
      showLabels: 3
    }
  }

  public showSearchDialog = false

  public onLoginSuccess(cb: () => any) {
    this.loginCallbacks.push(cb)
  }

  private async runCallbacks(cbs: (() => unknown)[]) {
    for (const cb of cbs) {
      await cb()
    }
  }

  async logIn(user: string, pwd: string): Promise<boolean> {
    // FIXME: use token
    localStorage.setItem('user', btoa(user))
    localStorage.setItem('pass', btoa(pwd))
    OpenAPI.USERNAME = user
    OpenAPI.PASSWORD = pwd
    console.log(OpenAPI)
    try {
      await this.runCallbacks(this.loginCallbacks)
      this.loginCallbacks = []
      this.isLoggedIn = true
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

  get selectedBiography() {
    return this._selectedBiographyId
  }

  user = new UserStore()
  lemma = new LemmaStore()
  editors = new EditorStore()
  search = new SearchStore()
  issue = new IssueStore(this.selectedIssue)
  authors = new AuthorStore()
  labels = new LabelStore()
  article = new ArticleStore(null)
}

export default Vue.observable(new Store())
