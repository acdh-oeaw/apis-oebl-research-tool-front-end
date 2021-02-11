import store from '.'
import confirm from './confirm'
import { OpenAPI } from '@/api'
const fetchOriginal = fetch

export const requestState = {
  isLoading: false,
  hasErrored: false
}

function warnBeforeLeave(e: BeforeUnloadEvent): string {
  e.returnValue = ''
  return 'Synchronisierung läuft noch. Beim beending können Änderungen verloren gehen. Wirklich beenden?'
}

function isHttpWriteCall(init?: RequestInit): boolean {
  return init !== undefined && init.method !== undefined && init.method.toLowerCase() !== 'get'
}

window.fetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  requestState.isLoading = true
  requestState.hasErrored = false
  const isWriteCall = isHttpWriteCall(init)
  if (isWriteCall) {
    window.addEventListener('beforeunload', warnBeforeLeave)
  }
  const res = await fetchOriginal(input, init)
  if (isWriteCall) {
    window.removeEventListener('beforeunload', warnBeforeLeave)
  }
  if (res.ok) {
    // success
    requestState.isLoading = false
    return res
  } else {
    // error
    requestState.isLoading = false
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
