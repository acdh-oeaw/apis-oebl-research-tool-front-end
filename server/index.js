const express = require('express')
const compression = require('compression')
const fs = require('fs')
const http = require('http')
const socketIo = require('socket.io')
const Emitter = require('events')
const app = express()
const port = process.env.NODE_PORT || process.env.PORT || 3333
const bodyParser = require('body-parser')

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

app.use(compression())
app.use(bodyParser.json({limit: '100mb'}))

app.use([ '/', '/css', '/img', '/js'], express.static('./dist'))

app.post('/message/import-lemmas', (req, res) => {
  if (req.headers['x-secret'] === 's49DsDzfeJRJDwuHyWu4aY13dZnEk43C') {
    console.log('triggered importLemmas', req.body)
    io.sockets.emit('importLemmas', req.body)
    res.end()
  } else {
    res.status(402)
    res.end('out.')
  }
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
