import { WorkflowService, Author, Lemma, LemmaLabel } from "@/api";
import _ from "lodash";

export default class LabelStore {
	private _labels: LemmaLabel[] = [];

	constructor() {
		this.initLabels();
	}

	async initLabels() {
		this._labels = (await WorkflowService.workflowApiV1LemmaLabelList()).results || [];
	}

	get labels() {
		return this._labels;
	}
}
