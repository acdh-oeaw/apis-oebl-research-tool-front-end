import { writeFile } from 'fs/promises'
import { join } from 'path'
import fetch from 'node-fetch'

console.assert(process.env.VUE_APP_API_HOST, 'Missing environment variable.')

const url = new URL('/apis/swagger/schema', process.env.VUE_APP_API_HOST)

const headers = {
  accept: 'application/json'
}

const outputFilePath = join(process.cwd(), 'api-spec.json')

fetch(url, { headers })
  .then(response => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return response
  })
  .then(response => {
    return response.text()
  })
  .then(text => {
    return writeFile(outputFilePath, text, { encoding: 'utf-8' })
  })
  .then(() => {
    console.info('✅ ', 'Successfully fetched API spec.')
  })
  .catch(() => {
    console.error('❌ ', 'Failed to fetch API spec.')
  })
