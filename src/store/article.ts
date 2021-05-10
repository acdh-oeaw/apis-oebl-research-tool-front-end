import { v4 as uuid } from 'uuid'

interface Comment {
  commentId: string,
  date: Date,
  user: number,
  text: string
}

interface CommentThread {
  threadId: ThreadId
  status: 'open'|'closed'
  comments: Comment[]
}

type ThreadId = string

export default class ArticleStore {

  constructor(id: number|null) {
    if (id !== null) {
      this.loadComments(id)
      this.loadArticle(id)
    }
  }

  async loadComments(articleId: number) {
  }

  async loadArticle(articleId: number) {
    this.article = `<p>
      Non labore occaecat deserunt dolor aliquip consectetur fugiat laboris velit adipisicing laboris aliqua est aliqua.
      Culpa cupidatat anim qui adipisicing ea consectetur qui Lorem culpa <comment data-id="1">excepteur</comment>
      deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.</p>
      <p>Non labore occaecat deserunt dolor aliquip
      consectetur fugiat <footnote data-id="9cee2f2a-212d-43eb-b351-0ad4098c6834">laboris</footnote> velit adipisicing laboris
      aliqua est aliqua. Culpa cupidatat anim qui1 adipisicing ea consectetur qui Lorem culpa excepteur deserunt enim ut.
      Est ut cupidatat exercitation et ea quis commodo.</p>
      Non labore occaecat deserunt dolor aliquip consectetur fugiat laboris velit adipisicing laboris aliqua est aliqua.
      Culpa cupidatat anim qui adipisicing ea consectetur qui Lorem culpa <comment data-id="2">excepteur</comment>
      deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.</p>
      <p>Non labore occaecat deserunt dolor aliquip
      consectetur fugiat <footnote data-id="9cee2f2b-212d-43eb-b351-0ad4098c6835">laboris</footnote> velit adipisicing laboris
      aliqua est aliqua. Culpa cupidatat anim qui1 adipisicing ea consectetur qui Lorem culpa excepteur deserunt enim ut.
      Est ut cupidatat exercitation et ea quis commodo.</p>
      Non labore occaecat deserunt dolor aliquip consectetur fugiat laboris velit adipisicing laboris aliqua est aliqua. Culpa cupidatat anim qui adipisicing ea consectetur qui Lorem culpa excepteur deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.
      Non labore occaecat deserunt dolor aliquip consectetur fugiat laboris velit adipisicing laboris aliqua est aliqua. Culpa cupidatat anim qui1 adipisicing ea consectetur qui Lorem culpa excepteur deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.
      Non labore occaecat deserunt dolor aliquip consectetur fugiat laboris velit adipisicing laboris aliqua est aliqua. Culpa cupidatat anim qui adipisicing ea consectetur qui Lorem culpa excepteur deserunt enim ut. Est ut cupidatat exercitation et ea quis commodo.
    `
  }

  article = ''

  private _commentThreads: CommentThread[] = [
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
          text: 'Exercitation officia ad mollit cillum duis culpa est anim voluptate occaecat nostrud.'
        }
      ]
    }
  ]

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

  createThread(): ThreadId {
    const threadId = uuid()
    this._commentThreads.push({
      threadId,
      status: 'open',
      comments: []
    })
    return threadId
  }

  createCitation() {
    return uuid()
  }

}
