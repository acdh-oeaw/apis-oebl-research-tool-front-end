
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
   * Save ZoteroItems to the server
   * 
   * @param zoteroItem[] 
   * @returns ZoteroLemmaServerConnector for chaining
   */
  async add(zoteroItem: ZoteroItem[]): Promise<ZoteroLemmaServerConnector> {
    // TODO
    return this;
  }

  /**
   * List ZoteroKeys from the database
   * 
   * @returns string[]
   */
  async get(): Promise<Array<string>> {
    // TODO
    return [ 'http://example.com/', ];
  }

  /**
   * Deletes ZoteroItems from the server
   * 
   * @param zoteroItem[] 
   * @returns ZoteroLemmaServerConnector for chaining
   */
  async delete(zoteroItem: ZoteroItem[]): Promise<ZoteroLemmaServerConnector> {
    // TODO
    return this;
  }
}


/**
 * Cache Zotero Items locally with IndexedDB
 * 
 */
class ZoteroItemCache {

    static zoteroItemDatabaseName: string = 'ZoteroCache';
    static zoteroItemStoreName: string = 'ZoteroItems';
    static zoteroItemKeyName: string = 'Key';


    public dataBaseReady: boolean = false;
    public dataBaseConnectionEvents: Event[] = [];

    private database: IDBDatabase|undefined;

    constructor() {
      const openDatabaseRequest = window.indexedDB.open(ZoteroItemCache.zoteroItemDatabaseName, 1);
      openDatabaseRequest.onupgradeneeded = (event: IDBVersionChangeEvent): void => {this.createDatabase(event);};
      openDatabaseRequest.onerror = (event: any) => {this.dataBaseConnectionEvents.push(event); throw Error(JSON.stringify(event));};
      openDatabaseRequest.onsuccess = (event: any) => {this.dataBaseConnectionEvents.push(event); console.log(event); this.database = event.target.result;};
    }

    select(zoteroKeys: string[]): Array<ZoteroItem> {
      const store = this.getZoteroItemStore('readonly');
      const zoteroItems:Array<ZoteroItem> = [];
      let databaseResult: ZoteroItem|undefined;
      for (let zoteroKey in zoteroKeys)  {
        const request = store.get(zoteroKey);
        request.onsuccess = (event: any) => databaseResult = event.result;
        if (databaseResult !== undefined) {
          zoteroItems.push(databaseResult)
        }
      }
      return zoteroItems;
    }

    insert(zoteroItems: ZoteroItem[]): ZoteroItemCache {
      const store = this.getZoteroItemStore('readwrite');
      zoteroItems.map(item => store.add(item));
      return this;
    }

    update(zoteroItems: ZoteroItem[]): ZoteroItemCache {
      const store = this.getZoteroItemStore('readwrite');
      zoteroItems.map(item => store.put(item));
      return this;
    }

    delete(zoteroKeys: string[]): ZoteroItemCache {
      const store = this.getZoteroItemStore('readwrite');
      zoteroKeys.map(key => store.delete(key));
      return this;
    }
    

    private createDatabase(event: any): void {
      this.dataBaseConnectionEvents.push(event);
      const zoteroItemStore = event.target.result.createObjectStore(ZoteroItemCache.zoteroItemStoreName, {keyPath: ZoteroItemCache.zoteroItemKeyName});
      zoteroItemStore.createIndex(ZoteroItemCache.zoteroItemKeyName, ZoteroItemCache.zoteroItemKeyName, {unique: true});
      zoteroItemStore.transaction.onerror = (errorEvent: Event) => {this.dataBaseConnectionEvents.push(errorEvent); throw new Error(JSON.stringify(errorEvent))};
    }

    private getZoteroItemStore(mode: IDBTransactionMode): IDBObjectStore {
      if (this.database === undefined) {
        throw new Error('Database connection is not established');
      }
      return this.database.transaction([ZoteroItemCache.zoteroItemStoreName, ], mode).objectStore(ZoteroItemCache.zoteroItemStoreName);
    }
}

// If not imported, there is some type error, with auto-imported (?) stuff
import {Response, Headers} from 'node-fetch'

