import { type RequestHandler } from "express";
import { type ZodSchema } from "zod";

import { ServerError } from "@server/errors/server-error";

interface Schemas {
	params?: ZodSchema;
	searchParams?: ZodSchema;
	body?: ZodSchema;
}

// TODO: improve type inference
export function withValidation(schemas: Schemas): RequestHandler {
	const withValidation: RequestHandler = async function withValidation(request, _response, next) {
		try {
			await schemas.params?.parseAsync(request.params);
			await schemas.searchParams?.parseAsync(request.query);
			await schemas.body?.parseAsync(request.body);

			return next();
		} catch {
			// TODO: HTTP 422?
			const error = new ServerError(400, "Bad request");

			return next(error);
		}
	};

	return withValidation;
}
