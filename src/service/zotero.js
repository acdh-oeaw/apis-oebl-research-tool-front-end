'use strict'
const __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value) }) }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)) } catch (e) { reject(e) } }
    function rejected(value) { try { step(generator.throw(value)) } catch (e) { reject(e) } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected) }
    step((generator = generator.apply(thisArg, _arguments || [])).next())
  })
}
const __generator = (this && this.__generator) || function (thisArg, body) {
  let _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1] }, trys: [], ops: [] }; let f; let y; let t; let g
  return g = { next: verb(0), throw: verb(1), return: verb(2) }, typeof Symbol === 'function' && (g[Symbol.iterator] = function() { return this }), g
  function verb(n) { return function (v) { return step([n, v]) } }
  function step(op) {
    if (f) throw new TypeError('Generator is already executing.')
    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t
        if (y = 0, t) op = [op[0] & 2, t.value]
        switch (op[0]) {
          case 0: case 1: t = op; break
          case 4: _.label++; return { value: op[1], done: false }
          case 5: _.label++; y = op[1]; op = [0]; continue
          case 7: op = _.ops.pop(); _.trys.pop(); continue
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break }
            if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break }
            if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break }
            if (t[2]) _.ops.pop()
            _.trys.pop(); continue
        }
        op = body.call(thisArg, _)
      } catch (e) { op = [6, e]; y = 0 } finally { f = t = 0 }
    }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true }
  }
}
exports.__esModule = true
const node_fetch_1 = require('node-fetch')
const ZoteroStore = /** @class */ (function () {
  function ZoteroStore() {
    this.itemTypes = []
    this.itemTypeFields = {}
    this.itemTypeCreators = {}
    this.init()
  }
  ZoteroStore.prototype.init = function () {
    return __awaiter(this, void 0, void 0, function () {
      let initialData
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0: return [4 /* yield */, this.getInitialData()]
          case 1:
            initialData = _a.sent()
            this.itemTypes = initialData.itemTypes
            this.itemTypeFields = initialData.itemTypeFields
            this.itemTypeCreators = initialData.itemTypeCreators
            console.log(this)
            return [2 /* return */]
        }
      })
    })
  }
  ZoteroStore.prototype.getInitialData = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0: return [4 /* yield */, node_fetch_1.default(process.env.VUE_APP_WEBAPP_HOST + '/zotero/initial-data')]
          case 1: return [2 /* return */, (_a.sent()).json()]
        }
      })
    })
  }
  ZoteroStore.prototype.createItem = function (i) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0: return [4 /* yield */, node_fetch_1.default(process.env.VUE_APP_WEBAPP_HOST + '/zotero/item', {
            method: 'POST',
            body: JSON.stringify([i]),
            headers: {
              'Content-Type': 'application/json'
            }
          })]
          case 1: return [4 /* yield */, (_a.sent()).json()]
          case 2: return [2 /* return */, _a.sent()]
        }
      })
    })
  }
  ZoteroStore.prototype.searchItem = function (q) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0: return [4 /* yield */, node_fetch_1.default(process.env.VUE_APP_WEBAPP_HOST + '/zotero/search/' + q)]
          case 1: return [4 /* yield */, (_a.sent()).json()]
          case 2: return [2 /* return */, _a.sent()]
        }
      })
    })
  }
  ZoteroStore.prototype.getItem = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0: return [4 /* yield */, node_fetch_1.default(process.env.VUE_APP_WEBAPP_HOST + '/zotero/item/' + key)]
          case 1: return [4 /* yield */, (_a.sent()).json()]
          case 2: return [2 /* return */, _a.sent()]
        }
      })
    })
  }
  ZoteroStore.prototype.updateTitle = function (key, t) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0: return [4 /* yield */, node_fetch_1.default(process.env.VUE_APP_WEBAPP_HOST + '/zotero/item/' + key, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(t)
          })]
          case 1: return [4 /* yield */, (_a.sent()).json()]
          case 2: return [2 /* return */, _a.sent()]
        }
      })
    })
  }
  ZoteroStore.prototype.getItemTemplate = function (itemType) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0: return [4 /* yield */, (node_fetch_1.default('https://api.zotero.org/items/new?itemType=' + itemType))]
          case 1: return [4 /* yield */, (_a.sent()).json()]
          case 2: return [2 /* return */, _a.sent()]
        }
      })
    })
  }
  return ZoteroStore
}())
exports.default = new ZoteroStore()