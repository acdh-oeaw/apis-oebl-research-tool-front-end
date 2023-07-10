/* eslint-disable import/no-named-as-default-member */

import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";

import compression from "compression";
import cors from "cors";
import express from "express";

import { errorHandler } from "./middlewares/error-handler";
import { createRouter as createWebsocketRouter } from "./features/websocket/websocket.router";
import { createRouter as createZoteroRouter } from "./features/zotero/zotero.router";

const app = express();
const server = createServer(app);
const staticAssetsFolder = join(process.cwd(), "dist");
const indexHtml = readFileSync(join(staticAssetsFolder, "index.html"), { encoding: "utf-8" });

app.enable("trust proxy");
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "100mb" }));
app.use(["/", "/css", "/img", "/js"], express.static(staticAssetsFolder));
app.use("/message", createWebsocketRouter(server));
app.use("/zotero", createZoteroRouter());
app.use("*", (_request, response) => {
	return response.send(indexHtml);
});
app.use(errorHandler);

export { server };
