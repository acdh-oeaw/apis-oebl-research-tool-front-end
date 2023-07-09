import {
	createHeaders,
	createUrl,
	createUrlSearchParams,
	isNonNullable,
	request,
} from "@acdh-oeaw/lib";
import {
	type ZoteroItem,
	type ZoteroItemCreatorType,
	type ZoteroItemPatchInput,
	type ZoteroItemType,
	type ZoteroItemTypeField,
} from "@server/zotero/zotero.schema";
import Dexie from "dexie";

import { env } from "@/config/env";
import { type ZoteroView } from "@/types/zotero";

const baseUrl = createUrl({ baseUrl: env.VUE_APP_EVENTBUS_HOST });

class ZoteroStore {
	constructor() {
		this.init();
	}

	itemTypes: Array<ZoteroItemType> = [];
	itemTypeFields: { [key: string]: Array<ZoteroItemTypeField> } = {};
	itemTypeCreators: { [key: string]: Array<ZoteroItemCreatorType> } = {};

	async init() {
		const initialData = await this.getInitialData();
		this.itemTypes = initialData.itemTypes;
		this.itemTypeFields = initialData.itemTypeFields;
		this.itemTypeCreators = initialData.itemTypeCreators;
	}

	getInitialData() {
		const url = createUrl({
			baseUrl,
			pathname: "/zotero/item-types",
		});

		return request(url, { responseType: "json" }) as any;
	}

	getItems(query: string) {
		const url = createUrl({
			baseUrl,
			pathname: "/zotero/items",
			searchParams: createUrlSearchParams({ query }),
		});

		return request(url, { responseType: "json" }) as any;
	}

	getItem(id: string) {
		const url = createUrl({
			baseUrl,
			pathname: `/zotero/items/${id}`,
		});

		return request(url, { responseType: "json" }) as any;
	}

	getItemTemplate(itemType: string) {
		const url = createUrl({
			baseUrl,
			pathname: `/zotero/item-template/${itemType}`,
		});

		return request(url, { responseType: "json" }) as any;
	}

	createItem(item: ZoteroItem["data"]) {
		const url = createUrl({
			baseUrl,
			pathname: "/zotero/items",
		});

		return request(url, { method: "post", body: item, responseType: "json" }) as any;
	}

	updateItemTitle(id: string, data: ZoteroItemPatchInput) {
		const url = createUrl({
			baseUrl,
			pathname: `/zotero/items/${id}`,
		});

		return request(url, { method: "patch", body: data, responseType: "json" }) as any;
	}
}

const zoteroStore = new ZoteroStore();

export default zoteroStore;

/**
 * Cache zotero items locally with indexeddb.
 */
class ZoteroItemCache {
	private database: any | undefined;

	constructor() {
		this.database = new Dexie("ZoteroCache", { allowEmptyDB: true });
		this.database.version(2).stores({ zoteroItems: "key" });
	}

	async select(zoteroKeys: Array<string>): Promise<Array<ZoteroItem>> {
		const allResults = await this.database.zoteroItems.bulkGet(zoteroKeys);
		return allResults.filter(isNonNullable);
	}

	async insert(zoteroItems: Array<ZoteroItem>): Promise<string> {
		return await this.database.zoteroItems.bulkAdd(zoteroItems);
	}

	async update(zoteroItems: Array<ZoteroItem>): Promise<string> {
		return await this.database.zoteroItems.bulkPut(zoteroItems);
	}

	async delete(): Promise<void> {
		return await this.database.zoteroItems.bulkDelete();
	}
}

// FIXME: providing a "If-Modified-Since-Version" header does not work for by-id requests
// according to the zotero api docs (checked and indeed it does not work), so this whole
// caching dance seems a but pointless.
// see https://www.zotero.org/support/dev/web_api/v3/basics#caching
// "Single-object conditional requests are not currently supported, but will be supported in the future."
function getZoteroResponse(id: string, version: number | null = null): Promise<Response> {
	const url = createUrl({
		baseUrl,
		pathname: `/zotero/items/${id}`,
	});

	return request(url, {
		responseType: "raw",
		headers: createHeaders({
			"If-Modified-Since-Version": version,
		}),
	}) as Promise<Response>;
}

async function getZoteroItem(id: string, version: number | null = null): Promise<ZoteroItem> {
	const response = await getZoteroResponse(id, version);
	return response.json();
}

interface ZoteroItemUpdate {
	zoteroItem: ZoteroItem;
	changed: boolean;
}

