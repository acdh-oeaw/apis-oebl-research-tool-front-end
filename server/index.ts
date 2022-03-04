import * as express from 'express'
import * as compression from 'compression'
import * as fs from 'fs'
import * as http from 'http'
import * as socketIo from 'socket.io'
import fetch, { Headers } from 'node-fetch'
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
      'https://oebl-research.acdh-dev.oeaw.ac.at',
      'http://backend',
      'http://frontend:8080',
      'http://backend:8080',
      'http://127.0.0.1:8080'
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
  console.log('triggered import issue lemma before secret check')
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
  const x = await (await fetch('https://api.zotero.org/users/' + process.env.ZOTERO_USER + '/items?q=' + req.params.query, {
    headers: {
      'Zotero-API-Key': process.env.ZOTERO_API_KEY
    }
  })).json()
  res.send(JSON.stringify(x))
})

app.get('/zotero/item/:id', async (request, response) => {
  const zoteroHeaders = new Headers();
  zoteroHeaders.set('Zotero-API-Key', process.env.ZOTERO_API_KEY);
  zoteroHeaders.set('Zotero-Api-Version', '3');
  zoteroHeaders.set('Content-Type', 'application/json');

  if ('if-Modified-Since-Version' in request.headers) {
    zoteroHeaders.set('if-Modified-Since-Version', String(request.headers['if-Modified-Since-Version']) )
  }

  const zoteroResponse = await fetch(
      'https://api.zotero.org/users/' + process.env.ZOTERO_USER + '/items/' + request.params.id, 
      { headers: zoteroHeaders}
    );
  response.header['zoteroStatus'] = String(zoteroResponse.status);
  response.header['zoteroStatusText'] = zoteroResponse.statusText;
  
  let responseBody = null;
  if (zoteroResponse.status == 200) {
    responseBody = await zoteroResponse.json();
  }
  response.send(JSON.stringify(responseBody));
})

app.patch('/zotero/item/:id', async (req, res) => {
  console.log(req.body)
  const x = await fetch('https://api.zotero.org/users/' + process.env.ZOTERO_USER + '/items/' + req.params.id, {
    method: 'PATCH',
    body: JSON.stringify(req.body),
    headers: {
      'Zotero-API-Key': process.env.ZOTERO_API_KEY
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
  const x = await fetch('https://api.zotero.org/users/' + process.env.ZOTERO_USER + '/items/', {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: {
      'Zotero-API-Key': process.env.ZOTERO_API_KEY
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
