import store from '.'
import confirm from './confirm'
import { OpenAPI } from '@/api'
import _ from 'lodash'

export const unpatchedFetch = fetch

export const requestState = {
  writeCallsRunning: 0,
  allCallsRunning: 0,
  get isLoading() {
    return this.writeCallsRunning > 0 || this.allCallsRunning > 0
  },
  hasErrored: false
}

function warnBeforeLeave(e: BeforeUnloadEvent): string|undefined {
  if (requestState.writeCallsRunning > 0) {
    e.returnValue = ''
    return 'Synchronisierung läuft noch. Beim Beenden können Änderungen verloren gehen. Wirklich beenden?'
  }
}

function isHttpWriteCall(init?: RequestInit): boolean {
  return init !== undefined && init.method !== undefined && init.method.toLowerCase() !== 'get'
}

window.addEventListener('beforeunload', warnBeforeLeave)

export const patchedFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  requestState.hasErrored = false
  const isWriteCall = isHttpWriteCall(init)
  if (isWriteCall) {
    requestState.writeCallsRunning = requestState.writeCallsRunning + 1
  }
  requestState.allCallsRunning = requestState.allCallsRunning + 1
  const res = await unpatchedFetch(input, init)
  if (isWriteCall) {
    requestState.writeCallsRunning = requestState.writeCallsRunning - 1
  }
  requestState.allCallsRunning = requestState.allCallsRunning - 1
  if (res.ok) {
    // success
    return res
  } else {
    // error
    // if it was a request to our api
    if (res.url.includes(OpenAPI.BASE)) {
      // not logged in: show login prompt and queue promise.
      if (res.status === 401) {
        console.log('Unauthorized Access. Waiting for log-in before continuing.')
        store.isLoggedIn = false
        return new Promise((resolve, reject) => {
          store.onLoginSuccess(async () => {
            // recursion after login
            const res = await fetch(input, {
              ...init,
              headers: {
                ...init?.headers,
                authorization: `Basic ${ btoa(OpenAPI.USERNAME + ':' + OpenAPI.PASSWORD) }`
              }
            })
            resolve(res)
          })
        })
      // a normal error: alert user.
      } else {
        requestState.hasErrored = true
        console.error(res)
        await confirm.confirm('Serverfehler. Details in der Console.', { showCancel: false, icon: 'mdi-error' })
        return res
      }
    // it’s a request to somewhere else
    } else {
      console.error(res)
      return res
    }
  }
}

window.fetch = patchedFetch
