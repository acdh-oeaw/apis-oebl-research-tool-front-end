import * as express from 'express'
import * as compression from 'compression'
import * as fs from 'fs'
import * as http from 'http'
import * as socketIo from 'socket.io'
import fetch from 'node-fetch'
import * as cors from 'cors'
import zotero from './zotero'

const app = express()
const port = process.env.NODE_PORT || process.env.PORT || 3333

const serviceSecret = 's49DsDzfeJRJDwuHyWu4aY13dZnEk43C'

const server = http.createServer(app)
// @ts-ignore
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
app.use(express.json({limit: '100mb'}))

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
  res.send(JSON.stringify(x))
})

app.get('/zotero/item/:id', async (req, res) => {
  const x = await (await fetch('https://api.zotero.org/users/7926651/items/' + req.params.id, {
    headers: {
      'Zotero-API-Key': 'NXywXQ1UV28KbY9kpL7LoYn9'
    }
  })).json()
  res.send(JSON.stringify(x))
})

app.patch('/zotero/item/:id', async (req, res) => {
  console.log(req.body)
  const x = await fetch('https://api.zotero.org/users/7926651/items/' + req.params.id, {
    method: 'PATCH',
    body: JSON.stringify(req.body),
    headers: {
      'Zotero-API-Key': 'NXywXQ1UV28KbY9kpL7LoYn9'
    }
  })
  if (x.ok) {
    console.log({
      version: x.headers.get('Last-Modified-Version')
    })
    res.send(JSON.stringify({
      version: x.headers.get('Last-Modified-Version')
    }))
  } else {
    console.log('ERROR')
    console.log(await x.text())
    console.log({
      version: x.headers.get('Last-Modified-Version')
    })
    res.sendStatus(500)
  }
})

app.post('/zotero/item', async (req, res) => {
  console.log(req.body)
  const x = await fetch('https://api.zotero.org/users/7926651/items/', {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: {
      'Zotero-API-Key': 'NXywXQ1UV28KbY9kpL7LoYn9'
    }
  })
  if (x.ok) {
    res.send(JSON.stringify(await x.json()))
  } else {
    console.log(await x.text())
    res.sendStatus(500)
  }
})

app.get('/zotero/initial-data', async (req, res) => {
  const itemTypes = await zotero.getItemTypes()
  res.send(JSON.stringify({
    itemTypes,
    itemTypeFields: await zotero.getItemTypeFields(itemTypes),
    itemTypeCreators: await zotero.getItemTypeCreators(itemTypes)
  }))
})

app.use('*', (req, res) => res.send(index))

io.on('connection', (socket: any) => {
  console.log('a user connected', socket.id)
  socket.send('message', 'connected to socket server')
  // when someone sends any message, send it to all others.
  socket.onAny((name: string, ...m: any) => {
    console.log(name, m)
    socket.broadcast.emit(name, ...m)
  })
})

server.listen(port)
