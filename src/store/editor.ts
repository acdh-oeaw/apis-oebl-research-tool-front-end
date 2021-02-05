import { WorkflowService, Editor } from '@/api'
import _ from 'lodash'

export default class EditorStore {

  private _editors: Editor[] = []
  public editorsById: { [id: number]: Editor } = {}

  constructor() {
    this.loadEditors()
  }

  async loadEditors() {
    this._editors = (await WorkflowService.workflowApiV1EditorsList()).results || []
    this.editorsById = _.keyBy(this._editors, 'userId')
  }

  getById(id: number) {
    return this.editors.find(e => e.userId === id)
  }

  get editors() {
    return this._editors
  }
}
