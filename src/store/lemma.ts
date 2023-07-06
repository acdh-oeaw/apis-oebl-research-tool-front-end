/* eslint-disable @typescript-eslint/camelcase */
import Dexie from "dexie";
import _ from "lodash";

import {
	type Editor,
	type GenderAe0Enum,
	type IssueLemma,
	type List as LemmaList,
	type List,
	ResearchService,
} from "@/api";
import notifyService from "@/service/notify/notify";
import { type WithId } from "@/types";
import {
	type FullName,
	type ImportablePerson,
	type LemmaColumn,
	type LemmaFilterComparator,
	LemmaFilterItem,
	type LemmaRow,
	type SecondaryCitation,
	type SerializedLemmaRow,
	type ServerResearchLemma,
} from "@/types/lemma";
import { DateContainer } from "@/util/dates";

import { lemmaRowTranslations } from "../util/labels";
import store from ".";
import { type UserProfile } from "./user";

interface LemmaFilter {
	id: string;
	name: string;
	filterItems: { [key: string]: boolean | string | null };
}

function serializeLemmaRow(lemmaRow: LemmaRow): SerializedLemmaRow {
	const copy: any = { ...lemmaRow };
	if (lemmaRow.dateOfBirth) {
		copy.dateOfBirth = new DateContainer(
			lemmaRow.dateOfBirth.calendarYear,
			lemmaRow.dateOfBirth.calendarMonth,
			lemmaRow.dateOfBirth.calendarDate,
		).generateISO_OnlyDate();
	}
	if (lemmaRow.dateOfDeath) {
		copy.dateOfDeath = new DateContainer(
			lemmaRow.dateOfDeath.calendarYear,
			lemmaRow.dateOfDeath.calendarMonth,
			lemmaRow.dateOfDeath.calendarDate,
		).generateISO_OnlyDate();
	}
	return copy;
}

export function unserializeLemmaRow(serializedLemmaRow: SerializedLemmaRow): LemmaRow {
	return {
		...serializedLemmaRow,
		dateOfBirth: DateContainer.fromISO_OnlyDate(serializedLemmaRow.dateOfBirth),
		dateOfDeath: DateContainer.fromISO_OnlyDate(serializedLemmaRow.dateOfDeath),
	};
}

export function getValueFromLemmaRowByColumn(row: LemmaRow, column: LemmaColumn) {
	if (column.isUserColumn) {
		return row.columns_user[column.value];
	}
	return row[column.value as keyof LemmaRow]; // Yeaaah :-(
}

// if incremented, the local DBs will be wiped and repopulated from the server.
const currentDbVersion = "2.0";

export class LemmaDatabase extends Dexie {
	public lemmas: Dexie.Table<SerializedLemmaRow, number>;
	public constructor() {
		super("LemmaDb", { allowEmptyDB: true });
		this.version(8).stores({
			lemmas:
				"id,firstName,lastName,gender,dateOfBirth,dateOfDeath,gnd,loc,viaf_id,selected,bioNote,kinship,religion",
		});
		this.lemmas = this.table("lemmas");
	}
}

export default class LemmaStore {
	private localDb = new LemmaDatabase();

	private _lemmas: Array<LemmaRow> = [];
	private _lemmaLists: Array<LemmaList> = [];
	private _columns: Array<LemmaColumn> = [];

	private _selectedLemmaListId: number | null = null;
	private _selectedLemmaFilterId: string | null = null;
	private _selectedLemmaIssueId: number | null = null;
	private _selectedLemmas: Array<LemmaRow> = [];

	private _storedLemmaFilters: Array<LemmaFilter> = [];

	public currentFilters: { [key: string]: boolean | string | null } = {};
	public importStatus = {
		target: 0,
		status: 0,

		incrementTarget(n: number) {
			this.target = this.target + n;
		},

		incrementStatus(ls: Array<LemmaRow>) {
			const userLemmasCount = ls.filter(
				(l) => l.list !== undefined && l.list.editor === store.user.userProfile.userId,
			).length;
			this.status = this.status + userLemmasCount;
			// reset if we’re finished
			if (this.target === this.status) {
				this.target = 0;
				this.status = 0;
			}
		},

		get progress() {
			return this.status / this.target;
		},

		get isImporting() {
			return this.target !== 0 && !isNaN(this.progress) && this.progress !== 1;
		},
	};

