import type * as undici from "undici";

/**
 * Types for the fetch api are currently missing from `@types/node`.
 *
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
 */

declare global {
	export const { FormData, Headers, Request, Response, fetch }: typeof undici;

	type FormData = undici.FormData;
	type Headers = undici.Headers;
	type Request = undici.Request;
	type Response = undici.Response;
}
