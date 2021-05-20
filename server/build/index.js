"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const app = express_1.default();
const port = process.env.NODE_PORT || process.env.PORT || 3333;
const serviceSecret = 's49DsDzfeJRJDwuHyWu4aY13dZnEk43C';
const server = http_1.default.createServer(app);
// @ts-ignore: Unreachable code error
const io = socket_io_1.default(server, {
    cors: {
        origin: [
            'http://localhost:8080',
            'https://localhost:8080',
            'https://oebl-research.acdh-dev.oeaw.ac.at'
        ]
    }
});
const index = fs_1.default.readFileSync('./dist/index.html', { encoding: 'utf-8' });
app.enable('trust proxy');
app.use(cors_1.default());
app.use(compression_1.default());
app.use(body_parser_1.default.json({ limit: '100mb' }));
app.use(['/', '/css', '/img', '/js'], express_1.default.static('./dist'));
app.post('/message/import-issue-lemmas', (req, res) => {
    if (req.headers['x-secret'] === serviceSecret) {
        console.log('triggered importIssueLemmas', req.body);
        io.sockets.emit('importIssueLemmas', req.body);
        res.end();
    }
    else {
        res.status(402);
        res.end('out.');
    }
});
app.post('/message/import-lemmas', (req, res) => {
    if (req.headers['x-secret'] === serviceSecret) {
        console.log('triggered importLemmas', req.body);
        io.sockets.emit('importLemmas', req.body);
        res.end();
    }
    else {
        res.status(402);
        res.end('out.');
    }
});
app.get('/zotero/search/:query', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const x = yield (yield node_fetch_1.default('https://api.zotero.org/users/7926651/items?q=' + req.params.query, {
        headers: {
            'Zotero-API-Key': 'NXywXQ1UV28KbY9kpL7LoYn9'
        }
    })).json();
    res.send(JSON.stringify(x));
}));
app.get('/zotero/item/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const x = yield (yield node_fetch_1.default('https://api.zotero.org/users/7926651/items/' + req.params.id, {
        headers: {
            'Zotero-API-Key': 'NXywXQ1UV28KbY9kpL7LoYn9'
        }
    })).json();
    res.send(JSON.stringify(x));
}));
app.put('/zotero/item/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.body)
    const x = yield node_fetch_1.default('https://api.zotero.org/users/7926651/items/' + req.params.id, {
        method: 'PUT',
        body: JSON.stringify(req.body),
        headers: {
            'Zotero-API-Key': 'NXywXQ1UV28KbY9kpL7LoYn9'
        }
    });
    if (x.ok) {
        const t = yield x.json();
        console.log('response', t);
        res.send(t);
    }
    else {
        res.sendStatus(500);
    }
}));
app.use('*', (req, res) => res.send(index));
io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    socket.send('message', 'connected to socket server');
    // when someone sends any message, send it to all others.
    socket.onAny((name, ...m) => {
        console.log(name, m);
        socket.broadcast.emit(name, ...m);
    });
});
server.listen(port);