	public showSideBar = true;
	public selectedIssueLemmas: Array<WithId<IssueLemma>> = [];
	public newLemmasInUserList: {
		[listId: number]: { [lemmaId: number]: { editor: Editor; item: LemmaRow } };
	} = {};

	readonly comparators: Array<LemmaFilterComparator> = [
		{
			icon: "∈",
			name: "enthält",
			value: "contains",
			predicate: (e: number | string | null, q: string) =>
				String(e).toLocaleLowerCase().indexOf(q) > -1,
		},
		{
			name: "enthält nicht",
			value: "not-contains",
			icon: "∉",
			predicate: (e: number | string | null, q: string) =>
				String(e).toLocaleLowerCase().indexOf(q) === -1,
		},
		{
			name: "ist",
			value: "equals",
			icon: "=",
			predicate: (e: number | string | null, q: number | string | null) =>
				String(e).toLocaleLowerCase() === String(q).toLocaleLowerCase(),
		},
		{
			name: "ist nicht",
			value: "not",
			icon: "≠",
			predicate: (e: number | string | null, q: number | string | null) =>
				String(e).toLocaleLowerCase() !== String(q).toLocaleLowerCase(),
		},
		{
			name: "ist vorhanden",
			value: "exists",
			icon: ".",
			predicate: (e: Array<number> | number | string | null, q: unknown) =>
				e !== "" &&
				e !== null &&
				e !== undefined &&
				e !== "Not available" &&
				e !== "None" &&
				(Array.isArray(e) ? e : []).length > 0,
		},
		{
			name: "ist nicht vorhanden",
			value: "exists-not",
			icon: ".",
			predicate: (e: Array<number> | number | string | null, q: unknown) => !e,
		},
		{
			name: "größer als",
			value: "gt",
			icon: ">",
			predicate: (e: number, q: number) => e > q,
		},
		{
			name: "größer gleich",
			value: "gte",
			icon: "≥",
			predicate: (e: number, q: number) => e >= q,
		},
		{
			name: "kleiner als",
			value: "lt",
			icon: "<",
			predicate: (e: number, q: number) => e < q,
		},
		{
			name: "kleiner gleich",
			value: "lte",
			icon: "≤",
			predicate: (e: number, q: number) => e <= q,
		},
	];

	public defaultColumns: Array<LemmaColumn> = [
		{
			name: lemmaRowTranslations.selected.de,
			value: "selected",
			type: "boolean",
			filterable: true,
			show: true,
			width: 70,
			isUserColumn: false,
			editable: false,
		},
		{
			name: lemmaRowTranslations.lastName.de,
			value: "lastName",
			type: "text",
			filterable: true,
			show: true,
			isUserColumn: false,
			editable: true,
		},
		{
			name: lemmaRowTranslations.firstName.de,
			value: "firstName",
			type: "text",
			filterable: true,
			show: true,
			isUserColumn: false,
			editable: true,
		},
		{
			name: lemmaRowTranslations.lastName.de,
			value: "gender",
			type: "text",
			filterable: true,
			show: true,
			isUserColumn: false,
			editable: true,
		},
		{
			name: lemmaRowTranslations.dateOfBirth.de,
			value: "dateOfBirth",
			type: "text",
			filterable: true,
			show: true,
			isUserColumn: false,
			editable: false,
		},
		{
			name: lemmaRowTranslations.dateOfDeath.de,
			value: "dateOfDeath",
			type: "text",
			filterable: true,
			show: true,
			isUserColumn: false,
			editable: false,
		},
		{
			name: lemmaRowTranslations.gnd.de,
			value: "gnd",
			type: "array",
			filterable: true,
			show: true,
			isUserColumn: false,
			editable: false,
		},
		{
			name: lemmaRowTranslations.loc.de,
			value: "loc",
			type: "link",
			filterable: true,
			show: false,
			isUserColumn: false,
			editable: false,
		},
		{
			name: lemmaRowTranslations.viaf_id.de,
			value: "viaf_id",
			type: "link",
			filterable: true,
			show: false,
			isUserColumn: false,
			editable: false,
		},
		{
			name: lemmaRowTranslations.wiki_edits.de,
			value: "wiki_edits",
			type: "number",
			filterable: true,
			show: false,
			isUserColumn: false,
			editable: false,
		},
		{
			name: lemmaRowTranslations.professionGroup.de,
			value: "professionGroup",
			type: "text",
			filterable: true,
			show: true,
			isUserColumn: false,
			editable: false,
		},
		{
			name: lemmaRowTranslations.professionDetail.de,
			value: "professionDetail",
			type: "text",
			filterable: true,
			show: true,
			isUserColumn: false,
			editable: true,
		},
		{
			name: lemmaRowTranslations.id.de,
			value: "id",
			type: "number",
			filterable: true,
			show: false,
			isUserColumn: false,
			editable: false,
		},
	];

