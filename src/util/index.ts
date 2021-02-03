export async function fileToArrayBuffer(f: File): Promise<ArrayBuffer> {
  if (f.arrayBuffer !== undefined) {
    return await f.arrayBuffer()
  } else {
    return new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.readAsArrayBuffer(f)
      fr.addEventListener('loadend', () => {
        if (fr.result instanceof ArrayBuffer) {
          resolve(fr.result)
        } else {
          reject(new Error('can’t decode file'))
        }
      })
      fr.addEventListener('error', () => reject(new Error('can’t decode file')))
    })
  }
}

export function maybeParseDate(s: string): Date|null {
  return typeof s === 'string' && isNaN(Number(s)) && !isNaN(Date.parse(s)) ? new Date(s) : null
}

export function isValidHttpUrl(string: string): boolean {
  let url
  try {
    url = new URL(string)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}
