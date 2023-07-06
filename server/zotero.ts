import realFetch from "node-fetch";

import {
	type ZoteroItemCreatorType,
	type ZoteroItemType,
	type ZoteroItemTypeField,
} from "../src/types/zotero";

const fetchCache: { [url: string]: any } = {};

async function fetch(url: string) {
	if (fetchCache[url] === undefined) {
		console.info("cached ", url);
		fetchCache[url] = await (await realFetch(url)).json();
	}
	return { json: () => fetchCache[url] };
}

class Zotero {
	lang = "de-DE";

	async getItemTypes(): Promise<Array<{ itemType: string; localized: string }>> {
		return await (await fetch("https://api.zotero.org/itemTypes?locale=" + this.lang)).json();
	}

	async getItemTypeFields(
		itemTypes: Array<ZoteroItemType>,
	): Promise<{ [itemType: string]: Array<ZoteroItemTypeField> }> {
		return Promise.all(
			itemTypes.map(async (it) => {
				return {
					itemType: it.itemType,
					fields: await (
						await fetch(
							`https://api.zotero.org/itemTypeFields?itemType=${it.itemType}&locale=${this.lang}`,
						)
					).json(),
				};
			}),
		).then((its) => {
			return its.reduce((m, e) => {
				m[e.itemType] = e.fields;
				return m;
			}, {} as { [itemType: string]: Array<ZoteroItemTypeField> });
		});
	}

	async getItemTypeCreators(
		itemTypes: Array<ZoteroItemType>,
	): Promise<{ [itemType: string]: Array<ZoteroItemCreatorType> }> {
		return Promise.all(
			itemTypes.map(async (it) => {
				return {
					itemType: it.itemType,
					creators: await (
						await fetch(
							`https://api.zotero.org/itemTypeCreatorTypes?itemType=${it.itemType}&locale=${this.lang}`,
						)
					).json(),
				};
			}),
		).then((its) => {
			return its.reduce((m, e) => {
				m[e.itemType] = e.creators;
				return m;
			}, {} as { [itemType: string]: Array<ZoteroItemCreatorType> });
		});
	}
}

export default new Zotero();
