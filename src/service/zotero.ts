
import Dexie from 'dexie';
import { LemmaRow } from '@/types/lemma'
import fetch from 'node-fetch'

import { ZoteroItemType, ZoteroItemCreatorType, ZoteroItemTypeField, ZoteroPatchData, ZoteroItem } from '@/types/zotero';


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


/**
 * Cache Zotero Items locally with IndexedDB
 * 
 */
class ZoteroItemCache {

    private database: any|undefined;

    constructor() {
      this.database = new Dexie('ZoteroCache', {allowEmptyDB: true});
      this.database.version(2).stores({
        zoteroItems: 'key',
      })
    }

    async select(zoteroKeys: string[]): Promise<ZoteroItem[]> {
        const allResults = await this.database.zoteroItems.bulkGet(zoteroKeys);
        return allResults.filter(
          (row: ZoteroItem|undefined|null) => 
              (row !== undefined) && (row !== null)
            );
    }

    /**
     * 
     * @param zoteroItems 
     * @returns The key of the last insert
     */
    async insert(zoteroItems: ZoteroItem[]): Promise<string> {
      return await this.database.zoteroItems.bulkAdd(zoteroItems);
    }

    /**
     * 
     * @param zoteroItems 
     * @returns The key of the last update
     */
     async update(zoteroItems: ZoteroItem[]): Promise<string> {
      return await this.database.zoteroItems.bulkPut(zoteroItems)
    }

