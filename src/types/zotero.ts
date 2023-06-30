export interface ZoteroItemCreator {
	creatorType: string;
	firstName: string;
	lastName: string;
}

export interface ZoteroItemType {
	itemType: string;
	localized: string;
}

export interface ZoteroItemCreatorType {
	creatorType: string;
	localized: string;
}

export interface ZoteroItemTypeField {
	field: string;
	localized: string;
}

export interface ZoteroPatchData extends Partial<ZoteroItem["data"]> {
	version: number;
}

export interface ZoteroItem {
	links?: { self: { href: string }; alternate: { href: string } };
	key: string;
	data: {
		// abstractNote: string
		// accessDate: string
		// archiveLocation: string
		// callNumber: string
		// collections: Array<unknown>
		creators: ZoteroItemCreator[];
		// date: string
		dateAdded: string;
		dateModified: string;
		// edition: string
		// extra: string
		itemType: string;
		key: string;
		language: string;
		// libraryCatalog: string
		// numPages: string
		// numberOfVolumes: string
		// place: string
		// publisher: string
		relations: {};
		// rights: string
		// series: string
		// seriesNumber: string
		// shortTitle: string
		tags: [];
		title: string;
		// url: string
		// ISBN: string
		version: number;
		// volume: string
		[zoteroField: string]: any;
	};
}

export interface ZoteroView {
	citation: string;
	url?: string;
	key: string;
}