async function syncZoteroItemWithZoteroAPI(zoteroItem: ZoteroItem): Promise<ZoteroItemUpdate> {
	const response = await getZoteroResponse(zoteroItem.key, Number(zoteroItem.data.version));

	const zoteroStatus = response.headers.get("zoteroStatus");
	if (zoteroStatus === "304") {
		return { zoteroItem: zoteroItem, changed: false };
	}

	return { zoteroItem: await response.json(), changed: true };
}

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
	private _synchronizations: Map<string, Promise<ZoteroItemUpdate>>;

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
	private _zoteroItems: Array<ZoteroItem> = [];
	private _cachedItemsToCheckForUpdate: Array<ZoteroItem> = []; // Keep record for updates

	// Dependencies
	private _cache: ZoteroItemCache | null;
	private _syncManager: ZoteroSyncManager = ZoteroSyncManager.getInstance(
		"ZoteroLemmaManagmentController",
	);

	// States
	private _loaded = false;
	private _loading = false;
	private _uptodate = false;
	private _updating = false;

	constructor() {
		try {
			this._cache = new ZoteroItemCache();
		} catch (error) {
			console.error({ catchedError: error });
			this._cache = null;
		}
	}

	get zoteroItems(): Array<ZoteroItem> {
		return this._zoteroItems;
	}

	/**
	 * Load Zotero Items
	 */
	async load(zoteroItemKeys: Array<string>): Promise<ZoteroLemmaManagmentController> {
		// Set state, so components can use that
		this._loading = true;
		// Only load data, that has not already been loaded into memory
		const alreadyLoadedKeys = this.zoteroItems.map((item) => item.key);
		// eslint-disable-next-line no-param-reassign
		zoteroItemKeys = zoteroItemKeys.filter((key) => !alreadyLoadedKeys.includes(key));
		// If there is a cache, load data from there
		let cachedItems: Array<ZoteroItem> = [];
		try {
			cachedItems = this._cache === null ? [] : await this._cache.select(zoteroItemKeys);
		} catch (error) {
			console.error({ catchedError: error });
		}
		// Check, which items had not been cached
		const cachedKeys = cachedItems.map((item) => item.key);
		const notCachedKeys = zoteroItemKeys.filter((key) => !cachedKeys.includes(key));
		// Load them from zotero
		const newZoteroItems = await Promise.all(notCachedKeys.map(getZoteroItem));
		// Try to cache the new items
		if (this._cache !== null) {
			try {
				await this._cache.insert(newZoteroItems);
			} catch (error) {
				console.error({ catchedError: error });
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
			throw new Error("Load items, before upadting them");
		}

		if (this._loading) {
			throw new Error("Do not update while loading. This leads to incostistent state.");
		}

		this._updating = true;

		// Check them for sync status
		const zoteroSyncStati = await Promise.all(
			this._cachedItemsToCheckForUpdate.map(
				this._syncManager.getCachedSyncZoteroItemWithZoteroAPICallback(),
			),
		);
		// If changed, update cache
		const changedRevisions = zoteroSyncStati.filter((status) => status.changed);
		if (this._cache !== null) {
			try {
				await this._cache.update(changedRevisions.map((status) => status.zoteroItem));
			} catch (error) {
				console.error({ catchedError: error });
			}
		}
		// Finally write them back
		const syncedZoteroItems = zoteroSyncStati.map((status) => status.zoteroItem);
		const syncedZoteroKeys = syncedZoteroItems.map((zoteroItem) => zoteroItem.key);
		const uncachedItems = this._zoteroItems.filter(
			(zoteroItem) => !syncedZoteroKeys.includes(zoteroItem.key),
		);
		this._zoteroItems = uncachedItems.concat(syncedZoteroItems);
		this._cachedItemsToCheckForUpdate = [];

		this._updating = false;
		this._uptodate = true;

		return this;
	}

	async add(zoteroItems: Array<ZoteroItem>) {
		if (this._cache !== null) {
			try {
				await this._cache.update(zoteroItems);
			} catch (error) {
				console.error({ catchedError: error });
			}
		}
	}

	remove(zoteroKey: string): ZoteroLemmaManagmentController {
		this._zoteroItems = this._zoteroItems.filter((item) => item.key !== zoteroKey);
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

	private addZoteroItems(newZoteroItems: Array<ZoteroItem>, overwrite: boolean): void {
		const oldZoteroItems = this._zoteroItems;

		const itemsToFilter = overwrite ? oldZoteroItems : newZoteroItems;
		const itemsToStay = overwrite ? newZoteroItems : oldZoteroItems;
		const keysToStay = itemsToStay.map((item) => item.key);
		const filteredItems = itemsToFilter.filter((item) => !keysToStay.includes(item.key));
		this._zoteroItems = itemsToStay.concat(filteredItems);
	}

	private addItemsToCachedList(newCachedItems: Array<ZoteroItem>): void {
		const newKeys = newCachedItems.map((item) => item.key);
		const oldItems = this._cachedItemsToCheckForUpdate.filter(
			(item) => !newKeys.includes(item.key),
		);
		this._cachedItemsToCheckForUpdate = oldItems.concat(newCachedItems);
	}
}

export function convertZoteroItemToView(zoteroItem: ZoteroItem): ZoteroView {
	const authors = zoteroItem.data.creators.map((creator) => creator.lastName).join(", ");
	const title = zoteroItem.data.title;
	const year = zoteroItem.data.date ? zoteroItem.data.date : "o. J.";
	return {
		citation: `${authors}: ${title}, ${year}`,
		url: zoteroItem.links?.alternate.href,
		key: zoteroItem.key,
	};
}
