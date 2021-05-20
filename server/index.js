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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var express_1 = require("express");
var compression_1 = require("compression");
var fs_1 = require("fs");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var node_fetch_1 = require("node-fetch");
var body_parser_1 = require("body-parser");
var cors_1 = require("cors");
var app = express_1["default"]();
var port = process.env.NODE_PORT || process.env.PORT || 3333;
var serviceSecret = 's49DsDzfeJRJDwuHyWu4aY13dZnEk43C';
var server = http_1["default"].createServer(app);
// @ts-ignore: Unreachable code error
var io = socket_io_1["default"](server, {
    cors: {
        origin: [
            'http://localhost:8080',
            'https://localhost:8080',
            'https://oebl-research.acdh-dev.oeaw.ac.at'
        ]
    }
});
var index = fs_1["default"].readFileSync('./dist/index.html', { encoding: 'utf-8' });
app.enable('trust proxy');
app.use(cors_1["default"]());
app.use(compression_1["default"]());
app.use(body_parser_1["default"].json({ limit: '100mb' }));
app.use(['/', '/css', '/img', '/js'], express_1["default"].static('./dist'));
app.post('/message/import-issue-lemmas', function (req, res) {
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
app.post('/message/import-lemmas', function (req, res) {
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
app.get('/zotero/search/:query', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var x;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, node_fetch_1["default"]('https://api.zotero.org/users/7926651/items?q=' + req.params.query, {
                    headers: {
                        'Zotero-API-Key': 'NXywXQ1UV28KbY9kpL7LoYn9'
                    }
                })];
            case 1: return [4 /*yield*/, (_a.sent()).json()];
            case 2:
                x = _a.sent();
                res.send(JSON.stringify(x));
                return [2 /*return*/];
        }
    });
}); });
app.get('/zotero/item/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var x;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, node_fetch_1["default"]('https://api.zotero.org/users/7926651/items/' + req.params.id, {
                    headers: {
                        'Zotero-API-Key': 'NXywXQ1UV28KbY9kpL7LoYn9'
                    }
                })];
            case 1: return [4 /*yield*/, (_a.sent()).json()];
            case 2:
                x = _a.sent();
                res.send(JSON.stringify(x));
                return [2 /*return*/];
        }
    });
}); });
app.put('/zotero/item/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var x, t;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, node_fetch_1["default"]('https://api.zotero.org/users/7926651/items/' + req.params.id, {
                    method: 'PUT',
                    body: JSON.stringify(req.body),
                    headers: {
                        'Zotero-API-Key': 'NXywXQ1UV28KbY9kpL7LoYn9'
                    }
                })];
            case 1:
                x = _a.sent();
                if (!x.ok) return [3 /*break*/, 3];
                return [4 /*yield*/, x.json()];
            case 2:
                t = _a.sent();
                console.log('response', t);
                res.send(t);
                return [3 /*break*/, 4];
            case 3:
                res.sendStatus(500);
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
app.use('*', function (req, res) { return res.send(index); });
io.on('connection', function (socket) {
    console.log('a user connected', socket.id);
    socket.send('message', 'connected to socket server');
    // when someone sends any message, send it to all others.
    socket.onAny(function (name) {
        var _a;
        var m = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            m[_i - 1] = arguments[_i];
        }
        console.log(name, m);
        (_a = socket.broadcast).emit.apply(_a, __spreadArrays([name], m));
    });
});
server.listen(port);
