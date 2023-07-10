/** Note that `month` starts from `1`. */
export function getDaysInMonth(year: number, month: number) {
	return new Date(year, month, 0).getDate();
}
