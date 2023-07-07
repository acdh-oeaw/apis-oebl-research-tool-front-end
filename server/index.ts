/* eslint-disable import/no-named-as-default-member */

import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";

import compression from "compression";
import cors from "cors";
import express from "express";
import fetch, { Headers } from "node-fetch";
import { Server, type Socket } from "socket.io";

import { env } from "./env";
import zotero from "./zotero";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: env.ALLOWED_ORIGIN } });

const staticAssetsFolder = join(process.cwd(), "dist");
const indexHtml = readFileSync(join(staticAssetsFolder, "index.html"), { encoding: "utf-8" });

app.enable("trust proxy");
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "100mb" }));
app.use(["/", "/css", "/img", "/js"], express.static("./dist"));

app.post("/message/import-issue-lemmas", (req, res) => {
	if (req.headers["x-secret"] === env.SERVICE_SECRET) {
		io.sockets.emit("importIssueLemmas", req.body);
		res.end();
	} else {
		res.status(401);
		res.end("out.");
	}
});

app.post("/message/import-lemmas", (req, res) => {
	if (req.headers["x-secret"] === env.SERVICE_SECRET) {
		io.sockets.emit("importLemmas", req.body);
		res.end();
	} else {
		res.status(401);
		res.end("out.");
	}
});

app.get("/zotero/search/:query", async (req, res) => {
	const x = await (
		await fetch(
			"https://api.zotero.org/users/" + env.ZOTERO_USER + "/items?q=" + req.params.query,
			{
				headers: {
					"Zotero-API-Key": env.ZOTERO_API_KEY,
				},
			},
		)
	).json();
	res.send(JSON.stringify(x));
});

app.get("/zotero/item/:id", async (request, response) => {
	const zoteroHeaders = new Headers();
	zoteroHeaders.set("Zotero-API-Key", env.ZOTERO_API_KEY);
	zoteroHeaders.set("Zotero-Api-Version", "3");
	zoteroHeaders.set("Content-Type", "application/json");

	if ("if-Modified-Since-Version" in request.headers) {
		zoteroHeaders.set(
			"if-Modified-Since-Version",
			String(request.headers["if-Modified-Since-Version"]),
		);
	}

	const zoteroResponse = await fetch(
		"https://api.zotero.org/users/" + env.ZOTERO_USER + "/items/" + request.params.id,
		{ headers: zoteroHeaders },
	);
	response.header["zoteroStatus"] = String(zoteroResponse.status);
	response.header["zoteroStatusText"] = zoteroResponse.statusText;

	let responseBody = null;
	if (zoteroResponse.status === 200) {
		responseBody = await zoteroResponse.json();
	}
	response.send(JSON.stringify(responseBody));
});

app.patch("/zotero/item/:id", async (req, res) => {
	const x = await fetch(
		"https://api.zotero.org/users/" + env.ZOTERO_USER + "/items/" + req.params.id,
		{
			method: "PATCH",
			body: JSON.stringify(req.body),
			headers: {
				"Zotero-API-Key": env.ZOTERO_API_KEY,
			},
		},
	);
	if (x.ok) {
		res.send(
			JSON.stringify({
				version: x.headers.get("Last-Modified-Version"),
			}),
		);
	} else {
		res.sendStatus(500);
	}
});

app.post("/zotero/item", async (req, res) => {
	const x = await fetch("https://api.zotero.org/users/" + env.ZOTERO_USER + "/items/", {
		method: "POST",
		body: JSON.stringify(req.body),
		headers: {
			"Zotero-API-Key": env.ZOTERO_API_KEY,
		},
	});
	if (x.ok) {
		res.send(JSON.stringify(await x.json()));
	} else {
		res.sendStatus(500);
	}
});

app.get("/zotero/initial-data", async (req, res) => {
	const itemTypes = await zotero.getItemTypes();
	res.send(
		JSON.stringify({
			itemTypes,
			itemTypeFields: await zotero.getItemTypeFields(itemTypes),
			itemTypeCreators: await zotero.getItemTypeCreators(itemTypes),
		}),
	);
});

app.use("*", (req, res) => res.send(indexHtml));

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
