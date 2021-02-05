import { WorkflowService, Author } from '@/api'

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
    this._authors = (await WorkflowService.workflowApiV1AuthorsList()).results || []
  }
}
