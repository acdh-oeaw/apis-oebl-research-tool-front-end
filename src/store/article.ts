import zotero  from '@/service/zotero'
import { v4 as uuid } from 'uuid'

interface Comment {
  commentId: string,
  date: Date,
  user: number,
  text: string
}

export interface CommentThread {
  threadId: ThreadId
  status: 'open'|'private'
  comments: Comment[]
}

export interface CitationAttributes {
  id: string|null
  zoteroKey: string|null
  quotedRange: string|null
}

type ThreadId = string

export default class ArticleStore {

  constructor(id: number|null) {
    if (id !== null) {
      console.log('called constructor')
      // this.loadComments(id)
      // this.loadCitations(id)
      // this.loadArticle(id)
    }
  }

  showSidebar = false

  private _commentThreads: CommentThread[] = []
  public article = ''

  async loadComments(articleId: number) {
    this._commentThreads = [
      {
        threadId: '1',
        status: 'open',
        comments: [
          {
            date: new Date(),
            commentId: '1',
            user: 1,
            text: 'Exercitation officia ad mollit cillum duis culpa est anim voluptate occaecat nostrud.'
          },
          {
            date: new Date(),
            commentId: '2',
            user: 2,
            text: 'Nostrud duis minim et laboris labore.'
          }
        ]
      },
      {
        threadId: '2',
        status: 'open',
        comments: [
          {
            date: new Date(),
            commentId: '1',
            user: 1,
            text: 'Aliquip nisi et Lorem anim dolore ut eiusmod tempor velit minim.'
          },
          {
            date: new Date(),
            commentId: '2',
            user: 2,
            text: 'Pariatur ut eu dolor enim duis deserunt.'
          }
        ]
      }
    ]
  }

  async loadArticle(articleId: number) {
    this.loadComments(articleId)
    this.article = `
      <h1>Test Headlines look like this</h1>
      <p>Non labore occaecat
        <mark
          data-id="67b86600-2550-43be-957e-23d7c3034a24"
          data-entity-id="4074335-4"
          data-relation-type-id="1"
          data-is-confirmed="false">London</mark> dolor aliquip consectetur fugiat laboris velit adipisicing laboris aliqua est aliqua.
      Culpa cupidatat anim qui adipisicing ea consectetur qui Lorem culpa <comment data-id="1">excepteur</comment>
      deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.</p>
      <p>Non labore occaecat deserunt dolor aliquip
      consectetur fugiat <footnote data-zotero-key="HZ9BKUUJ" data-id="9cee2f2a-212d-43eb-b351-0ad4098c6834">laboris</footnote> velit adipisicing laboris
      aliqua est aliqua. Culpa cupidatat anim qui1 adipisicing ea consectetur qui Lorem culpa excepteur deserunt enim ut.
      Est ut cupidatat exercitation et ea quis commodo.</p>
      Non labore occaecat deserunt dolor aliquip consectetur fugiat laboris velit adipisicing laboris aliqua est aliqua.
      Culpa cupidatat anim qui adipisicing ea <comment data-id="2">consectetur qui Lorem culpa excepteur</comment>
      deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.</p>
      <h2>Or possibly like this.</h2>
      <p>Non labore occaecat deserunt dolor aliquip
      consectetur fugiat <footnote data-zotero-key="KHPCHKFV" data-id="9cee2f2b-212d-43eb-b351-0ad4098c6835">laboris</footnote> velit adipisicing laboris
      aliqua est aliqua. Culpa cupidatat anim qui1 adipisicing ea consectetur qui Lorem culpa excepteur deserunt enim ut.
      Est ut cupidatat exercitation et ea quis commodo.</p>
      Non labore occaecat deserunt dolor aliquip consectetur fugiat laboris velit adipisicing laboris aliqua est aliqua. Culpa cupidatat anim qui adipisicing ea consectetur qui Lorem culpa excepteur deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.
      Non labore occaecat deserunt dolor aliquip consectetur fugiat laboris velit adipisicing laboris aliqua est aliqua. Culpa cupidatat anim qui1 adipisicing ea consectetur qui Lorem culpa excepteur deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.
      Non labore occaecat deserunt dolor aliquip consectetur fugiat laboris velit adipisicing laboris aliqua est aliqua. Culpa cupidatat anim qui adipisicing ea consectetur qui Lorem culpa excepteur deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.
    `
  }

  get threads() {
    return this._commentThreads
  }

  getThread(id: string): CommentThread|undefined {
    return this._commentThreads.find(c => c.threadId === id)
  }

  addComment(threadId: string, comment: Comment) {
    const i = this.threads.findIndex(t => t.threadId === threadId)
    if (i > -1) {
      this._commentThreads[i].comments.push(comment)
    } else {
      throw new Error('Can’t add comment. Thread not found.')
    }
  }

  createCommentThread(): ThreadId {
    const threadId = uuid()
    this._commentThreads.push({
      threadId,
      status: 'open',
      comments: []
    })
    return threadId
  }

  createCitation() {
    const id = uuid()
    return id
  }

}
