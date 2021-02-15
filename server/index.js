const express = require('express')
const compression = require('compression')
const fs = require('fs')
const http = require('http')
const socketIo = require('socket.io')
const Emitter = require('events')
const emitter = new Emitter()
const app = express()
const port = process.env.NODE_PORT || process.env.PORT || 3333

const websocket = socketIo({
  origins: process.env.ORIGINS,
  path: process.env.URL_PATH || '/updates'
})

const server = http.createServer(app)
const io = websocket.listen(server)

const index = fs.readFileSync('./dist/index.html', { encoding: 'utf-8' })
app.enable('trust proxy')
app.use(compression())

app.use([ '/', '/css', '/img', '/js'], express.static('./dist'))
app.use('*', (req, res) => res.send(index))

app.post('/message', (req, res) => {
  if (req.headers['x-secret'] === 'abc') {
    emitter.emit('message', JSON.parse(req.body))
  } else {
    res.status(402)
    res.send('out.')
  }
})

io.on('connection', (socket) => {
  console.log(socket)
  // when someone sends something, send it to all others.
  socket.on('message', (m) => {
    Object.values(socket.server.sockets.sockets).forEach((s) => {
      if (s.id !== socket.id) {
        s.send(m)
      }
    })
  })
  emitter.on('message', (m) => {
    socket.send(m)
  })
})

server.listen(port)
