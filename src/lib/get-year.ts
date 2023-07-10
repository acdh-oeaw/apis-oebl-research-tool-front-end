export function getYear(date: string | null | undefined): number | null {
	if (date == null) return null;

	try {
		return new Date(date).getUTCFullYear();
	} catch {
		return null;
	}
}
