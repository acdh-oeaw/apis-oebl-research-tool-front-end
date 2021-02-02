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
