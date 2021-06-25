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
    const initialData = await this.getInitialData()
    this.itemTypes = initialData.itemTypes
    this.itemTypeFields = initialData.itemTypeFields
    this.itemTypeCreators = initialData.itemTypeCreators
    console.log(this)
  }

  async getInitialData() {
    return (await fetch(process.env.VUE_APP_WEBAPP_HOST + '/zotero/initial-data')).json()
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

  async getItemTemplate(itemType: string): Promise<ZoteroItem['data']> {
    return await (await (fetch(`https://api.zotero.org/items/new?itemType=${ itemType }`))).json()
  }

}

export default new ZoteroStore()
