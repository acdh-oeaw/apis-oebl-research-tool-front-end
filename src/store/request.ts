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
  try {
    const res = await fetchOriginal(input, init)
    requestState.isLoading = false
    return res
  } catch (e) {
    requestState.hasErrored = true
    if (e.message === 'Unauthorized') {
      console.log('Unauthorized Access. Waiting for log-in before continuing.')
      return new Promise((resolve, reject) => {
        store.onLoginSuccess(async () => {
          // recursion after login
          const res = await fetch(input, init)
          resolve(res)
        })
      })
    } else {
      console.error(e)
      await confirm.confirm('Serverfehler. Details in der Console.', { showCancel: false })
      return e
    }
  }
}