	constructor() {
		this.initLemmaData();
		this.loadRemoteLemmaLists();
		this.listenForRemoteEvents();
	}

	doesUpdateDescribeListChange(ls: Array<LemmaRow>, update: Partial<LemmaRow>): boolean {
		return (
			update.list !== undefined &&
			update.list !== undefined &&
			update.list.id !== undefined &&
			ls.length > 0 &&
			ls[0].list !== undefined &&
			ls[0].list.id !== update.list.id
		);
	}

	getUserLists(lists: Array<List>, u: UserProfile): Array<List> {
		return lists.filter((ll) => {
			return ll.editor !== undefined && ll.editor.userId === u.userId;
		});
	}

	isMovementToUserList(ls: Array<LemmaRow>, update: Partial<LemmaRow>): boolean {
		return (
			this.doesUpdateDescribeListChange(ls, update) &&
			this.getUserLists(this.lemmaLists, store.user.userProfile).some(
				(ll) => ll.id === update.list?.id,
			)
		);
	}

	listenForRemoteEvents() {
		this.listenForRemoteLemmaUpdates();
		this.listenForRemoteListUpdates();
		this.listenForRemoteImports();
		this.listenForRemoteLemmaCreation();
	}

	listenForRemoteListUpdates() {
		notifyService.on("deleteLemmaList", (l) => this.deleteLemmaListLocally(l.id!));
		notifyService.on("createLemmaList", (l) => this.addLemmaListLocally(l));
		notifyService.on("updateLemmaList", (l) => this.updateLemmaListLocally(l.id!, l));
	}

	listenForRemoteImports() {
		notifyService.on("importLemmas", (ls) => {
			// convert to local type
			const rows = ls.map(this.convertRemoteLemmaToLemmaRow);
			// insert the lemmas
			this.upsertLemmasLocally(rows);
			// update the status
			this.importStatus.incrementStatus(rows);
		});
	}

	listenForRemoteLemmaCreation() {
		notifyService.on("addLemma", (lemma) => {
			this.upsertLemmasLocally([lemma]);
		});
	}

	listenForRemoteLemmaUpdates() {
		notifyService.on("updateLemmas", (lemmas, updates, e) => {
			const updatedLemmas = this.updateLemmas(lemmas, updates, false);
			if (this.isMovementToUserList(lemmas, updates)) {
				if (updates.list?.id !== undefined) {
					const lemmasWithEditor = lemmas.map((l) => ({ editor: e, item: l }));
					this.newLemmasInUserList[updates.list.id] = {
						...this.newLemmasInUserList[updates.list.id],
						..._.keyBy(lemmasWithEditor, (e) => e.item.id),
					};
				}
			}
		});
		notifyService.on("deleteLemmas", (ls) => this.deleteLemmasLocally(ls));
	}

