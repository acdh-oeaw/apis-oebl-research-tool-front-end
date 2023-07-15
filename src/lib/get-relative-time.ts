// eslint-disable-next-line import/no-duplicates
import { formatDistanceToNow } from "date-fns";
// eslint-disable-next-line import/no-duplicates
import { de } from "date-fns/locale";

export function getRelativeTime(date: string | null | undefined): string | null {
	if (date == null) return null;

	try {
		return formatDistanceToNow(new Date(date), { addSuffix: true, locale: de });
	} catch {
		return null;
	}
}
