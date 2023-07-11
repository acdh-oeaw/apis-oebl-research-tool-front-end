import { type Server as HttpServer } from "node:http";

import { Router } from "express";
import { Server, type Socket } from "socket.io";

import { env } from "@server/config/env";
import { withAuthentication } from "@server/features/websocket/authentication.middleware";
import { issueLemmas, lemmas } from "@server/features/websocket/websocket.schema";
import { withValidation } from "@server/middlewares/with-validation";

export function createRouter(server: HttpServer) {
	const io = new Server(server, { cors: { origin: env.ALLOWED_ORIGIN } });

	io.on("connection", (socket: Socket) => {
		socket.send("message", "Connected to socket server.");

		/** Broadcast all messages to all connected users. */
		socket.onAny((name, ...m) => {
			socket.broadcast.emit(name, ...m);
		});
	});

	const router = Router();

	router.use(withAuthentication);

	/**
	 * This endpoint is used by the django backend to push updates to connected clients.
	 */
	router.post("/import-lemmas", withValidation({ body: lemmas }), (request, response) => {
		io.sockets.emit("importLemmas", request.body);

		return response.end();
	});

	/**
	 * This endpoint is used by the django backend to push updates to connected clients.
	 */
	router.post(
		"/import-issue-lemmas",
		withValidation({ body: issueLemmas }),
		(request, response) => {
			io.sockets.emit("importIssueLemmas", request.body);

			return response.end();
		},
	);

	return router;
}