	set lastLemmaFetchDate(d) {
		localStorage.setItem("lastLemmaFetchDate", JSON.stringify(d));
	}

	get lastLemmaFetchDate(): Date | null {
		const stored = JSON.parse(localStorage.getItem("lastLemmaFetchDate") || "null");
		if (stored !== null) {
			return new Date(stored);
		} else {
			return null;
		}
	}

	get columns() {
		const stored = JSON.parse(localStorage.getItem("columns") || "null");
		this._columns = stored || this.defaultColumns;
		return this._columns;
	}

	set columns(cs) {
		this._columns = cs;
		localStorage.setItem("columns", JSON.stringify(cs));
	}

	get storedLemmaFilters() {
		this._storedLemmaFilters = JSON.parse(localStorage.getItem("storedLemmaFilters") || "[]");
		return this._storedLemmaFilters;
	}

	set storedLemmaFilters(ls: Array<LemmaFilter>) {
		this._storedLemmaFilters = ls;
		localStorage.setItem("storedLemmaFilters", JSON.stringify(ls));
	}

	get lemmaLists(): Array<LemmaList & { count?: number; countNew?: number }> {
		return this._lemmaLists.map((ll) => {
			return {
				...ll,
				count: this._lemmas.filter((l) => l.list?.id === ll.id).length,
				countNew:
					ll.id !== undefined ? Object.keys(this.newLemmasInUserList[ll.id] || {}).length : 0,
			};
		});
	}

	set lemmaLists(ll) {
		this._lemmaLists = ll;
	}

	get lemmaCount() {
		return this._lemmas.length;
	}

	get selectedLemmas() {
		const localSelectedLemmasJSON = localStorage.getItem("selectedLemmas");
		const localSelectedLemmasObjects: Array<SerializedLemmaRow> = localSelectedLemmasJSON
			? JSON.parse(localSelectedLemmasJSON)
			: [];
		const unserializedSelectedLemmas = localSelectedLemmasObjects.map(unserializeLemmaRow);
		this._selectedLemmas = unserializedSelectedLemmas;
		return this._selectedLemmas;
	}

	set selectedLemmas(lemmas: Array<LemmaRow>) {
		this._selectedLemmas = lemmas;
		localStorage.setItem("selectedLemmas", JSON.stringify(lemmas.map(serializeLemmaRow)));
	}

	get selectedLemmaIssueId() {
		return this._selectedLemmaIssueId;
	}

	set selectedLemmaIssueId(id) {
		this._selectedLemmaListId = null;
		this._selectedLemmaFilterId = null;
		this._selectedLemmaIssueId = id;
	}

	get selectedLemmaListId() {
		return this._selectedLemmaListId;
	}

	set selectedLemmaListId(val) {
		this._selectedLemmaIssueId = null;
		this._selectedLemmaFilterId = null;
		this._selectedLemmaListId = val;
	}

	get selectedLemmaFilterId() {
		return this._selectedLemmaFilterId;
	}

	set selectedLemmaFilterId(val) {
		this._selectedLemmaIssueId = null;
		this._selectedLemmaListId = null;
		this._selectedLemmaFilterId = val;
	}

	getStoredLemmaFilterById(id: string) {
		return this._storedLemmaFilters.find((f) => f.id === id);
	}

	deleteStoredLemmaFilter(id: string) {
		this.storedLemmaFilters = this.storedLemmaFilters.filter((f) => f.id !== id);
	}

	updateStoredLemmaFilter(id: string, u: Partial<LemmaFilter>): LemmaFilter | undefined {
		this.storedLemmaFilters = this.storedLemmaFilters.map((f) => {
			return f.id === id ? { ...f, ...u } : f;
		});
		return this.getStoredLemmaFilterById(id);
	}

	async addLemmasToList(list: LemmaRow["list"], lemmas: Array<LemmaRow>) {
		if (list === undefined) {
			return;
		}
		await this.updateLemmas(lemmas, { list });
	}

