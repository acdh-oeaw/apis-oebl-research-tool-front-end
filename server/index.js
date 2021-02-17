const express = require('express')
const compression = require('compression')
const fs = require('fs')
const http = require('http')
const socketIo = require('socket.io')
const Emitter = require('events')
const emitter = new Emitter()
const app = express()
const port = process.env.NODE_PORT || process.env.PORT || 3333

const server = http.createServer(app)
const io = socketIo(server, {
  cors: true
})

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
  console.log('a user connected', socket.id)
  socket.send('message', 'yo')
  // when someone sends any message, send it to all others.
  socket.onAny((name, ...m) => {
    console.log(name, m)
    socket.broadcast.emit(name, ...m)
  })
  // TODO: this creates a memory leak.
  emitter.on('message', (m) => {
    socket.send(m)
  })
})

server.listen(port)
