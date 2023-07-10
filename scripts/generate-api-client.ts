import { join } from "node:path";

import { createUrl, log, request } from "@acdh-oeaw/lib";
import { generate } from "openapi-typescript-codegen";

import { env } from "@/config/env";

const url = createUrl({
	baseUrl: env.VUE_APP_API_HOST,
	pathname: "/apis/swagger/schema",
});

const outputFolder = join(process.cwd(), "src", "api");
const requestFilePath = join(process.cwd(), "src", "service", "request.ts");

request(url, { responseType: "json" })
	.then((json: any) => {
		return generate({
			indent: "tab",
			input: json,
			output: outputFolder,
			request: requestFilePath,
		});
	})
	.then(() => {
		log.success("Successfully generated API client.");
	})
	.catch(() => {
		log.error("Failed to generate API client.");
	});
