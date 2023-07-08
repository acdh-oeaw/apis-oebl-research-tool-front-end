import { createHeaders, createUrl, createUrlSearchParams, request } from "@acdh-oeaw/lib";

import { env } from "../config/env";
import {
	type ZoteroItem,
	type ZoteroItemCreatorType,
	type ZoteroItemPatchData,
	type ZoteroItemType,
	type ZoteroItemTypeField,
} from "../schemas/zotero.schema";

const baseUrl = "https://api.zotero.org/";

const userUrl = createUrl({
	baseUrl,
	pathname: `/users/${env.ZOTERO_USER}/`,
});

const headers = createHeaders({
	"Zotero-API-Version": "3",
	"Zotero-API-Key": env.ZOTERO_API_KEY,
});

const locale = "de-DE";

// TODO: request cache

export const api = {
	// TODO: do we need sorting and pagination?
	getItems(query?: string): Promise<Array<ZoteroItem>> {
		const url = createUrl({
			baseUrl: userUrl,
			pathname: "items",
			searchParams: createUrlSearchParams({ q: query }),
		});

		return request(url, { headers, responseType: "json" }) as any;
	},
	getItemById(id: string): Promise<ZoteroItem> {
		const url = createUrl({
			baseUrl: userUrl,
			pathname: `items/${id}`,
		});

		// FIXME: why did we have this?
		// 	if ("if-Modified-Since-Version" in request.headers) {
		// 		headers.set(
		// 			"if-Modified-Since-Version",
		// 			String(request.headers["if-Modified-Since-Version"]),
		// 		);
		// 	}

		// FIXME: why did we have this?
		// 	response.header["zoteroStatus"] = String(zoteroResponse.status);
		// 	response.header["zoteroStatusText"] = zoteroResponse.statusText;

		return request(url, { headers, responseType: "json" }) as any;
	},
	// FIXME: check if this includes the version - original code returned
	// `{ version: response.headers.get("Last-Modified-Version") }`
	patchItemById(id: string, body: ZoteroItemPatchData): Promise<ZoteroItem> {
		const url = createUrl({
			baseUrl: userUrl,
			pathname: `items/${id}`,
		});

		return request(url, { method: "patch", body, headers, responseType: "json" }) as any;
	},
	createItem(body: ZoteroItem["data"]): Promise<ZoteroItem> {
		const url = createUrl({
			baseUrl: userUrl,
			pathname: "items",
		});

		return request(url, { method: "post", body, headers, responseType: "json" }) as any;
	},
	getItemTypes(): Promise<Array<ZoteroItemType>> {
		const url = createUrl({
			baseUrl,
			pathname: "itemTypes",
			searchParams: createUrlSearchParams({ locale }),
		});

		return request(url, { headers, responseType: "json" }) as any;
	},
	getItemTypeFields(itemType: string): Promise<Array<ZoteroItemTypeField>> {
		const url = createUrl({
			baseUrl,
			pathname: "itemTypeFields",
			searchParams: createUrlSearchParams({ itemType, locale }),
		});

		return request(url, { headers, responseType: "json" }) as any;
	},
	getItemTypeCreators(itemType: string): Promise<Array<ZoteroItemCreatorType>> {
		const url = createUrl({
			baseUrl,
			pathname: "itemTypeCreatorTypes",
			searchParams: createUrlSearchParams({ itemType, locale }),
		});

		return request(url, { headers, responseType: "json" }) as any;
	},
};
