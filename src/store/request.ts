import store from '.'
import confirm from './confirm'

const fetchOriginal = fetch

export const requestState = {
  isLoading: false,
  hasErrored: false
}

window.fetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  requestState.isLoading = true
  requestState.hasErrored = false
  const res = await fetchOriginal(input, init)
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
