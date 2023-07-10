import { type Person as LdPerson } from "schema-dts";

import { type GenderAe0Enum } from "@/api/models/GenderAe0Enum";
import { type ListEntry } from "@/api/models/ListEntry";

export interface UserColumn {
	[key: string]: Array<string> | number | string;
}

export interface ServerResearchLemma extends ListEntry {
	id: number;
	columns_user: {
		[key: string]: number | string;
	};
	columns_scrape: {
		[source: string]:
			| {
					[key: string]: Array<string> | number | string;
			  }
			| [];
	};
}

export interface ProfessionGroup {
	id?: number;
	name?: string;
}

export interface FullName {
	firstName?: string | null;
	lastName?: string | null;
}

export interface SecondaryCitation {
	id?: number | null;
	title: string;
	pages?: string | null;
}

/**
 * Contains data, that can be provided by the user.
 */
export interface NewLemmaRow {
	list?: {
		id?: number;
		title: string;
		editor?: number;
	};
	columns_user: UserColumn;
	firstName?: string | null;
	lastName: string;
	alternativeNames: Array<FullName>;
	dateOfBirth: string | null;
	dateOfDeath: string | null;
	gender?: GenderAe0Enum;
	gnd: Array<string>;
	loc: number | null;
	viaf_id: number | null;
	professionDetail?: string | null;
	professionGroup?: ProfessionGroup | null;
	legacyGideonCitations?: Array<{ id: number; value: string }> | null;
	secondaryLiterature: Array<SecondaryCitation> | null;
	zoteroKeysBy: Array<string>;
	zoteroKeysAbout: Array<string>;
	bioNote?: string | null;
	kinship?: string | null;
	religion?: string | null;
	notes?: string | null;
}

/**
 * Contains data, that is provided by software.
 */
export interface LemmaRow extends NewLemmaRow {
	id: number;
	columns_scrape?: ServerResearchLemma["columns_scrape"];
	selected: boolean;
	wiki_edits: number | null;
	updated?: string | null;
}

export interface LemmaColumn {
	name: string;
	value: string | keyof LemmaRow;
	type: "array" | "boolean" | "link" | "number" | "text";
	filterable: boolean;
	show: boolean;
	getSimilarityFactor?: (a: LemmaRow, b: LemmaRow) => number;
	width?: number;
	sort?: "asc" | "desc" | null;
	isUserColumn: boolean;
	editable: boolean;
}

export interface LemmaFilterItem {
	comparator: LemmaFilterComparator["value"];
	query: string;
	column: LemmaColumn;
}

export interface LemmaFilterComparator {
	icon: string;
	name: string;
	value: string;
	predicate: (e: any, q: any) => boolean;
}

export interface Column {
	value: string | null;
	text: string;
	convert?: (e: number | string) => number | string;
}

export interface Header {
	matchWith: string | null;
	text: string;
	sortable: boolean;
	value: string;
}

export interface Row {
	[key: string]: number | string;
}
export type Table<T> = Array<T>;

export interface ImportablePerson {
	firstName?: string | null;
	lastName: string | null;
	dateOfBirth: string | null;
	dateOfDeath: string | null;
	gnd: Array<string>;
}

export interface PersonMatchable extends ImportablePerson {
	id: string;
	lobid: Array<LdPerson>;
	candidateSelected: number;
	loaded: boolean;
}

export interface PersonField {
	value: keyof ImportablePerson;
	text: string;
	hint?: string;
	rules?: Array<(e: string) => boolean>;
	convert?: (e: string) => Date | number | string | null;
}

export interface SelectOptions {
	text: string;
	value: string | null;
	disabled?: boolean;
}

export interface Filter {
	text: string;
	value: string;
	filter: (e: PersonMatchable) => boolean;
	count: number;
	color: string;
}
