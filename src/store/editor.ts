import _ from "lodash";

import { type Editor, WorkflowService } from "@/api";

export default class EditorStore {
	private _editors: Array<Editor> = [];
	public editorsById: { [id: number]: Editor } = {};

	constructor() {
		this.loadEditors();
	}

	async loadEditors() {
		this._editors = (await WorkflowService.workflowApiV1EditorsList()).results || [];
		this.editorsById = _.keyBy(this._editors, "userId");
	}

	getById(id: number) {
		return this.editors.find((e) => e.userId === id);
	}

	get editors() {
		return this._editors;
	}
}
