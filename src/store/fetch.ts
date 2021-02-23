import store from '.'
import confirm from './confirm'
import { OpenAPI } from '@/api'
import _ from 'lodash'
const fetchOriginal = fetch

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
    return 'Synchronisierung läuft noch. Beim beending können Änderungen verloren gehen. Wirklich beenden?'
  }
}

function isHttpWriteCall(init?: RequestInit): boolean {
  return init !== undefined && init.method !== undefined && init.method.toLowerCase() !== 'get'
}

window.addEventListener('beforeunload', warnBeforeLeave)

window.fetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  requestState.hasErrored = false
  const isWriteCall = isHttpWriteCall(init)
  if (isWriteCall) {
    requestState.writeCallsRunning = requestState.writeCallsRunning + 1
  }
  requestState.allCallsRunning = requestState.allCallsRunning + 1
  const res = await fetchOriginal(input, init)
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
        return new Promise((resolve, reject) => {
          store.onLoginSuccess(async () => {
            // recursion after login
            const res = await fetch(input, init)
            resolve(res)
          })
        })
      // a normal error: alert user.
      } else {
        requestState.hasErrored = true
        console.error(res)
        await confirm.confirm('Serverfehler. Details in der Console.', { showCancel: false })
        return res
      }
    // it’s a request to somewhere else
    } else {
      console.error(res)
      return res
    }
  }
}
