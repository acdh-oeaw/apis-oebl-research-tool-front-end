const express = require('express')
const compression = require('compression')
const fs = require('fs')

const app = express()
const port = process.env.NODE_PORT || process.env.PORT || 3333

const index = fs.readFileSync('./dist/index.html', { encoding: 'utf-8' })
app.enable('trust proxy')
app.use(compression())

app.use([ '/', '/css', '/img', '/js'], express.static('./dist'))
app.use('*', (req, res) => res.send(index))

app.listen(port, () => {
  console.log(`Started server on port ${ port }`)
})
