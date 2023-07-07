/* eslint-disable import/no-named-as-default-member */

import "./polyfill";

import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";

import compression from "compression";
import cors from "cors";
import express from "express";
import { Server, type Socket } from "socket.io";

import { env } from "./env";
import { errorHandler } from "./middleware/error-handler";
import { withAuthentication } from "./middleware/with-authentication";
import { withValidation } from "./middleware/with-validation";
import { api as zotero } from "./services/zotero.service";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: env.ALLOWED_ORIGIN } });

const staticAssetsFolder = join(process.cwd(), "dist");
const indexHtml = readFileSync(join(staticAssetsFolder, "index.html"), { encoding: "utf-8" });

app.enable("trust proxy");
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "100mb" }));
app.use(["/", "/css", "/img", "/js"], express.static(staticAssetsFolder));

app.post("/message/import-issue-lemmas", withAuthentication, (request, response) => {
	io.sockets.emit("importIssueLemmas", request.body);
	return response.end();
});

app.post("/message/import-lemmas", withAuthentication, (request, response) => {
	io.sockets.emit("importLemmas", request.body);
	return response.end();
});

// FIXME: why is the query string a path segment?
app.get("/zotero/search/:query", async (request, response, next) => {
	try {
		const data = await zotero.getItems(request.params.query);
		return response.send(data);
	} catch (error) {
		return next(error);
	}
});

app.get("/zotero/item/:id", async (request, response, next) => {
	try {
		const data = await zotero.getItemById(request.params.id);
		return response.send(data);
	} catch (error) {
		return next(error);
	}
});

app.patch("/zotero/item/:id", async (request, response, next) => {
	try {
		const data = await zotero.patchItemById(request.params.id, request.body);
		return response.send(data);
	} catch (error) {
		return next(error);
	}
});

app.post("/zotero/item", async (request, response, next) => {
	try {
		const data = await zotero.createItem(request.body);
		return response.send(data);
	} catch (error) {
		return next(error);
	}
});

app.get("/zotero/initial-data", async (_request, response, next) => {
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

app.use("*", (_request, response) => {
	return response.send(indexHtml);
});

app.use(errorHandler);

io.on("connection", (socket: Socket) => {
	socket.send("message", "connected to socket server");
	/** Broadcast all messages to all connected users. */
	socket.onAny((name, ...m) => {
		socket.broadcast.emit(name, ...m);
	});
});

server.listen(env.PORT, () => {
	// eslint-disable-next-line no-console
	console.info("🚀 ", `Server listening on port ${env.PORT}.`);
});
