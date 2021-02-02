import { WorkflowService, Author } from '@/api'
import request from './request'

export default class AuthorStore {

  private _authors: Author[] = []

  constructor() {
    this.loadAuthors()
  }

  getById(id: number): Author|undefined {
    return this.authors.find(a => a.userId === id)
  }

  get authors() {
    return this._authors
  }

  async loadAuthors() {
    this._authors = (await request(WorkflowService.workflowApiV1AuthorsList, undefined)).results || []
  }
}