	private async updateLemmasInIndexedDB(newLemmas: Array<LemmaRow>): Promise<void> {
		const serializedLemmas = newLemmas.map(serializeLemmaRow);
		try {
			await this.localDb.lemmas.bulkPut(serializedLemmas);
		} catch (error) {
			console.error({ catchedError: error });
		}
	}

	private async updateLemmasOnServer(newLemmas: Array<LemmaRow>) {
		const serializedLemmas = newLemmas.map(serializeLemmaRow);
		await Promise.all(
			serializedLemmas.map(async (lemma) => {
				await ResearchService.researchApiV1LemmaresearchPartialUpdate(lemma.id, {
					...lemma,
					firstName: lemma.firstName === null ? undefined : lemma.firstName,
				});
			}),
		);
	}

	private mergeUpdates(
		updateThisLemmas: Array<LemmaRow>,
		withThisUpdate: Partial<LemmaRow>,
	): Array<LemmaRow> {
		return updateThisLemmas.map((lemmaRow) => {
			return { ...lemmaRow, ...withThisUpdate };
		});
	}

	private rightMergeLemmas(
		oldLemmas: Array<LemmaRow>,
		newLemmas: Array<LemmaRow>,
	): Array<LemmaRow> {
		const newIds = newLemmas.map((lemma) => lemma.id);
		const unchangingLemmas = oldLemmas.filter((lemma) => !newIds.includes(lemma.id));
		return unchangingLemmas.concat(newLemmas);
	}

	private innerMergeLemmas(
		oldLemmas: Array<LemmaRow>,
		updateLemmas: Array<LemmaRow>,
	): Array<LemmaRow> {
		const oldIds = oldLemmas.map((lemma) => lemma.id);
		const updateIds = updateLemmas.map((lemma) => lemma.id);

		const unchangingLemmas = oldLemmas.filter((lemma) => !updateIds.includes(lemma.id));
		const updatesToApply = updateLemmas.filter((lemma) => oldIds.includes(lemma.id));

		return unchangingLemmas.concat(updatesToApply);
	}

	/**
	 * Bulk Update All Lemmas With One Update
	 *
	 * @param updateThisLemmas
	 * @param withThisUpdate
	 */
	async updateLemmas(
		updateThisLemmas: Array<LemmaRow>,
		withThisUpdate: Partial<LemmaRow>,
		global = true,
	): Promise<Array<LemmaRow>> {
		const newLemmas = this.mergeUpdates(updateThisLemmas, withThisUpdate);
		// optimistic update: Change, even if others fail
		await this.upsertLemmasLocally(newLemmas);

		if (global) {
			await this.updateLemmasOnServer(newLemmas);
			notifyService.emit("updateLemmas", updateThisLemmas, withThisUpdate, store.user.userProfile);
		}

		return newLemmas;
	}

	private async upsertLemmasLocally(newLemmas: Array<LemmaRow>) {
		this._lemmas = this.rightMergeLemmas(this._lemmas, newLemmas);
		this.selectedLemmas = this.innerMergeLemmas(this.selectedLemmas, newLemmas);
		await this.updateLemmasInIndexedDB(newLemmas);
	}

	private deleteLemmaListLocally(id: number) {
		this.lemmaLists = this.lemmaLists.filter((ll) => ll.id !== id);
	}

	async deleteLemmaList(id: number) {
		const list = this.lemmaLists.find((ll) => ll.id === id);
		this.deleteLemmaListLocally(id);
		this.selectedLemmaListId = null;
		await ResearchService.researchApiV1ListresearchDestroy(id);
		if (list !== undefined) {
			notifyService.emit("deleteLemmaList", list);
		}
		await this.loadRemoteLemmaLists();
	}

	async addLemma(lemmaRow: LemmaRow, listId: number) {
		this._lemmas.push(lemmaRow);
		await ResearchService.researchApiV1LemmaresearchCreate({
			listId,
			lemmas: [
				{
					...lemmaRow,
					dateOfBirth: lemmaRow.dateOfBirth.generateISO_OnlyDate(),
					dateOfDeath: lemmaRow.dateOfDeath.generateISO_OnlyDate(),
					firstName: lemmaRow.firstName || undefined,
					lastName: lemmaRow.lastName || undefined,
					selected: false,
					gnd: lemmaRow.gnd,
				},
			],
		});
		notifyService.emit("addLemma", lemmaRow);
	}

