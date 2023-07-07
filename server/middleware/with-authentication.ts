import { type RequestHandler } from "express";

import { env } from "../env";
import { ServerError } from "../errors/server-error";

export const withAuthentication: RequestHandler = function withAuthentication(
	request,
	_response,
	next,
) {
	if (request.headers["x-secret"] !== env.SERVICE_SECRET) {
		const error = new ServerError(401, "Unauthorized");

		return next(error);
	}

	return next();
};
