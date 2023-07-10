import { Router } from "express";

import { createService as createZoteroService } from "@server/features/zotero/zotero.service";
import { withValidation } from "@server/middlewares/with-validation";

export function createRouter() {
	const zotero = createZoteroService();

	const router = Router();

	// FIXME: why is the query string a path segment?
	router.get("/items", async (request, response, next) => {
		try {
			const data = await zotero.getItems({ query: request.query.query });
			return response.send(data);
		} catch (error) {
			return next(error);
		}
	});

	router.get("/items/:id", async (request, response, next) => {
		try {
			const data = await zotero.getItemById({ id: request.params.id });
			return response.send(data);
		} catch (error) {
			return next(error);
		}
	});

	router.get("/item-template/:itemType", async (request, response, next) => {
		try {
			const data = await zotero.getItemTemplate({ itemType: request.params.itemType });
			return response.send(data);
		} catch (error) {
			return next(error);
		}
	});

	router.post("/items", async (request, response, next) => {
		try {
			const data = await zotero.createItem({ data: request.body });
			return response.send(data);
		} catch (error) {
			return next(error);
		}
	});

	router.put("/items/:id", async (request, response, next) => {
		try {
			const data = await zotero.updateItemById({ id: request.params.id, data: request.body });
			return response.send(data);
		} catch (error) {
			return next(error);
		}
	});

	router.patch("/items/:id", async (request, response, next) => {
		try {
			const data = await zotero.patchItemById({ id: request.params.id, data: request.body });
			return response.send(data);
		} catch (error) {
			return next(error);
		}
	});

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
