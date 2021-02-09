import store from '.'
import confirm from './confirm'

const fetchOriginal = fetch

export const requestState = {
  isLoading: false,
  hasErrored: false
}

function warnBeforeLeave(e: BeforeUnloadEvent): string {
  e.returnValue = ''
  return 'Synchronisierung läuft noch. Beim beending können Änderungen verloren gehen. Wirklich beenden?'
}

function isWriteCall(init?: RequestInit): boolean {
  return init !== undefined && init.method !== undefined && init.method.toLowerCase() !== 'get'
}

window.fetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  requestState.isLoading = true
  requestState.hasErrored = false
  if (isWriteCall(init)) {
    window.addEventListener('beforeunload', warnBeforeLeave)
  }
  const res = await fetchOriginal(input, init)
  window.removeEventListener('beforeunload', warnBeforeLeave)
  if (res.ok) {
    requestState.isLoading = false
    return res
  } else {
    requestState.isLoading = false
    if (res.status === 401) {
      console.log('Unauthorized Access. Waiting for log-in before continuing.')
      return new Promise((resolve, reject) => {
        store.onLoginSuccess(async () => {
          // recursion after login
          const res = await fetch(input, init)
          resolve(res)
        })
      })
    } else {
      requestState.hasErrored = true
      console.error(res)
      await confirm.confirm('Serverfehler. Details in der Console.', { showCancel: false })
      return res
    }
  }
}
