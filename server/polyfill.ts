/* eslint-disable no-var, @typescript-eslint/no-unnecessary-condition */
import fetchPolyfill, {
	Headers as HeadersPolyfill,
	Request as RequestPolyfill,
	Response as ResponsePolyfill,
} from "node-fetch";

if (!globalThis.fetch) {
	globalThis.fetch ||= fetchPolyfill;
	globalThis.Headers ||= HeadersPolyfill;
	globalThis.Request ||= RequestPolyfill;
	globalThis.Response ||= ResponsePolyfill;
}

declare global {
	namespace globalThis {
		var fetch: typeof fetchPolyfill;
		var Headers: typeof HeadersPolyfill;
		var Request: typeof RequestPolyfill;
		var Response: typeof ResponsePolyfill;
	}
}
