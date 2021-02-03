import store from '.'
import confirm from './confirm'

export default async function request<T, A>(func: (...args: A[]) => Promise<T>, ...args: A[]): Promise<T> {
  console.log('request args', func.name, args)
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    let res
    try {
      if (store) {
        store.isLoading = true
      }
      res = await func(...args)
      if (store) {
        store.isLoading = false
      }
      resolve(res)
    } catch (e) {
      if (e.message === 'Unauthorized') {
        console.log('Unauthorized Access. Waiting for log-in before continuing.')
        store.onLoginSuccess(async () => {
          const x = await request(func, ...args)
          resolve(x)
        })
      } else {
        await confirm.confirm('Serverfehler. Details in der Console.', { showCancel: false })
        console.error(e)
        if (store) {
          store.isLoading = false
        }
        reject(e)
      }
    }
  })
}
