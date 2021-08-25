// this script removes unwanted imports from the auto generated open api file.
// we need it because the APIs schema is huge, and seems to blow up Webpack 5 (OOM error).

import fs from 'fs'

const allowedServices = process.argv.slice(2)
const path = './src/api/index.ts'
const serviceRegEx = /export \{ ((.)+Service) \} .+;/

const f = fs.readFileSync(path)
const lines = f.toString().split('\n')
console.log('allowedServices:', allowedServices)
const newLines = lines.map(l => {
  const matches = serviceRegEx.exec(l)
  if (matches !== null && !allowedServices.includes(matches[1].trim())) {
    // remove/comment out
    return '// ' + l
  } else {
    // leave in
    return l
  }
})
fs.writeFileSync(path, newLines.join('\n'))
