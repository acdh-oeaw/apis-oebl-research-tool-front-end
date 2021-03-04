import { Issue, WorkflowService, IssueLemma, LemmaStatus, LemmaLabel, LemmaNote } from '@/api'
import { WithId } from '@/types'
import notifyService from '@/service/notify/notify'
import { LemmaRow } from '@/types/lemma'
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
    this.listenForUpdates()
    this.loadIssue(id)
  }

  listenForUpdates() {
    notifyService.on('importIssueLemmas', (ls) => {
      this._issueLemmas = this._issueLemmas.concat(ls)
    })
  }

  async addLemmaToIssue(id: number, ls: LemmaRow[]): Promise<void> {
    await WorkflowService.workflowApiV1Research2WorkflowCreate({
      lemmas: ls.map(l => l.id),
      issue: id
    })
  }

  async loadIssue(id: number) {
    this.id = id
    await this.loadIssueLemmas(id)
    await this.loadStatuses(id)
    return this.issueLemmas
  }

  async loadIssueList() {
    this._issues = (await WorkflowService.workflowApiV1IssuesList()).results || []
  }

  async getIssueLemmas(id: number) {
    return ((await WorkflowService.workflowApiV1IssueLemmaList(undefined, undefined, id)).results || []) as WithId<IssueLemma>[]
  }

  async loadIssueLemmas(id: number) {
    this._issueLemmas = await this.getIssueLemmas(id)
  }

  async createLabel(name: string, color: string): Promise<LemmaLabel> {
    const l = await WorkflowService.workflowApiV1LemmaLabelCreate({name, color})
    this.labels.push(l)
    return l
  }

  async getIssueLemmaNotes(issueLemmaId: number): Promise<LemmaNote[]> {
    return (await WorkflowService.workflowApiV1LemmaNoteList(issueLemmaId)).results || []
  }

  async loadStatuses(id: number) {
    this._statuses = ((await WorkflowService.workflowApiV1LemmaStatusList(id)).results || []) as WithId<LemmaStatus>[]
  }

  async loadLabels() {
    this._labels = (await WorkflowService.workflowApiV1LemmaLabelList()).results || []
  }

  async loadNotes(lemmaId: number) {
    return (await WorkflowService.workflowApiV1LemmaNoteList(lemmaId)).results || []
  }

  async addNote(lemmaId: number, text: string) {
    return WorkflowService.workflowApiV1LemmaNoteCreate({
      lemma: lemmaId,
      text: text,
      user: 4
    })
  }

  getIssueById(id: number) {
    return this.issues.find(i => i.id === id)
  }

  async updateLemma(id: number, l: Partial<IssueLemma>): Promise<IssueLemma|undefined> {
    const index = this.issueLemmas.findIndex(l => l.id === id)
    if (index > -1) {
      const newIssueLemma = { ...this.issueLemmas[index], ...l }
      if (this.selectedLemma !== null && this.issueLemmas[index].id === this.selectedLemma.id) {
        this.selectedLemma = this.issueLemmas[index]
      }
      this.issueLemmas = this.issueLemmas.map(il => {
        if (il.id === id) {
          return newIssueLemma
        } else {
          return il
        }
      })
      await WorkflowService.workflowApiV1IssueLemmaPartialUpdate(id, { lemma: newIssueLemma.lemma, ...l })
      return this.issueLemmas[index]
    }
  }

  async deleteIssueLemmaLocally(id: number) {
    this.issueLemmas = this.issueLemmas.filter(il => il.id !== id)
  }

  async deleteIssueLemma(id: number) {
    this.deleteIssueLemmaLocally(id)
    await WorkflowService.workflowApiV1IssueLemmaDestroy(id)
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
