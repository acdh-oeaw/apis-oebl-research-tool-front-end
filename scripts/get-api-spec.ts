import "../server/polyfill";

import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { createUrl, log, request } from "@acdh-oeaw/lib";
import { z } from "zod";

const schema = z.object({
	VUE_APP_API_HOST: z.string().url(),
});

const env = schema.parse(process.env);

const url = createUrl({ pathname: "/apis/swagger/schema", baseUrl: env.VUE_APP_API_HOST });

const outputFilePath = join(process.cwd(), "api-spec.json");

request(url, { responseType: "json" })
	.then((json) => {
		return writeFile(outputFilePath, JSON.stringify(json), { encoding: "utf-8" });
	})
	.then(() => {
		log.info("Successfully fetched API spec.");
	})
	.catch(() => {
		log.error("Failed to fetch API spec.");
	});
