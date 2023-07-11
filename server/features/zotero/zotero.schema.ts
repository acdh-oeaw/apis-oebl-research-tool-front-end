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

// FIXME: schema is different by item type
// see reponses from GET /items/new?itemType=book
export const zoteroItemData = z.object({
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
	tags: z.array(z.any()), // TODO:
	collections: z.array(z.any()), // TODO:
	relations: z.object({}), // TODO:
	dateAdded: z.string().datetime(),
	dateModified: z.string().datetime(),
});

export type ZoteroItemData = z.infer<typeof zoteroItemData>;

export const zoteroItem = z.object({
	key: z.string(),
	version: z.number(),
	library: z.object({
		type: z.enum(["group", "user"]),
		id: z.number(),
		name: z.string(),
		links: z.object({
			alternate: z.object({
				href: z.string().url(),
				type: z.enum(["application/json", "text/html"]),
			}),
		}),
	}),
	links: z.object({
		self: z.object({
			href: z.string().url(),
			type: z.enum(["application/json", "text/html"]),
		}),
		alternate: z.object({
			href: z.string().url(),
			type: z.enum(["application/json", "text/html"]),
		}),
	}),
	meta: z.object({
		creatorSummary: z.string(),
		numChildren: z.number(),
	}),
	data: zoteroItemData,
});

export type ZoteroItem = z.infer<typeof zoteroItem>;

export const zoteroItemPostInput = zoteroItemData.partial().merge(
	zoteroItemData
		.pick({
			itemType: true,
			tags: true,
			collections: true,
			relations: true,
		})
		.required(),
);

export type ZoteroItemPostInput = z.infer<typeof zoteroItemPostInput>;

export const zoteroItemPostResponse = z.object({
	successful: z.array(zoteroItem),
	success: z.array(z.string()),
	unchanged: z.array(z.string()),
	failed: z.array(
		z.object({
			key: z.string(),
			code: z.number(),
			message: z.string(),
		}),
	),
});

export type ZoteroItemPostResponse = z.infer<typeof zoteroItemPostResponse>;

export const zoteroItemPutInput = zoteroItemData.partial().merge(
	zoteroItemData
		.pick({
			version: true,
			itemType: true,
			tags: true,
			collections: true,
			relations: true,
		})
		.required(),
);

export type ZoteroItemPutInput = z.infer<typeof zoteroItemPutInput>;

export const zoteroItemPatchInput = zoteroItemData.partial().merge(
	zoteroItemData
		.pick({
			version: true,
		})
		.required(),
);

export type ZoteroItemPatchInput = z.infer<typeof zoteroItemPatchInput>;

export const getZoteroItemsSearchParams = z.object({
	direction: z.enum(["asc", "desc"]).optional(),
	/** A comma-separated list of item ids. Up to 50 can be specified in a single request. */
	itemKey: z.string().optional(),
	itemType: zoteroItemType.shape.itemType.optional(),
	/** @default 25 */
	limit: z.number().optional(),
	/** @default 0 */
	offset: z.number().optional(),
	query: z.string().optional(),
	/** @default 'dateModified' */
	sort: z
		.enum([
			"accessDate",
			"addedBy",
			"callNumber",
			"creator",
			"date",
			"dateAdded",
			"dateModified",
			"itemType",
			"journalAbbreviation",
			"language",
			"libraryCatalog",
			"numItems",
			"publicationTitle",
			"publisher",
			"rights",
			"title",
		])
		.optional(),
});

export type GetZoteroItemsSearchParams = z.infer<typeof getZoteroItemsSearchParams>;

export const getZoteroItemByIdParams = z.object({ id: z.string() });

export type GetZoteroItemByIdParams = z.infer<typeof getZoteroItemByIdParams>;

export const patchZoteroItemByIdParams = z.object({ id: z.string() });

export type PatchZoteroItemByIdParams = z.infer<typeof patchZoteroItemByIdParams>;

export const putZoteroItemByIdParams = z.object({ id: z.string() });

export type PutZoteroItemByIdParams = z.infer<typeof putZoteroItemByIdParams>;

export const getZoteroItemTemplateParams = z.object({ itemType: zoteroItemType.shape.itemType });

export type GetZoteroItemTemplateParams = z.infer<typeof getZoteroItemTemplateParams>;

export const getItemTypeFieldsParams = z.object({ itemType: zoteroItemType.shape.itemType });

export type GetItemTypeFieldsParams = z.infer<typeof getItemTypeFieldsParams>;

export const getItemTypeCreatorsParams = z.object({ itemType: zoteroItemType.shape.itemType });

export type GetItemTypeCreatorsParams = z.infer<typeof getItemTypeCreatorsParams>;