	async loadRemoteLemmaLists() {
		this.lemmaLists = (await ResearchService.researchApiV1ListresearchList()).results || [];
	}

	getAllUserColumns(lemmas: Array<LemmaRow>): Array<LemmaColumn> {
		const allColumnKeys = new Set(lemmas.flatMap((lemma) => Object.keys(lemma.columns_user)));

		return Array.from(allColumnKeys).map((key) => {
			return {
				name: key,
				value: key,
				filterable: true,
				type: "text",
				show: false,
				isUserColumn: true,
				editable: false,
			};
		});
	}

	async initLemmaData() {
		try {
			this._lemmas = await this.getLocalLemmaCache();
		} catch (error) {
			console.error({ costomErrorMessage: "Could not run initLemmaData", error: error });
			this._lemmas = [];
		}
		const fetchUpdatesFrom = _.clone(this.lastLemmaFetchDate);
		this.lastLemmaFetchDate = new Date();
		await this.getAndApplyRemoteLemmas(fetchUpdatesFrom);
		this.columns = _.uniqBy([...this.columns, ...this.getAllUserColumns(this.lemmas)], "value");
	}

	getSumSimilarity(l: LemmaRow, lc: LemmaRow): number {
		return this.columns.reduce((m, e) => {
			if (e.getSimilarityFactor !== undefined) {
				m = m + e.getSimilarityFactor(l, lc);
			}
			return m;
		}, 0);
	}

	getMostSimilarLemmas(l: LemmaRow) {
		const s = _(this.lemmas)
			.map((lc) => ({ ...lc, similarity: this.getSumSimilarity(lc, l) }))
			.filter((lc) => lc.similarity > 0)
			.orderBy("similarity", "desc")
			.value();
		return s;
	}

	getListById(id: number) {
		return this.lemmaLists.find((i) => i.id === id);
	}

	async getLocalLemmaCache(): Promise<Array<LemmaRow>> {
		let lemmas: Array<SerializedLemmaRow> = [];
		try {
			lemmas = await this.localDb.lemmas.toArray();
		} catch (error) {
			console.error({ catchedError: error });
			lemmas = [];
		}
		return lemmas.map(unserializeLemmaRow);
	}

	private async deleteLemmasLocally(ids: Array<number>) {
		this._lemmas = this._lemmas.filter((l) => ids.indexOf(l.id) === -1);
		try {
			await this.localDb.lemmas.bulkDelete(ids);
		} catch (error) {
			console.error({ catchedError: error });
		}
	}

	async deleteLemma(ids: Array<number>) {
		await this.deleteLemmasLocally(ids);
		await Promise.all(ids.map((id) => ResearchService.researchApiV1LemmaresearchDestroy(id)));
		notifyService.emit("deleteLemmas", ids);
	}

	async importLemmas(ls: Array<ImportablePerson>, listName: string) {
		// create list
		const list = await (async () => {
			return this.createList(listName);
		})();
		// trigger import to list
		await ResearchService.researchApiV1LemmaresearchCreate({
			listId: list.id!,
			lemmas: ls.map((l) => ({
				...l,
				firstName: l.firstName || undefined,
				lastName: l.lastName || undefined,
				dateOfBirth: l.dateOfBirth || undefined,
				dateOfDeath: l.dateOfDeath || undefined,
				selected: false,
				gnd: l.gnd,
			})),
		});
		// register the lemmas that we’re waiting for
		this.importStatus.incrementTarget(ls.length);
		return list;
	}

