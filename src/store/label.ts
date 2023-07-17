import { type LemmaLabel, WorkflowService } from "@/api";

export default class LabelStore {
	private _labels: Array<LemmaLabel> = [];

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
