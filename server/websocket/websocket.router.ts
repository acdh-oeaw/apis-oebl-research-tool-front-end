import { type Server as HttpServer } from "node:http";

import { Router } from "express";
import { Server, type Socket } from "socket.io";

import { env } from "../config/env";
import { withAuthentication } from "../middlewares/with-authentication";
import { withValidation } from "../middlewares/with-validation";

export function createRouter(server: HttpServer) {
	const io = new Server(server, { cors: { origin: env.ALLOWED_ORIGIN } });

	io.on("connection", (socket: Socket) => {
		socket.send("message", "connected to socket server");

		/** Broadcast all messages to all connected users. */
		socket.onAny((name, ...m) => {
			socket.broadcast.emit(name, ...m);
		});
	});

	const router = Router();

	router.post("/import-issue-lemmas", withAuthentication, (request, response) => {
		io.sockets.emit("importIssueLemmas", request.body);

		return response.end();
	});

	router.post("/import-lemmas", withAuthentication, (request, response) => {
		io.sockets.emit("importLemmas", request.body);

		return response.end();
	});

	return router;
}
