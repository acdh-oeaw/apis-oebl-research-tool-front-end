import { HttpError } from "@acdh-oeaw/lib";
import { type ErrorRequestHandler } from "express";

import { ServerError } from "@server/errors/server-error";

export const errorHandler: ErrorRequestHandler = function errorHandler(
	error,
	_request,
	response,
	next,
) {
	if (response.headersSent) {
		return next(error);
	}

	const { message, statusCode } =
		error instanceof HttpError
			? { message: error.response.statusText, statusCode: error.response.status }
			: error instanceof ServerError
			? { message: error.message, statusCode: error.statusCode }
			: { message: "Internal server error", statusCode: 500 };

	return response.status(statusCode).send({ message });
};
