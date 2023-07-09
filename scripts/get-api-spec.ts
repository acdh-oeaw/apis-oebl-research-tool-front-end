import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { createUrl, log, request } from "@acdh-oeaw/lib";

import { env } from "@/config/env";

const url = createUrl({ pathname: "/apis/swagger/schema", baseUrl: env.VUE_APP_API_HOST });

const outputFilePath = join(process.cwd(), "api-spec.json");

request(url, { responseType: "json" })
	.then((json) => {
		return writeFile(outputFilePath, JSON.stringify(json), { encoding: "utf-8" });
	})
	.then(() => {
		log.success("Successfully fetched API spec.");
	})
	.catch(() => {
		log.error("Failed to fetch API spec.");
	});
