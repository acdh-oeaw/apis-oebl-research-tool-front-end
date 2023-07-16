// this script removes unwanted imports from the auto generated open api file.
// we need it because the APIs schema is huge, and seems to blow up Webpack 5 (OOM error).

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const allowedServices = process.argv.slice(2);
console.log("allowedServices:", allowedServices);

const inputFilePath = join(process.cwd(), "./src/api/index.ts");
const serviceRegEx = /export \{ ((.)+Service) \} .+;/;
const fileContent = readFileSync(inputFilePath, { encoding: "utf-8" });
const lines = fileContent.split("\n");

const newLines = lines.map((l) => {
	const matches = serviceRegEx.exec(l);
	if (matches != null && !allowedServices.includes(matches[1]!.trim())) {
		// remove/comment out line
		return "// " + l;
	} else {
		// keep line
		return l;
	}
});

writeFileSync(inputFilePath, newLines.join("\n"), { encoding: "utf-8" });
