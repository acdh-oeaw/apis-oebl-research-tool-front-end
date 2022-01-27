import { assert } from 'chai'
import fetch, { Headers } from 'node-fetch'
import realFetch from 'node-fetch'
import { ZoteroItem, ZoteroItemCreatorType, ZoteroItemType, ZoteroItemTypeField } from '../src/service/zotero'

export const fetchCache: { [url: string]: any } = {}

export async function cached_fetch(url: string) {
  if (fetchCache[url] === undefined) {
    console.info('cached ', url)
    fetchCache[url] = await (await realFetch(url)).json()
  }
  return { json: () => fetchCache[url] }
}

class ZoteroTypes {

  lang = 'de-DE'

  async getItemTypes(): Promise<Array<{itemType: string, localized: string}>> {
    return await (await (cached_fetch('https://api.zotero.org/itemTypes?locale=' + this.lang))).json()
  }

  async getItemTypeFields(itemTypes: ZoteroItemType[]): Promise<{ [itemType: string]: ZoteroItemTypeField[] }> {
    return Promise.all(itemTypes.map(async (it) => {
      return {
        itemType: it.itemType,
        fields: await (await cached_fetch(`https://api.zotero.org/itemTypeFields?itemType=${ it.itemType }&locale=${ this.lang }`)).json()
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
        creators: await (await cached_fetch(`https://api.zotero.org/itemTypeCreatorTypes?itemType=${ it.itemType }&locale=${ this.lang }`)).json()
      }
    })).then(its => {
      return its.reduce((m, e) => {
        m[e.itemType] = e.creators
        return m
      }, {} as { [itemType: string]: ZoteroItemCreatorType[] })
    })
  }
}

export default new ZoteroTypes()

/**
 * Zotero Items for a entity (user / group) from a zotero request at a certain time with a library version
 */
export interface EntityRelatedZoteroItems {
  /** https://www.zotero.org/support/dev/web_api/v3/syncing#version_numbers */
  libraryVersion: number
  zoteroItems: Array<ZoteroItem>
}

export enum ZoteroEntityType {
  users = 'users',
  groups = 'groups',
}

export async function nativeFetchWrapper(url: string, args: {method: 'GET', headers: Headers}): Promise<{status: Number, json(): Promise<any>, headers: Headers}> {
  const response = await fetch(url, args);
  return {
    status: response.status,
    headers: response.headers,
    async json() {
      try {
        return await response.json();
      } catch (FetchError) {
        return {};
      }
      

    },
  }
}

/**
 * Checks for items for a user/group in zotero with https://www.zotero.org/support/dev/web_api/v3/basics#user_and_group_library_urls
 * 
 * @param entity_id The user or group id
 * @param zoteroEntityType 
 * @param libraryVersion if given and no updates since return null, see https://www.zotero.org/support/dev/web_api/v3/syncing#version_numbers
 * @param apiKey https://www.zotero.org/support/dev/web_api/v3/basics#authentication
 * @param fetchFunction async function to inject. Usually fetch.
 * @returns EntityRelatedZoteroItems if no library version number has given, or there is a new library number. Null if there are no changes.
 */
export async function zoteroFetchFunction(
    entity_id: string, 
    zoteroEntityType: ZoteroEntityType,
    libraryVersion: Number | null = null,
    apiKey: string = process.env.ZOTERO_API_KEY,
    fetchFunction = nativeFetchWrapper
): Promise<EntityRelatedZoteroItems | null> {
  const prefix = zoteroEntityType == ZoteroEntityType.groups ? 'groups' : 'users'
  const url = `https://api.zotero.org/${prefix}/${entity_id}/items`
  const headers = new Headers();
  headers.set('Zotero-Api-Version', '3');
  headers.set('Content-Type', 'application/json');
  headers.set('Zotero-API-Key', apiKey);


  if (libraryVersion !== null) {
    headers.set('if-Modified-Since-Version', String(libraryVersion))
  }

  const response = await fetchFunction(url, {method: 'GET', headers: headers});

  if (response.status === 304) {
    return null;
  }

  if (response.status !== 200) {
    throw new Error(`Zotero response code ${response.status} can not be handled here. Zotero message: ${await response.json()} `);
  }



  const zoteroObjects: Array<any> = await response.json();
  /* Fail early on unexpected API-behavior, so at least the error makes sense  */
  assert(Array.isArray(zoteroObjects), `Zotero did not send an array but:\n${JSON.stringify(zoteroObjects)}` );
  /* top level keys */
  assert(
    zoteroObjects.every(
      (item: Object): boolean => ['key', 'data'].every((property: string): boolean => item.hasOwnProperty(property)) 
      ), 'Zotero Items are expected to have key and data properties'
  );
  /* Just checked top level keys, from here on it's wild west ;-) */

  const zoterItems: Array<ZoteroItem> = zoteroObjects;

  return {
    libraryVersion: Number(response.headers.get('Last-Modified-Version')),
    zoteroItems: zoterItems
  }
}


export class ZoteroItemCache {
  zoteroEntityType: ZoteroEntityType
  fetchFunction: typeof zoteroFetchFunction
  apiKey: string
  cache: Map<string, EntityRelatedZoteroItems>

  constructor(zoteroEntityType: ZoteroEntityType, fetchFunction = zoteroFetchFunction, apiKey: string = process.env.ZOTERO_API_KEY) {
    this.zoteroEntityType = zoteroEntityType;
    this.fetchFunction = fetchFunction;
    this.apiKey = apiKey,
    this.cache = new Map();
  }

  async get(entity_id: string): Promise<Array<ZoteroItem>> {
    
    const cacheExists = this.cache.has(entity_id);
    const libraryVersion =  cacheExists ? this.cache.get(entity_id).libraryVersion : null;
    const apiResult = await this.fetchFunction(entity_id, this.zoteroEntityType, libraryVersion)
    
    if((apiResult === null) && (! cacheExists)) {
      throw new Error(`Found neither API-results nor a cache item for ${this.zoteroEntityType} with id ${entity_id}`)
    }

    if (apiResult) {
      this.cache.set(entity_id, apiResult);
    }

    return this.cache.get(entity_id).zoteroItems;
    
  }
}