    /**
     * 
     * @param zoteroKeys 
     * @returns I have no clue
     */
     async delete(zoteroKeys: string[]): Promise<any> {
      return await this.database.zoteroItems.bulkDelete()
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
  
  if (!djangoResponse.ok) {
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
 * This is to have a local cache in memory and not syncing the the same item multiple times from different components
 */
class ZoteroSyncManager {
  
  /**
   *  Multiton instances
   * 
   *  to cache between components, without having to move this class initialization to the grand-parent and pass it via props
   * 
   */
  public static instances: Map<any, ZoteroSyncManager> = new Map();

  static getInstance(key: any): ZoteroSyncManager {
    if (!ZoteroSyncManager.instances.has(key)) {
      ZoteroSyncManager.instances.set(key, new ZoteroSyncManager());
    }
    return ZoteroSyncManager.instances.get(key)!;
  }

  /**
   * Ongoing and finished synchronizations
   */
  private _synchronizations: Map<string, Promise<ZoteroItemUpdate>>

  constructor() {
    this._synchronizations = new Map();
  }


  async cachedSyncZoteroItemWithZoteroAPI(zoteroItem: ZoteroItem): Promise<ZoteroItemUpdate> {
    if (!this._synchronizations.has(zoteroItem.key)) {
      this._synchronizations.set(zoteroItem.key, syncZoteroItemWithZoteroAPI(zoteroItem)); 
    }
    return await this._synchronizations.get(zoteroItem.key)!;
  }

  getCachedSyncZoteroItemWithZoteroAPICallback() {
    return this.cachedSyncZoteroItemWithZoteroAPI.bind(this);
  }

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
export class ZoteroLemmaManagmentController {

  // Data
  private _zoteroItems: ZoteroItem[] = [];
  private _cachedItemsToCheckForUpdate: ZoteroItem[] = []; // Keep record for updates
  
  // Dependencies
  private _cache: ZoteroItemCache|null;
  private _syncManager: ZoteroSyncManager = ZoteroSyncManager.getInstance('ZoteroLemmaManagmentController');

  // States
  private _loaded: boolean = false;
  private _loading: boolean = false;
  private _uptodate: boolean = false;
  private _updating: boolean = false;

  constructor() {
    try {
      this._cache = new ZoteroItemCache();
    } catch (error) {
      console.error({catchedError: error});
      this._cache = null;
    }
  }

  get zoteroItems(): ZoteroItem[] {
    return this._zoteroItems;
  }


  /**
   * Load Zotero Items
   */
  async load(zoteroItemKeys: string[]): Promise<ZoteroLemmaManagmentController> {
    // Set state, so components can use that
    this._loading = true;
    // Only load data, that has not already been loaded into memory
    const alreadyLoadedKeys = this.zoteroItems.map(item => item.key);
    zoteroItemKeys = zoteroItemKeys.filter(key => !alreadyLoadedKeys.includes(key));
    // If there is a cache, load data from there
    let cachedItems: ZoteroItem[] = [];
    try {
      cachedItems = this._cache === null ? [] : await this._cache.select(zoteroItemKeys);
    } catch (error) {
      console.error({catchedError: error});
    }
    // Check, which items had not been cached
    const cachedKeys = cachedItems.map(item => item.key);
    const notCachedKeys = zoteroItemKeys.filter(key => ! cachedKeys.includes(key));
    // Load them from zotero
    const newZoteroItems = await Promise.all(notCachedKeys.map(getZoteroItem));
    // Try to cache the new items
    if (this._cache !== null) {
      try {
        await this._cache.insert(newZoteroItems);
      } catch (error) {
        console.error({catchedError: error});
      }
    }
    // All items, cached and new, are the result of this caclulation
    const result = cachedItems.concat(newZoteroItems);
    // Update properties
    this.addZoteroItems(result, true);
    this.addItemsToCachedList(cachedItems);

    this._loaded = true;
    this._loading = false;
    
    return this;
  }

  /**
   * Update changed items from Zotero
   */
  async update(): Promise<ZoteroLemmaManagmentController> {

    if (!this._loaded) {
      throw new Error('Load items, before upadting them');
    }

    if (this._loading) {
      throw new Error('Do not update while loading. This leads to incostistent state.')
    }

    this._updating = true;

    // Check them for sync status
    const zoteroSyncStati = await Promise.all(
      this._cachedItemsToCheckForUpdate.map(this._syncManager.getCachedSyncZoteroItemWithZoteroAPICallback())); // or bether getLocallyCachedSynginZoteroCitationsAPIManagerDonaudampschiffahrtsKabinenSchlüsselPutzerAssistentenAPI
    // If changed, update cache
    const changedRevisions = zoteroSyncStati.filter(status => status.changed);
    if (this._cache !== null) {
      try {
        await this._cache.update(changedRevisions.map(status => status.zoteroItem));
      } catch (error) {
        console.error({catchedError: error});
      }
    }
    // Finally write them back
    const syncedZoteroItems = zoteroSyncStati.map(status => status.zoteroItem);
    const syncedZoteroKeys = syncedZoteroItems.map(zoteroItem => zoteroItem.key);
    const uncachedItems = this._zoteroItems.filter(zoteroItem => !syncedZoteroKeys.includes(zoteroItem.key));
    this._zoteroItems = uncachedItems.concat(syncedZoteroItems);
    this._cachedItemsToCheckForUpdate = [];

    this._updating = false;
    this._uptodate = true;

    return this;
  }

  async add(zoteroItems: ZoteroItem[]) {
    if (this._cache !== null) {
      try {
        await this._cache.update(zoteroItems);
      } catch (error) {
        console.error({catchedError: error});
      }
    }
  }

  remove(zoteroKey: string): ZoteroLemmaManagmentController {
    this._zoteroItems = this._zoteroItems.filter(item => item.key !== zoteroKey);
    return this;
  }


  get loaded(): boolean {
    return this._loaded;
  }


  get loading(): boolean {
    return this._loading;
  }


  get uptodate(): boolean {
    return this._uptodate;
  }


  get updating(): boolean {
    return this._updating;
  }

  private addZoteroItems(newZoteroItems: ZoteroItem[], overwrite: boolean): void {
    
    const oldZoteroItems = this._zoteroItems;

    const itemsToFilter = overwrite ? oldZoteroItems : newZoteroItems;
    const itemsToStay = overwrite ? newZoteroItems : oldZoteroItems;
    const keysToStay = itemsToStay.map(item => item.key);
    const filteredItems = itemsToFilter.filter(item => !keysToStay.includes(item.key));
    this._zoteroItems = itemsToStay.concat(filteredItems);
  }

  private addItemsToCachedList(newCachedItems: ZoteroItem[]): void {
    const newKeys = newCachedItems.map(item => item.key);
    const oldItems = this._cachedItemsToCheckForUpdate.filter(item => !newKeys.includes(item.key));
    this._cachedItemsToCheckForUpdate = oldItems.concat(newCachedItems);
  }
}
