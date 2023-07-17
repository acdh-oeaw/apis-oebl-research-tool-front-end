/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { ApiError } from "@/api/core/ApiError";
import { type ApiRequestOptions } from "@/api/core/ApiRequestOptions";
import { type ApiResult } from "@/api/core/ApiResult";
import { OpenAPI } from "@/api/core/OpenAPI";

import store from "@/store";
import confirm from "@/store/confirm";

/**
 * These were added or changed compared to the upstream request module:
 * - `requestState` added
 * - `beforeunload` event added
 * - token authentication changed to use "Token" prefix instead of "Bearer" to
 *   align with django restframework
 * - active request counting in `request` funtion
 * - changes to error handling in `request` function
 */

export const requestState = {
	countWriteRequests: 0,
	countRequests: 0,
	hasErrored: false,
	get isLoading() {
		return this.countWriteRequests > 0 || this.countRequests > 0;
	},
};

function warnBeforeLeave(event: BeforeUnloadEvent): string | undefined {
	if (requestState.countWriteRequests > 0) {
		const confirmationMessage =
			"Synchronisierung läuft noch. Beim Beenden können Änderungen verloren gehen. Wirklich beenden?";
		event.returnValue = confirmationMessage;
		return confirmationMessage;
	}
}

window.addEventListener("beforeunload", warnBeforeLeave);

//

function isDefined<T>(value: T | null | undefined): value is Exclude<T, null | undefined> {
	return value != null && value != null;
}

function isString(value: any): value is string {
	return typeof value === "string";
}

function isStringWithValue(value: any): value is string {
	return isString(value) && value !== "";
}

function isBlob(value: any): value is Blob {
	return value instanceof Blob;
}

function getQueryString(params: Record<string, any>): string {
	const qs: string[] = [];
	Object.keys(params).forEach((key) => {
		const value = params[key];
		if (isDefined(value)) {
			if (Array.isArray(value)) {
				value.forEach((value) => {
					qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
				});
			} else {
				qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
			}
		}
	});
	if (qs.length > 0) {
		return `?${qs.join("&")}`;
	}
	return "";
}

function getUrl(options: ApiRequestOptions): string {
	const path = options.path.replace(/[:]/g, "_");
	const url = `${OpenAPI.BASE}${path}`;

	if (options.query) {
		return `${url}${getQueryString(options.query)}`;
	}
	return url;
}

function getFormData(params: Record<string, any>): FormData {
	const formData = new FormData();
	Object.keys(params).forEach((key) => {
		const value = params[key];
		if (isDefined(value)) {
			formData.append(key, value);
		}
	});
	return formData;
}

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;

async function resolve<T>(
	options: ApiRequestOptions,
	resolver?: T | Resolver<T>,
): Promise<T | undefined> {
	if (typeof resolver === "function") {
		return (resolver as Resolver<T>)(options);
	}
	return resolver;
}

async function getHeaders(options: ApiRequestOptions): Promise<Headers> {
	const token = await resolve(options, OpenAPI.TOKEN);
	const username = await resolve(options, OpenAPI.USERNAME);
	const password = await resolve(options, OpenAPI.PASSWORD);
	const defaultHeaders = await resolve(options, OpenAPI.HEADERS);

	const headers = new Headers({
		Accept: "application/json",
		...defaultHeaders,
		...options.headers,
	});

	if (isStringWithValue(token)) {
		headers.append("Authorization", `Token ${token}`);
	}

	if (isStringWithValue(username) && isStringWithValue(password)) {
		const credentials = btoa(`${username}:${password}`);
		headers.append("Authorization", `Basic ${credentials}`);
	}

	if (options.body) {
		if (isBlob(options.body)) {
			headers.append("Content-Type", options.body.type || "application/octet-stream");
		} else if (isString(options.body)) {
			headers.append("Content-Type", "text/plain");
		} else {
			headers.append("Content-Type", "application/json");
		}
	}
	return headers;
}

function getRequestBody(options: ApiRequestOptions): BodyInit | undefined {
	if (options.formData) {
		return getFormData(options.formData);
	}
	if (options.body) {
		if (isString(options.body) || isBlob(options.body)) {
			return options.body;
		} else {
			return JSON.stringify(options.body);
		}
	}
	return undefined;
}

async function sendRequest(options: ApiRequestOptions, url: string): Promise<Response> {
	const request: RequestInit = {
		method: options.method,
		headers: await getHeaders(options),
		body: getRequestBody(options),
	};
	if (OpenAPI.WITH_CREDENTIALS) {
		request.credentials = "include";
	}
	return await fetch(url, request);
}

function getResponseHeader(response: Response, responseHeader?: string): string | null {
	if (responseHeader) {
		const content = response.headers.get(responseHeader);
		if (isString(content)) {
			return content;
		}
	}
	return null;
}

async function getResponseBody(response: Response): Promise<any> {
	try {
		const contentType = response.headers.get("Content-Type");
		if (contentType) {
			const isJSON = contentType.toLowerCase().startsWith("application/json");
			if (isJSON) {
				return await response.json();
			} else {
				return await response.text();
			}
		}
	} catch (error) {
		console.error(error);
	}
	return null;
}

function catchErrors(options: ApiRequestOptions, result: ApiResult): void {
	const errors: Record<number, string> = {
		400: "Bad Request",
		401: "Unauthorized",
		403: "Forbidden",
		404: "Not Found",
		500: "Internal Server Error",
		502: "Bad Gateway",
		503: "Service Unavailable",
		...options.errors,
	};

	const error = errors[result.status];
	if (error) {
		throw new ApiError(result, error);
	}

	if (!result.ok) {
		throw new ApiError(result, "Generic Error");
	}
}

/**
 * Request using fetch client
 * @param options The request options from the the service
 * @returns ApiResult
 * @throws ApiError
 */
export async function request(options: ApiRequestOptions): Promise<ApiResult> {
	const isWriteRequest = ["delete", "patch", "post", "put"].includes(options.method.toLowerCase());

	if (isWriteRequest) {
		requestState.countWriteRequests++;
	}
	requestState.countRequests++;

	//

	const url = getUrl(options);
	const response = await sendRequest(options, url);
	const responseBody = await getResponseBody(response);
	const responseHeader = getResponseHeader(response, options.responseHeader);

	const result: ApiResult = {
		url,
		ok: response.ok,
		status: response.status,
		statusText: response.statusText,
		body: responseHeader || responseBody,
	};

	//

	if (isWriteRequest) {
		requestState.countWriteRequests--;
	}
	requestState.countRequests--;

	//

	if (result.ok) {
		return result;
	} else {
		if (result.status === 401) {
			store.isLoggedIn = false;

			console.log("Unauthorized Access. Waiting for log-in before continuing.");

			return new Promise((resolve, reject) => {
				store.onLoginSuccess(async () => {
					return request(options).then(resolve).catch(reject);
				});
			});
		} else {
			requestState.hasErrored = true;

			console.error(result);

			await confirm.confirm("Serverfehler. Details in der Console.", {
				showCancel: false,
				icon: "mdi-error",
			});

			return result;
		}
	}
}
