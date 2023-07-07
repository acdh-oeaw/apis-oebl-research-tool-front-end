/**
 * This script removes unwanted imports from the auto-generated API client.
 * We need this because the API schema is huge, and it seems to blow up Webpack 5 (OOM error).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { log } from "@acdh-oeaw/lib";

const allowedServices = process.argv.slice(2);
log.info("Selected services from API client:", allowedServices);

const inputFilePath = join(process.cwd(), "./src/api/index.ts");
const serviceRegEx = /export \{ ((.)+Service) \} .+;/;
const fileContent = readFileSync(inputFilePath, { encoding: "utf-8" });
const lines = fileContent.split("\n");

const newLines = lines.map((l) => {
	const matches = serviceRegEx.exec(l);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	if (matches !== null && !allowedServices.includes(matches[1]!.trim())) {
		// remove/comment out line
		return "// " + l;
	} else {
		// keep line
		return l;
	}
});

writeFileSync(inputFilePath, newLines.join("\n"), { encoding: "utf-8" });