	convertRemoteLemmaToLemmaRow(rs: ServerResearchLemma): LemmaRow {
		return {
			id: rs.id,
			selected: rs.selected || false,
			loc: _.get(rs, "columns_scrape.wikidata.loc") ?? null,
			viaf_id: _.get(rs, "columns_scrape.wikidata.viaf") ?? null,
			wiki_edits: _.get(rs, "columns_scrape.wikipedia.edits_count") ?? null,
			firstName: rs.firstName,
			lastName: rs.lastName,
			alternativeNames: rs.alternativeNames as Array<FullName>,
			gender: rs.gender as GenderAe0Enum,
			dateOfBirth: DateContainer.fromISO_OnlyDate(rs.dateOfBirth),
			dateOfDeath: DateContainer.fromISO_OnlyDate(rs.dateOfDeath),
			updated: rs.last_updated,
			gnd: rs.gnd !== undefined ? rs.gnd.filter((g) => g !== "None") : [],
			columns_user: rs.columns_user,
			columns_scrape: rs.columns_scrape,
			professionDetail: rs.professionDetail,
			professionGroup: rs.professionGroup,
			notes: rs.notes,
			// TODO: yuck.
			list: rs.list
				? {
						id: rs.list.id,
						title: rs.list.title,
						editor: rs.list.editor || undefined,
				  }
				: undefined,
			legacyGideonCitations: rs.gideonLegacyLiterature as Array<{
				id: number;
				value: string;
			}> | null,
			secondaryLiterature: rs.secondaryLiterature as Array<SecondaryCitation>,
			zoteroKeysBy: rs.zoteroKeysBy as Array<string>,
			zoteroKeysAbout: rs.zoteroKeysAbout as Array<string>,
			bioNote: rs.bioNote,
			kinship: rs.kinship,
			religion: rs.religion,
		};
	}

	async getLemmasIncrementally(
		deleted: boolean | undefined,
		modifiedAfter: string | undefined,
		chunkSize: number,
		onProgress?: (ls: Array<LemmaRow>) => any,
	): Promise<Array<LemmaRow>> {
		// get the first page
		const firstRes = await ResearchService.researchApiV1LemmaresearchList(
			deleted,
			chunkSize,
			modifiedAfter,
		);
		// call progress handler if available
		if (onProgress !== undefined) {
			await onProgress(
				((firstRes.results as Array<ServerResearchLemma>) || []).map(
					this.convertRemoteLemmaToLemmaRow,
				),
			);
		}
		// if there’s more than on page: loop from second page until we have all items and return
		if (firstRes.count !== undefined && firstRes.count > chunkSize) {
			const chunks = Math.ceil(firstRes.count / chunkSize);
			let lemmaAgg: Array<LemmaRow> = [];
			for (let i = 1; i < chunks; i++) {
				const res =
					((
						await ResearchService.researchApiV1LemmaresearchList(
							deleted,
							chunkSize,
							modifiedAfter,
							i * chunkSize,
						)
					).results as Array<ServerResearchLemma>) || [];
				const converted = res.map(this.convertRemoteLemmaToLemmaRow);
				if (onProgress !== undefined) {
					await onProgress(converted);
				}
				lemmaAgg = lemmaAgg.concat(converted);
			}
			return lemmaAgg;
			// if there’s only one page: return
		} else {
			return ((firstRes.results as Array<ServerResearchLemma>) || []).map(
				this.convertRemoteLemmaToLemmaRow,
			);
		}
	}

	shouldClearDb() {
		const dbVersionLocal = localStorage.getItem("currentDbVersion");
		if (currentDbVersion !== dbVersionLocal) {
			localStorage.setItem("currentDbVersion", currentDbVersion);
			return true;
		} else {
			return false;
		}
	}

