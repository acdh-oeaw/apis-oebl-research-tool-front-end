import Vue from 'vue'

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
import { request } from '@/api/core/request'

OpenAPI.BASE = process.env.VUE_APP_API_HOST || ''
OpenAPI.WITH_CREDENTIALS = true

// FIXME: use tokens
//OpenAPI.USERNAME = atob(localStorage.getItem('user') || '') || undefined
//OpenAPI.PASSWORD = atob(localStorage.getItem('pass') || '') || undefined
OpenAPI.TOKEN = localStorage.getItem('token') || '' || undefined

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
  showLemmaFilter: boolean
  issueViewOptions: {
    showBirthAndDeath: boolean
    showEditor: boolean
    showAuthor: boolean
    showLabels: number
  }
}

/**
 * In all stores, state variables that can only be
 * mutated by a class member but read by the public,
 * are prefix with an underscore and use a getter
 * (but no setter) for public read access.
 * */

class Store {

  public isLoggedIn = OpenAPI.TOKEN !== undefined

  /** This is where we put functions that we want to run after the login. */
  private loginCallbacks: (() => any)[] = []
  private _selectedIssueId = 1
  private _selectedBiographyId = 1
  public showSearchDialog = false
  /** Settings for the entire application */
  private _settings: Settings = {
    darkTheme: false,
    issueLayout: 'board',
    articleZoomFactor: 1,
    issueLemmaSearchItems: [],
    drawerRightWidth: 370,
    drawerLeftWidth: 370,
    showLemmaFilter: false,
    showNavDrawer: true,
    issueViewOptions: {
      showBirthAndDeath: true,
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
    // FIXME: use token
    try {
      // this is the only time we don’t use the auto generated API client to communicate with the back end.
      const me = await fetch(process.env.VUE_APP_API_HOST + '/auth/token/login', {
        method: 'POST',
        body: JSON.stringify({
          username: user,
          password: pwd
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
        .then(res => {
          localStorage.setItem('token', res.auth_token);
          OpenAPI.TOKEN = res.auth_token
          return true
        });
      if (me) {
        console.log('me.ok', me)
        console.log(this.loginCallbacks)
        await this.runCallbacks(this.loginCallbacks)
        this.loginCallbacks = []
        this.isLoggedIn = true
        return true
      } else {
        return false
      }
    } catch (e) {
      OpenAPI.TOKEN = undefined
      OpenAPI.USERNAME = undefined
      OpenAPI.PASSWORD = undefined
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('pass')
      return false
    }
  }

  async logOut() {
    localStorage.removeItem('user')
    localStorage.removeItem('pass')
    localStorage.removeItem('token')
    OpenAPI.USERNAME = undefined
    OpenAPI.PASSWORD = undefined
    OpenAPI.TOKEN = undefined
    this.isLoggedIn = false
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
