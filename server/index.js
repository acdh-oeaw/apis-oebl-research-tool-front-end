const express = require('express')
const compression = require('compression')
const fs = require('fs')
const http = require('http')
const socketIo = require('socket.io')
const fetch = require('node-fetch')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const port = process.env.NODE_PORT || process.env.PORT || 3333

const serviceSecret = 's49DsDzfeJRJDwuHyWu4aY13dZnEk43C'

const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:8080',
      'https://localhost:8080',
      'https://oebl-research.acdh-dev.oeaw.ac.at'
    ]
  }
})

const index = fs.readFileSync('./dist/index.html', { encoding: 'utf-8' })
app.enable('trust proxy')
app.use(cors())
app.use(compression())
app.use(bodyParser.json({limit: '100mb'}))

app.use([ '/', '/css', '/img', '/js'], express.static('./dist'))

app.post('/message/import-issue-lemmas', (req, res) => {
  if (req.headers['x-secret'] === serviceSecret) {
    console.log('triggered importIssueLemmas', req.body)
    io.sockets.emit('importIssueLemmas', req.body)
    res.end()
  } else {
    res.status(402)
    res.end('out.')
  }
})

app.post('/message/import-lemmas', (req, res) => {
  if (req.headers['x-secret'] === serviceSecret) {
    console.log('triggered importLemmas', req.body)
    io.sockets.emit('importLemmas', req.body)
    res.end()
  } else {
    res.status(402)
    res.end('out.')
  }
})

app.get('/zotero/search/:query', async (req, res) => {
  const x = await (await fetch('https://api.zotero.org/users/7926651/items?q=' + req.params.query, {
    headers: {
      'Zotero-API-Key': 'NXywXQ1UV28KbY9kpL7LoYn9'
    }
  })).json()
  console.log(x)
  res.send(JSON.stringify(x))
})

app.use('*', (req, res) => res.send(index))

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)
  socket.send('message', 'connected to socket server')
  // when someone sends any message, send it to all others.
  socket.onAny((name, ...m) => {
    console.log(name, m)
    socket.broadcast.emit(name, ...m)
  })
})

server.listen(port)