async function getZoteroResponse(zoteroKey: string, version: number|null = null): Promise<Response> {
  const requestHeaders = new Headers(); 
  requestHeaders.set('Content-Type', 'application/json');
  if (version !== null) {
    requestHeaders.set('if-Modified-Since-Version', String(version));
  }
  
  const djangoResponse = await fetch(
    `${process.env.VUE_APP_EVENTBUS_HOST}/zotero/item/${zoteroKey}`, {headers: requestHeaders}
  );
  if (djangoResponse.ok) {
    throw new Error(`Error in server ${djangoResponse.status} ${djangoResponse.statusText}`);
  }

  return djangoResponse;

}

async function getZoteroItem(zoteroKey: string, version: number|null = null): Promise<ZoteroItem> {
  const djangoResponse = await getZoteroResponse(zoteroKey, version);
  return await djangoResponse.json();
}

interface ZoteroItemUpdate {
  zoteroItem: ZoteroItem;
  changed: boolean;
}

async function syncZoteroItemWithZoteroAPI(zoteroItem: ZoteroItem): Promise<ZoteroItemUpdate> {
    const djangoResponse = await getZoteroResponse(zoteroItem.key, Number(zoteroItem.data.version));
    const zoteroStatus = parseInt(djangoResponse.headers.get('zoteroStatus')!); 
    if (zoteroStatus === 304) {
      return {zoteroItem: zoteroItem, changed: false};
    }
    return {zoteroItem: await djangoResponse.json(), changed: true};

}


/**
 * Control Zotero Manager
 * 
 * - Load ZoteroItems from keys
 * - Add ZoteroItems (from keys)
 * - Remove ZoteroItems
 * - Sync above with
 *  - Django server
 *  - Client cache
 *  - Zotero-API
 */
class ZoteroManagmentController {

  private zoteroItems: ZoteroItem[];
  private zoteroLemmaServerConnector: ZoteroLemmaServerConnector;
  private cache: ZoteroItemCache;

  constructor(serverConnector: ZoteroLemmaServerConnector) {
    this.zoteroLemmaServerConnector = serverConnector;
    this.zoteroItems = [];
    this.cache = new ZoteroItemCache();
  }

  /**
   * Load Zotero Itemss
   */
  async load(): Promise<ZoteroItem[]> {
    /*
     * Front-Matter: Load zoteroKeys from Server
     */
    const savedDjangoServerKeys = await this.zoteroLemmaServerConnector.get();
    
    /*
     * Chapter 1: Check Cache and Sync with Zotero
     */
    
    // Check those, who are in the cache
    const cachedItems = this.cache.select(savedDjangoServerKeys);
    // Check them for sync status
    const zoteroSyncStati = await Promise.all(cachedItems.map(syncZoteroItemWithZoteroAPI));
    // If changed, update cache
    const changedRevisions = zoteroSyncStati.filter(status => status.changed);
    this.cache.update(changedRevisions.map(status => status.zoteroItem));
    // Finally have updated cache items:
    const cachedAndSyncedItems = zoteroSyncStati.map(status => status.zoteroItem);

    /*
     * Chapter 2: Get New Items from Zotero and Cache Them
     */
    const cachedKeys = cachedItems.map(item => item.key);
    const notCachedDjangoServerKeys = savedDjangoServerKeys.filter(key => ! cachedKeys.includes(key));
    const newZoteroItems = await Promise.all(notCachedDjangoServerKeys.map(getZoteroItem));
    this.cache.insert(newZoteroItems);

    /*
     * Chapter 3: Combine cached and new results and store them 
     */
    this.zoteroItems = cachedAndSyncedItems.concat(newZoteroItems);

    /*
     * End-Matter                     
     */
    return this.zoteroItems;
    // (had to keep the pattern)
  }

  async addZoteroItems(zoteroItems: ZoteroItem[]): Promise<ZoteroManagmentController> {
    this.cache.insert(zoteroItems);
    this.zoteroLemmaServerConnector.add(zoteroItems);
    this.zoteroItems = this.zoteroItems.concat(zoteroItems);
    return this;
  }
}
