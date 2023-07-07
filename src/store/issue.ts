import {
	type Issue,
	type IssueLemma,
	type LemmaLabel,
	type LemmaNote,
	type LemmaStatus,
	WorkflowService,
} from "@/api";
import notifyService from "@/service/notify/notify";
import { type WithId } from "@/types";
import { type LemmaRow } from "@/types/lemma";

export default class IssueStore {
	id: number | null = null;
	private _issues: Array<Issue> = [];
	private _issueLemmas: Array<WithId<IssueLemma>> = [];
	private _statuses: Array<WithId<LemmaStatus>> = [];
	private _labels: Array<LemmaLabel> = [];
	public selectedLemma: WithId<IssueLemma> | null = null;

	constructor(id: number | null) {
		this.loadIssueList();
		this.loadLabels();
		this.listenForUpdates();
		this.loadIssue(id);
	}

	listenForUpdates() {
		notifyService.on("importIssueLemmas", (ls) => {
			this._issueLemmas = this._issueLemmas.concat(ls);
		});
		notifyService.on("updateIssueLemmas", (ids, ls) => {
			this.updateIssueLemmasLocally(ids, ls);
		});
	}

	private updateIssueLemmasLocally(ids: Array<number>, update: Partial<IssueLemma>) {
		this._issueLemmas = this._issueLemmas.map((il) => {
			if (ids.indexOf(il.id) > -1) {
				return { ...il, ...update };
			} else {
				return il;
			}
		});
	}

	async addLemmaToIssue(id: number, ls: Array<LemmaRow>): Promise<void> {
		await WorkflowService.workflowApiV1Research2WorkflowCreate({
			lemmas: ls.map((l) => l.id),
			issue: id,
		});
	}

	async loadIssue(id: number | null) {
		this.id = id;
		await this.loadIssueLemmas(id);
		await this.loadStatuses(id);
		return this.issueLemmas;
	}

	async loadIssueList() {
		this._issues = (await WorkflowService.workflowApiV1IssuesList()).results || [];
	}

	async getIssueLemmas(id: number | null) {
		if (id === null) {
			return [];
		}
		return (await WorkflowService.workflowApiV1IssueLemmaList(undefined, id, undefined))
			.results as Array<WithId<IssueLemma>>;
	}

	async loadIssueLemmas(id: number | null) {
		this._issueLemmas = await this.getIssueLemmas(id);
	}

	async updateLabel(id: number, color: string, name: string): Promise<LemmaLabel> {
		this.labels = this.labels.map((l) => {
			if (l.id === id) {
				return { id, color, name };
			} else {
				return l;
			}
		});
		return await WorkflowService.workflowApiV1LemmaLabelPartialUpdate(id, { color, name });
	}

	async deleteLabel(id: number) {
		this.labels = this.labels.filter((l) => l.id !== id);
		return await WorkflowService.workflowApiV1LemmaLabelDestroy(id);
	}

	async createLabel(name: string, color: string): Promise<LemmaLabel> {
		const l = await WorkflowService.workflowApiV1LemmaLabelCreate({ name, color });
		this.labels = this.labels.concat(l);
		return l;
	}

	async getIssueLemmaNotes(issueLemmaId: number): Promise<Array<LemmaNote>> {
		return (await WorkflowService.workflowApiV1LemmaNoteList(issueLemmaId)).results || [];
	}

	async loadStatuses(id: number | null) {
		if (id === null) {
			return [];
		}
		this._statuses = (await WorkflowService.workflowApiV1LemmaStatusList([id])).results as Array<
			WithId<LemmaStatus>
		>;
	}

	async loadLabels() {
		this._labels = (await WorkflowService.workflowApiV1LemmaLabelList()).results || [];
	}

	async loadNotes(lemmaId: number) {
		return (await WorkflowService.workflowApiV1LemmaNoteList(lemmaId)).results || [];
	}

	async addNote(lemmaId: number, text: string) {
		return WorkflowService.workflowApiV1LemmaNoteCreate({
			lemma: lemmaId,
			text: text,
			user: 4,
		});
	}

	getIssueById(id: number) {
		return this.issues.find((i) => i.id === id);
	}

	async updateLemma(id: number, l: Partial<IssueLemma>): Promise<IssueLemma | undefined> {
		const index = this.issueLemmas.findIndex((l) => l.id === id);
		if (index > -1) {
			const newIssueLemma = { ...this.issueLemmas[index], ...l };
			if (this.selectedLemma !== null && this.issueLemmas[index]!.id === this.selectedLemma.id) {
				this.selectedLemma = this.issueLemmas[index]!;
			}
			this.updateIssueLemmasLocally([id], l);
			await WorkflowService.workflowApiV1IssueLemmaPartialUpdate(id, {
				lemma: newIssueLemma.lemma,
				...l,
			});
			notifyService.emit("updateIssueLemmas", [id], l);
			return this.issueLemmas[index];
		}
	}

	async getIssueLemmaById(id: number): Promise<IssueLemma | undefined> {
		const local = this.issueLemmas.find((il) => il.id === id);
		if (local === undefined) {
			try {
				return await WorkflowService.workflowApiV1IssueLemmaRetrieve(id);
			} catch (e) {
				return undefined;
			}
		}
	}

	private async deleteIssueLemmaLocally(id: number) {
		this.issueLemmas = this.issueLemmas.filter((il) => il.id !== id);
	}

	async deleteIssueLemma(id: number) {
		this.deleteIssueLemmaLocally(id);
		await WorkflowService.workflowApiV1IssueLemmaDestroy(id);
	}

	getLabelById(id: number) {
		return this.labels.find((l) => l.id === id);
	}

	get issues() {
		return this._issues;
	}

	get labels() {
		return this._labels;
	}

	set labels(ls) {
		this._labels = ls;
	}

	get issueLemmas() {
		return this._issueLemmas;
	}

	set issueLemmas(ls: Array<WithId<IssueLemma>>) {
		this._issueLemmas = ls;
	}

	get statuses() {
		return this._statuses;
	}

	get activeIssue() {
		return this.issues.find((i) => i.id === this.id);
	}
}
