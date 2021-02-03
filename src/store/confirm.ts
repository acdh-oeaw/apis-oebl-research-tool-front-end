import Vue from 'vue'

interface ConfirmOptions {
  abortText?: string
  confirmText?: string
  showCancel?: boolean
}

export const bus = new Vue()

class ConfirmStore {

  private defaultMessage = 'Sicher?'
  private defaultAbortText = 'abbrechen'
  private defaultConfirmText = 'OK'
  private defaultShowCancel = true

  show = false
  message = this.defaultMessage
  abortText = this.defaultAbortText
  confirmText = this.defaultConfirmText
  showCancel = this.defaultShowCancel

  async confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
    this.message = message || this.defaultMessage
    this.show = true
    this.abortText = options?.abortText || this.defaultAbortText
    this.confirmText = options?.confirmText || this.defaultConfirmText
    this.showCancel = options?.showCancel || this.defaultShowCancel
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    return new Promise((resolve) => {
      window.addEventListener('keyup', function onEscOrEnter(e) {
        if (e.key === 'Enter') {
          that.show = false
          window.removeEventListener('keyup', onEscOrEnter)
          resolve(true)
        }
        if (e.key === 'Escape') {
          that.show = false
          window.removeEventListener('keyup', onEscOrEnter)
          resolve(false)
        }
      })
      bus.$on('confirm', () => {
        this.show = false
        resolve(true)
      })
      bus.$on('abort', () => {
        this.show = false
        resolve(false)
      })
    })
  }
}

export default Vue.observable(new ConfirmStore())