	async getAndApplyRemoteLemmas(modifiedAfter: Date | null = null): Promise<void> {
		let currentLemmasLength = 0;
		try {
			currentLemmasLength = await this.localDb.lemmas.count();
		} catch (error) {
			console.error({ catchedError: error });
		}

		// there are no lemmas, or no last modified date,
		// or the DB must be cleared => get all lemmas
		if (modifiedAfter === null || currentLemmasLength === 0 || this.shouldClearDb()) {
			this._lemmas = [];
			try {
				await this.localDb.lemmas.clear();
			} catch (error) {
				console.error({ catchedError: error });
			}
			this.getLemmasIncrementally(false, undefined, 100, async (ls) => {
				await this.upsertLemmasLocally(ls);
			});
			// just get the updates since last time
		} else {
			const upserted = await this.getLemmasIncrementally(false, modifiedAfter.toISOString(), 100);
			const deleted = await this.getLemmasIncrementally(true, modifiedAfter.toISOString(), 100);
			await this.deleteLemmasLocally(deleted.map((l) => l.id!));
			await this.upsertLemmasLocally(upserted);
		}
	}

	private updateLemmaListLocally(id: number, l: Partial<LemmaList>) {
		this._lemmaLists = this._lemmaLists.map((l2) => {
			return id === l2.id ? { ...l2, ...l } : l2;
		});
	}

	async updateList(id: number, l: Partial<LemmaList>) {
		this.updateLemmaListLocally(id, l);
		const newList = await ResearchService.researchApiV1ListresearchPartialUpdate(id, l);
		notifyService.emit("updateLemmaList", newList);
	}

	private addLemmaListLocally(l: LemmaList) {
		this.lemmaLists = [...this.lemmaLists, l];
	}

	async createList(title: string) {
		const s = await ResearchService.researchApiV1ListresearchCreate({ title });
		this.addLemmaListLocally(s);
		notifyService.emit("createLemmaList", s);
		return s;
	}

	getLemmaById(id?: number) {
		return id === undefined ? undefined : this._lemmas.find((l) => l.id === id);
	}

	getLemmasByList(listId: number) {
		return this._lemmas.filter((l) => l.list?.id === listId);
	}

	setFilter(columnQueries: { [key: string]: boolean | string | null } = {}) {
		this.currentFilters = { ...columnQueries };
	}

	filterLemmas(lemmas: Array<LemmaRow>): Array<LemmaRow> {
		return lemmas.filter(this.lemmaPassesFilter.bind(this));
	}

	lemmaPassesFilter(lemma: LemmaRow): boolean {
		// Using a for loop for early return
		for (const [searchColumn, searchTerm] of Object.entries(this.currentFilters)) {
			// Nothing to search -> next filter
			if (searchTerm === undefined || searchTerm === null) {
				continue;
			}

			const normalizedSearchTerm = searchTerm.toLocaleString().trim().toLocaleLowerCase();

			// Again: nothing to search -> next filter
			if (normalizedSearchTerm === "") {
				continue;
			}

			// Since we do not know, if the columns is a user column or a default one, try
			let lookUpValue = undefined;
			if (searchColumn in lemma) {
				lookUpValue = lemma[searchColumn as keyof LemmaRow];
			} else {
				lookUpValue = lemma.columns_user[searchColumn];
			}

			// If there is nothing to compare to, this lemma should not pass filter.
			if (lookUpValue === undefined || lookUpValue === null) {
				return false;
			}

			switch (typeof lookUpValue) {
				case "number":
				case "bigint":
				case "boolean":
					lookUpValue = String(lookUpValue);
					break;
				case "object":
					lookUpValue = JSON.stringify(lookUpValue);
					break;
				case "string":
					break;
				default:
					throw new Error(`Can not search in type ${typeof lookUpValue} = ${lookUpValue}`);
			}

			const normalizedLookUpValue = lookUpValue.trim().toLocaleLowerCase();

			// Again if there is nothing to compare to, this lemma should not pass filter.
			if (normalizedLookUpValue === "") {
				return false;
			}

			// Finally!!!
			if (!normalizedLookUpValue.includes(normalizedSearchTerm)) {
				return false;
			}
		}
		return true;
	}

	get lemmas() {
		const lemmas =
			this.selectedLemmaListId !== null
				? this.getLemmasByList(this.selectedLemmaListId)
				: this._lemmas;
		return this.filterLemmas(lemmas);
	}

	set lemmas(ls: Array<LemmaRow>) {
		this._lemmas = ls;
	}

	get allLemmas() {
		return this._lemmas;
	}
}
