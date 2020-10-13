const express = require('express')
const compression = require('compression')
const app = express()
const port = process.env.NODE_PORT || 3333
app.enable('trust proxy')
app.use(compression())
app.use('/', express.static('./dist'))

app.listen(port, () => {
  console.log(`Started server on port ${ port }`)
})
