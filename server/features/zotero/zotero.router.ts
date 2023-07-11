import { Router } from "express";

import {
	getZoteroItemByIdParams,
	getZoteroItemsSearchParams,
	getZoteroItemTemplateParams,
	patchZoteroItemByIdParams,
	putZoteroItemByIdParams,
	zoteroItemPatchInput,
	zoteroItemPostInput,
	zoteroItemPutInput,
} from "@server/features/zotero/zotero.schema";
import { createService as createZoteroService } from "@server/features/zotero/zotero.service";
import { withValidation } from "@server/middlewares/with-validation";

export function createRouter() {
	const zotero = createZoteroService();

	const router = Router();

	// FIXME: i guess we want to secure these endpoints? at least cors?
	// router.use(withAuthentication);

	router.get(
		"/items",
		withValidation({ searchParams: getZoteroItemsSearchParams }),
		async (request, response, next) => {
			try {
				const data = await zotero.getItems(request.query);
				return response.send(data);
			} catch (error) {
				return next(error);
			}
		},
	);

	router.get(
		"/items/:id",
		withValidation({ params: getZoteroItemByIdParams }),
		async (request, response, next) => {
			try {
				const data = await zotero.getItemById(request.params);
				return response.send(data);
			} catch (error) {
				return next(error);
			}
		},
	);

	router.get(
		"/item-template/:itemType",
		withValidation({ params: getZoteroItemTemplateParams }),
		async (request, response, next) => {
			try {
				const data = await zotero.getItemTemplate(request.params);
				return response.send(data);
			} catch (error) {
				return next(error);
			}
		},
	);

	router.post(
		"/items",
		withValidation({ body: zoteroItemPostInput }),
		async (request, response, next) => {
			try {
				const data = await zotero.createItem(request.body);
				return response.send(data);
			} catch (error) {
				return next(error);
			}
		},
	);

	router.put(
		"/items/:id",
		withValidation({ params: putZoteroItemByIdParams, body: zoteroItemPutInput }),
		async (request, response, next) => {
			try {
				const data = await zotero.updateItemById(request.params, request.body);
				return response.send(data);
			} catch (error) {
				return next(error);
			}
		},
	);

	router.patch(
		"/items/:id",
		withValidation({ params: patchZoteroItemByIdParams, body: zoteroItemPatchInput }),
		async (request, response, next) => {
			try {
				const data = await zotero.patchItemById(request.params, request.body);
				return response.send(data);
			} catch (error) {
				return next(error);
			}
		},
	);

	router.get("/item-types", async (_request, response, next) => {
		try {
			const itemTypes = await zotero.getItemTypes();
			const itemTypeFields = Object.fromEntries(
				await Promise.all(
					itemTypes.map(({ itemType }) => {
						return zotero.getItemTypeFields({ itemType }).then((data) => {
							return [itemType, data];
						});
					}),
				),
			);
			const itemTypeCreators = Object.fromEntries(
				await Promise.all(
					itemTypes.map(({ itemType }) => {
						return zotero.getItemTypeCreators({ itemType }).then((data) => {
							return [itemType, data];
						});
					}),
				),
			);
			const data = {
				itemTypes,
				itemTypeFields,
				itemTypeCreators,
			};
			return response.send(data);
		} catch (error) {
			return next(error);
		}
	});

	return router;
}
