import { WorkflowService, Editor } from '@/api'
import _ from 'lodash'
import request from './request'

export default class EditorStore {

  private _editors: Editor[] = []
  public editorsById: { [id: number]: Editor } = {}

  constructor() {
    this.loadEditors()
  }

  async loadEditors() {
    this._editors = (await request(WorkflowService.workflowApiV1EditorsList, undefined)).results || []
    this.editorsById = _.keyBy(this._editors, 'userId')
  }

  getById(id: number) {
    return this.editors.find(e => e.userId === id)
  }

  get editors() {
    return this._editors
  }
}
