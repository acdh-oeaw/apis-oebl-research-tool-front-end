import { createHeaders, createUrl, createUrlSearchParams, request } from "@acdh-oeaw/lib";

import { env } from "../config/env";
import {
	type ZoteroItem,
	type ZoteroItemCreatorType,
	type ZoteroItemData,
	type ZoteroItemPatchInput,
	type ZoteroItemPostInput,
	type ZoteroItemPostResponse,
	type ZoteroItemPutInput,
	type ZoteroItemType,
	type ZoteroItemTypeField,
} from "./zotero.schema";

export const baseUrl = createUrl({
	baseUrl: "https://api.zotero.org/",
});

export const userBaseUrl = createUrl({
	baseUrl,
	pathname: `/users/${env.ZOTERO_USER}/`,
});

const headers = createHeaders({
	Authorization: `Bearer ${env.ZOTERO_API_KEY}`,
	"Zotero-API-Version": "3",
});

const locale = "de-AT";

// TODO: request cache - or rather prepopulate once on startup?
const cache = new Map();

const requestWithCache: typeof request = function requestWithCache(_url, config) {
	const url = _url instanceof Request ? _url.url : String(_url);

	if (!cache.has(url)) {
		cache.set(
			url,
			// FIXME: only cache HTTP 200 OK responses
			request(url, config).catch((error) => {
				cache.delete(url);
				throw error;
			}),
		);
	}

	return cache.get(url);
};

// TODO: the zotero api has a websocket streaming api
// see https://www.zotero.org/support/dev/web_api/v3/streaming_api

export function createService() {
	function getItems({
		itemKey,
		itemType,
		query,
		sort,
		direction,
		limit,
		offset,
	}: {
		/** A comma-separated list of item ids. Up to 50 can be specified in a single request. */
		itemKey?: string;
		itemType?: ZoteroItemType["itemType"];
		query?: string;
		/** @default 'dateModified' */
		sort?:
			| "accessDate"
			| "addedBy"
			| "callNumber"
			| "creator"
			| "date"
			| "dateAdded"
			| "dateModified"
			| "itemType"
			| "journalAbbreviation"
			| "language"
			| "libraryCatalog"
			| "numItems"
			| "publicationTitle"
			| "publisher"
			| "rights"
			| "title";
		direction?: "asc" | "desc";
		/** @default 25 */
		limit?: number;
		/** @default 0 */
		offset?: number;
	}): Promise<Array<ZoteroItem>> {
		const url = createUrl({
			baseUrl: userBaseUrl,
			pathname: "items",
			searchParams: createUrlSearchParams({
				itemKey,
				itemType,
				q: query,
				sort,
				direction,
				limit,
				start: offset,
			}),
		});

		return request(url, { headers, responseType: "json" }) as any;
	}

	function getItemById({ id }: { id: string }): Promise<ZoteroItem> {
		const url = createUrl({
			baseUrl: userBaseUrl,
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
	}

	function getItemTemplate({
		itemType,
	}: {
		itemType: ZoteroItemType["itemType"];
	}): Promise<ZoteroItemData> {
		const url = createUrl({
			baseUrl: userBaseUrl,
			pathname: "items/new",
			searchParams: createUrlSearchParams({ itemType }),
		});

		return request(url, { headers, responseType: "json" }) as any;
	}

	/**
	 * Note that the zotero patch endpoint will return HTTP 428 if the `version`
	 * field is missing from the request body.
	 *
	 * When a newer version exists upstream, the endpoint will return HTTP 412.
	 *
	 * A successful update will return HTTP 204, and a `Last-Modified-Version` header,
	 * which can be sent back to the zotero server as an `If-Unmodified-Since-Version`
	 * header (alternatively to providing a `version` field in the request body).
	 */
	function patchItemById({
		id,
		data,
	}: {
		id: string;
		data: ZoteroItemPatchInput;
	}): Promise<{ version: number }> {
		const url = createUrl({
			baseUrl: userBaseUrl,
			pathname: `items/${id}`,
		});

		return request(url, { method: "patch", body: data, headers, responseType: "raw" }).then(
			(response: Response) => {
				return { version: response.headers.get("Last-Modified-Version") };
			},
		);
	}

	/**
	 * Note that the zotero put endpoint will return HTTP 428 if the `version`
	 * field is missing from the request body.
	 *
	 * When a newer version exists upstream, the endpoint will return HTTP 412.
	 *
	 * A successful update will return HTTP 204, and a `Last-Modified-Version` header,
	 * which can be sent back to the zotero server as an `If-Unmodified-Since-Version`
	 * header (alternatively to providing a `version` field in the request body).
	 */
	function updateItemById({
		id,
		data,
	}: {
		id: string;
		data: ZoteroItemPutInput;
	}): Promise<{ version: number }> {
		const url = createUrl({
			baseUrl: userBaseUrl,
			pathname: `items/${id}`,
		});

		return request(url, { method: "put", body: data, headers, responseType: "raw" }).then(
			(response: Response) => {
				return { version: response.headers.get("Last-Modified-Version") };
			},
		);
	}

	/**
	 * Zotero does not have a "create single item" endpoint, but only a
	 * bulk post endpoint which accepts an array, and follows HTTP PATCH
	 * semantics.
	 *
	 * TODO: we might actually be able to use this to instead of `patchItemById`/`updateItemById`
	 * to get a proper json response back.
	 *
	 * TODO: we can get an empty template with supported fields per item type:
	 * GET /items/new?itemType=book
	 * @see https://www.zotero.org/support/dev/web_api/v3/types_and_fields#getting_a_template_for_a_new_item
	 */
	function createItem({ data }: { data: ZoteroItemPostInput }): Promise<ZoteroItem> {
		const url = createUrl({
			baseUrl: userBaseUrl,
			pathname: "items",
		});

		return request(url, { method: "post", body: [data], headers, responseType: "json" }).then(
			(_data) => {
				// TODO: do we need to check for `failed`?

				const data = _data as ZoteroItemPostResponse;
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return data.successful[0]!;
			},
		);
	}

	function getItemTypes(): Promise<Array<ZoteroItemType>> {
		const url = createUrl({
			baseUrl,
			pathname: "itemTypes",
			searchParams: createUrlSearchParams({ locale }),
		});

		return request(url, { headers, responseType: "json" }) as any;
	}

	function getItemTypeFields({
		itemType,
	}: {
		itemType: ZoteroItemType["itemType"];
	}): Promise<Array<ZoteroItemTypeField>> {
		const url = createUrl({
			baseUrl,
			pathname: "itemTypeFields",
			searchParams: createUrlSearchParams({ itemType, locale }),
		});

		return request(url, { headers, responseType: "json" }) as any;
	}

	function getItemTypeCreators({
		itemType,
	}: {
		itemType: ZoteroItemType["itemType"];
	}): Promise<Array<ZoteroItemCreatorType>> {
		const url = createUrl({
			baseUrl,
			pathname: "itemTypeCreatorTypes",
			searchParams: createUrlSearchParams({ itemType, locale }),
		});

		return request(url, { headers, responseType: "json" }) as any;
	}

	const service = {
		getItems,
		getItemById,
		getItemTemplate,
		patchItemById,
		updateItemById,
		createItem,
		getItemTypes,
		getItemTypeFields,
		getItemTypeCreators,
	};

	return service;
}
