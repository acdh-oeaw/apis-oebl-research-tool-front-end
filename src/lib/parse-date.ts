import { isNonEmptyString } from "@acdh-oeaw/lib";
import { isValid } from "date-fns";

export function parseDate(value: unknown): Date | null {
	if (!isNonEmptyString(value)) return null;

	const date = new Date(value);

	if (isValid(date)) return date;

	return null;
}
