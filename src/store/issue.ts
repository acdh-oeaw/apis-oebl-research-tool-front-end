import { Issue, WorkflowService, IssueLemma, LemmaStatus, LemmaLabel, LemmaNote } from '@/api'
import { WithId } from '@/types'
import { LemmaRow } from '@/types/lemma'
import request from './request'
export default class IssueStore {

  id: number|null = null
  private _issues: Issue[] = []
  private _issueLemmas: WithId<IssueLemma>[] = []
  private _statuses: WithId<LemmaStatus>[] = []
  private _labels: LemmaLabel[] = []
  public selectedLemma: WithId<IssueLemma>|null = null

  constructor(id: number) {
    this.loadIssueList()
    this.loadLabels()
    this.loadIssue(id)
  }

  async createIssueLemma(issueId: number, lemma: LemmaRow): Promise<WithId<IssueLemma>> {
    const newLemma = await (request(WorkflowService.workflowApiV1IssueLemmaCreate, {
      author: null,
      editor: null,
      issue: issueId,
      labels: [],
      lemma: lemma.id,
    })) as WithId<IssueLemma>
    if (this.id === issueId) {
      this.issueLemmas.push(newLemma)
    }
    return newLemma
  }

  async loadIssue(id: number) {
    this.id = id
    await this.loadIssueLemmas(id)
    await this.loadStatuses(id)
    return this.issueLemmas
  }

  async loadIssueList() {
    this._issues = (await request(WorkflowService.workflowApiV1IssuesList, undefined)).results || []
  }

  async getIssueLemmas(id: number) {
    return ((await request(WorkflowService.workflowApiV1IssueLemmaList, undefined, undefined, id)).results || []) as WithId<IssueLemma>[]
  }

  async loadIssueLemmas(id: number) {
    this._issueLemmas = await this.getIssueLemmas(id)
  }

  async createLabel(name: string, color: string): Promise<LemmaLabel> {
    const l = await request(WorkflowService.workflowApiV1LemmaLabelCreate, {name, color})
    this.labels.push(l)
    return l
  }

  async getIssueLemmaNotes(issueLemmaId: number): Promise<LemmaNote[]> {
    return (await request(WorkflowService.workflowApiV1LemmaNoteList, issueLemmaId)).results || []
  }

  async loadStatuses(id: number) {
    this._statuses = ((await request(WorkflowService.workflowApiV1LemmaStatusList, id)).results || []) as WithId<LemmaStatus>[]
  }

  async loadLabels() {
    this._labels = (await request(WorkflowService.workflowApiV1LemmaLabelList)).results || []
  }

  async loadNotes(lemmaId: number) {
    return (await request(WorkflowService.workflowApiV1LemmaNoteList, lemmaId)).results || []
  }

  async addNote(lemmaId: number, text: string) {
    return (await request(WorkflowService.workflowApiV1LemmaNoteCreate, {
      lemma: lemmaId,
      text: text,
      user: 4
    }))
  }

  async updateLemma(id: number, l: Partial<IssueLemma>): Promise<IssueLemma|undefined> {
    const index = this.issueLemmas.findIndex(l => l.id === id)
    if (index > -1) {
      this.issueLemmas[index] = { ...this.issueLemmas[index], ...l }
      if (this.selectedLemma !== null && this.issueLemmas[index].id === this.selectedLemma.id) {
        this.selectedLemma = this.issueLemmas[index]
      }
      await WorkflowService.workflowApiV1IssueLemmaUpdate(id, this.issueLemmas[index])
      return this.issueLemmas[index]
    }
  }

  getLabelById(id: number) {
    return this.labels.find(l => l.id === id)
  }

  get issues() {
    return this._issues
  }

  get labels() {
    return this._labels
  }

  get issueLemmas() {
    return this._issueLemmas
  }

  set issueLemmas(ls: WithId<IssueLemma>[]) {
    this._issueLemmas = ls
  }

  get statuses() {
    return this._statuses
  }

  get activeIssue() {
    return this.issues.find(i => i.id === this.id)
  }

}
