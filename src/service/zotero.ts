
import { LemmaRow } from '@/types/lemma'
import fetch from 'node-fetch'

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
    return (await fetch(process.env.VUE_APP_EVENTBUS_HOST + '/zotero/initial-data')).json()
  }

  async createItem(i: ZoteroItem['data']) {
    return await (await fetch(process.env.VUE_APP_EVENTBUS_HOST + '/zotero/item', {
      method: 'POST',
      body: JSON.stringify([i]),
      headers: {
        'Content-Type': 'application/json'
      },
    })).json()
  }

  async searchItem(q: string): Promise<ZoteroItem[]> {
    return await (await fetch(process.env.VUE_APP_EVENTBUS_HOST + '/zotero/search/' + q)).json()
  }

  async getItem(key: string): Promise<ZoteroItem> {
    return await (await fetch(process.env.VUE_APP_EVENTBUS_HOST + '/zotero/item/' + key)).json()
  }

  async updateTitle(key: string, t: ZoteroPatchData): Promise<{ version: number }> {
    return await (await fetch(process.env.VUE_APP_EVENTBUS_HOST + '/zotero/item/' + key, {
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


export enum ZoteroLemmaType {
  /** This is Literature about a lemma/person */
  ABOUT_LEMMA = "ABOUT_LEMMA",
  /** This is literature (written) by a lemma/person */
  BY_LEMMA = "BY_LEMMA",
}

/**
 * Manage (CR~U~D) zotero Items with the server
 */
export class ZoteroLemmaServerConnector {

  lemma: LemmaRow;
  zoteroLemmaType: ZoteroLemmaType;

  constructor(lemma: LemmaRow, zoteroLemmaType: ZoteroLemmaType) {
    this.lemma = lemma;
    this.zoteroLemmaType = zoteroLemmaType;
  }

  /**
   * Save an ZoteroItem to the server
   * 
   * @param zoteroItem 
   * @returns ZoteroLemmaServerConnector for chaining
   */
  async add(zoteroItem: ZoteroItem): Promise<ZoteroLemmaServerConnector> {
    // TODO
    return this;
  }

  /**
   * List ZoteroItems from the database
   * 
   * @returns ZoteroItem[]
   */
  async get(): Promise<Array<ZoteroItem>> {
    // TODO
    return [
      {
        key: 'http://example.com/',
        data: {
          creators: [],
          dateAdded: '',
          dateModified: '',
          itemType: '',
          key: '',
          language: '',
          relations: {},
          tags: [],
          title: 'Test Book',
          version: 0,
        }
      }
    ];
  }

  /**
   * Deletes an ZoteroItem from the server
   * 
   * @param zoteroItem 
   * @returns ZoteroLemmaServerConnector for chaining
   */
  async delete(zoteroItem: ZoteroItem): Promise<ZoteroLemmaServerConnector> {
    // TODO
    return this;
  }
}
