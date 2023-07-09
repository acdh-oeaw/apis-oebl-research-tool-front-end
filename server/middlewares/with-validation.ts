import { type RequestHandler } from "express";
import { type ZodSchema } from "zod";

import { ServerError } from "../errors/server-error";

export function withValidation(schema: ZodSchema): RequestHandler {
	const withValidation: RequestHandler = function withValidation(request, _response, next) {
		try {
			schema.parse(request.body);

			return next();
		} catch {
			const error = new ServerError(400, "Bad request");

			return next(error);
		}
	};

	return withValidation;
}
