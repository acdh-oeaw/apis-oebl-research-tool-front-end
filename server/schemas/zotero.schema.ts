import { z } from "zod";

export const zoteroItemType = z.object({
	itemType: z.string(),
	localized: z.string(),
});

export type ZoteroItemType = z.infer<typeof zoteroItemType>;

export const zoteroItemTypeField = z.object({
	field: z.string(),
	localized: z.string(),
});

export type ZoteroItemTypeField = z.infer<typeof zoteroItemTypeField>;

export const zoteroItemCreatorType = z.object({
	creatorType: z.string(),
	localized: z.string(),
});

export type ZoteroItemCreatorType = z.infer<typeof zoteroItemCreatorType>;

export const zoteroItemCreator = z.object({
	creatorType: zoteroItemCreatorType.shape.creatorType,
	firstName: z.string(),
	lastName: z.string(),
});

export type ZoteroItemCreator = z.infer<typeof zoteroItemCreator>;

export const zoteroItem = z.object({
	key: z.string(),
	version: z.number(),
	library: z.object({
		type: z.string(),
		id: z.number(),
		name: z.string(),
		links: z.object({
			alternate: z.object({
				href: z.string().url(),
				type: z.literal("text/html"),
			}),
		}),
	}),
	links: z.object({
		self: z.object({
			href: z.string().url(),
			type: z.literal("text/html"),
		}),
		alternate: z.object({
			href: z.string().url(),
			type: z.literal("text/html"),
		}),
	}),
	meta: z.object({
		creatorSummary: z.string(),
		numChildren: z.number(),
	}),
	data: z.object({
		key: z.string(),
		version: z.number(),
		itemType: zoteroItemType.shape.itemType,
		title: z.string(),
		creators: z.array(zoteroItemCreator),
		abstractNote: z.string(),
		series: z.string(),
		seriesNumber: z.string(),
		volume: z.string(),
		numberOfVolumes: z.string(),
		edition: z.string(),
		place: z.string(),
		publisher: z.string(),
		date: z.string(),
		numPages: z.string(),
		language: z.string(),
		ISBN: z.string(),
		shortTitle: z.string(),
		url: z.string(),
		accessDate: z.string(),
		archive: z.string(),
		archiveLocation: z.string(),
		libraryCatalog: z.string(),
		callNumber: z.string(),
		rights: z.string(),
		extra: z.string(),
		// tags: z.array(),
		// collections: z.array(),
		// relations: z.object({}),
		dateAdded: z.string().datetime(),
		dateModified: z.string().datetime(),
	}),
});

export type ZoteroItem = z.infer<typeof zoteroItem>;
