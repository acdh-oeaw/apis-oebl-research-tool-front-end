export interface ZoteroItemCreator {
  creatorType: string
  firstName: string
  lastName: string
}

export interface ZoteroItemType {
  itemType: string
  localized: string
}

export interface ZoteroItemCreatorType {
  creatorType: string
  localized: string
}

export interface ZoteroItemTypeField {
  field: string
  localized: string
}

export interface ZoteroPatchData extends Partial<ZoteroItem['data']> {
  version: number
}

export interface ZoteroItem {
  key: string
  data: {
    // abstractNote: string
    // accessDate: string
    // archiveLocation: string
    // callNumber: string
    // collections: Array<unknown>
    creators: ZoteroItemCreator[]
    // date: string
    dateAdded: string
    dateModified: string
    // edition: string
    // extra: string
    itemType: string
    key: string,
    language: string
    // libraryCatalog: string
    // numPages: string
    // numberOfVolumes: string
    // place: string
    // publisher: string
    relations: {}
    // rights: string
    // series: string
    // seriesNumber: string
    // shortTitle: string
    tags: []
    title: string
    // url: string
    // ISBN: string
    version: number
    // volume: string
    [ zoteroField: string ]: any
  }
}

class ZoteroStore {

  constructor() {
    this.init()
  }

  itemTypes: ZoteroItemType[] = []
  itemTypeFields: { [key: string]: ZoteroItemTypeField[] } = {}
  itemTypeCreators: { [key: string]: ZoteroItemCreatorType[] } = {}

  async init() {
    this.itemTypes = await this.getItemTypes()
    this.itemTypeFields = await this.getItemTypeFields(this.itemTypes)
    this.itemTypeCreators = await this.getItemTypeCreators(this.itemTypes)
  }

  async createItem(i: ZoteroItem['data']) {
    return await (await fetch(process.env.VUE_APP_WEBAPP_HOST + '/zotero/item', {
      method: 'POST',
      body: JSON.stringify([i]),
      headers: {
        'Content-Type': 'application/json'
      },
    })).json()
  }

  async searchItem(q: string): Promise<ZoteroItem[]> {
    return await (await fetch(process.env.VUE_APP_WEBAPP_HOST + '/zotero/search/' + q)).json()
  }

  async getItem(key: string): Promise<ZoteroItem> {
    return await (await fetch(process.env.VUE_APP_WEBAPP_HOST + '/zotero/item/' + key)).json()
  }

  async updateTitle(key: string, t: ZoteroPatchData): Promise<{ version: number }> {
    return await (await fetch(process.env.VUE_APP_WEBAPP_HOST + '/zotero/item/' + key, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(t)
    })).json()
  }

  async getItemTypes(): Promise<Array<{itemType: string, localized: string}>> {
    return await (await (fetch('https://api.zotero.org/itemTypes?locale=' + (navigator.language || 'de-DE')))).json()
  }

  async getItemTemplate(itemType: string): Promise<ZoteroItem['data']> {
    return await (await (fetch(`https://api.zotero.org/items/new?itemType=${ itemType }`))).json()
  }

  async getItemTypeFields(itemTypes: ZoteroItemType[]): Promise<{ [itemType: string]: ZoteroItemTypeField[] }> {
    return Promise.all(itemTypes.map(async (it) => {
      return {
        itemType: it.itemType,
        fields: await (await fetch(`https://api.zotero.org/itemTypeFields?itemType=${ it.itemType }&locale=${ (navigator.language || 'de-DE') }`)).json()
      }
    })).then(its => {
      return its.reduce((m, e) => {
        m[e.itemType] = e.fields
        return m
      }, {} as { [itemType: string]: ZoteroItemTypeField[] })
    })
  }

  async getItemTypeCreators(itemTypes: ZoteroItemType[]): Promise<{ [itemType: string]: ZoteroItemCreatorType[] }> {
    return Promise.all(itemTypes.map(async (it) => {
      return {
        itemType: it.itemType,
        creators: await (await fetch(`https://api.zotero.org/itemTypeCreatorTypes?itemType=${ it.itemType }&locale=${ (navigator.language || 'de-DE') }`)).json()
      }
    })).then(its => {
      return its.reduce((m, e) => {
        m[e.itemType] = e.creators
        return m
      }, {} as { [itemType: string]: ZoteroItemCreatorType[] })
    })
  }

}

export default new ZoteroStore()
