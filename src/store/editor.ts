import { WorkflowService, Editor } from '@/api'
import request from './request'

export default class EditorStore {

  private _editors: Editor[] = []

  constructor() {
    this.loadEditors()
  }

  async loadEditors() {
    this._editors = (await request(WorkflowService.workflowApiV1EditorsList, undefined)).results || []
  }

  getById(id: number) {
    return this.editors.find(e => e.userId === id)
  }

  get editors() {
    return this._editors
  }
}
