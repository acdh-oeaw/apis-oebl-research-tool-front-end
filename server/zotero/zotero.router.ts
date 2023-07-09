import { Router } from "express";

import { withValidation } from "../middlewares/with-validation";
import { createService as createZoteroService } from "./zotero.service";

export function createRouter() {
	const zotero = createZoteroService();

	const router = Router();

	// FIXME: why is the query string a path segment?
	router.get("/search/:query", async (request, response, next) => {
		try {
			const data = await zotero.getItems(request.params.query);
			return response.send(data);
		} catch (error) {
			return next(error);
		}
	});

	router.get("/item/:id", async (request, response, next) => {
		try {
			const data = await zotero.getItemById(request.params.id);
			return response.send(data);
		} catch (error) {
			return next(error);
		}
	});

	router.patch("/item/:id", async (request, response, next) => {
		try {
			const data = await zotero.patchItemById(request.params.id, request.body);
			return response.send(data);
		} catch (error) {
			return next(error);
		}
	});

	router.post("/item", async (request, response, next) => {
		try {
			const data = await zotero.createItem(request.body);
			return response.send(data);
		} catch (error) {
			return next(error);
		}
	});

	router.get("/initial-data", async (_request, response, next) => {
		try {
			const itemTypes = await zotero.getItemTypes();
			const itemTypeFields = Object.fromEntries(
				await Promise.all(
					itemTypes.map(({ itemType }) => {
						return zotero.getItemTypeFields(itemType).then((data) => {
							return [itemType, data];
						});
					}),
				),
			);
			const itemTypeCreators = Object.fromEntries(
				await Promise.all(
					itemTypes.map(({ itemType }) => {
						return zotero.getItemTypeCreators(itemType).then((data) => {
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
