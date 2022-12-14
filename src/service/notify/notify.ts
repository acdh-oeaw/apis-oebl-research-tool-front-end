import { LemmaRow, ServerResearchLemma } from '@/types/lemma'
import { io, Socket } from 'socket.io-client'
import { List as LemmaList } from '@/api/models/List'
import { Editor } from '@/api'
import { IssueLemma } from '@/api/models/IssueLemma'
import { WithId } from '@/types'

/** All possible Events that can be sent over the bus. Add new Event Types here. */
export interface NotifyEvents {
  disconnect: () => void
  updateIssueLemmas: (ids: number[], ils: Partial<IssueLemma>) => void
  updateLemmas: (ls: LemmaRow[], u: Partial<LemmaRow>, e: Editor) => void
  importLemmas: (ls: ServerResearchLemma[]) => void
  importIssueLemmas: (ls: (WithId<IssueLemma>)[]) => void
  deleteLemmas: (ids: number[]) => void
  createLemmaList: (l: LemmaList) => void
  updateLemmaList: (l: LemmaList) => void
  deleteLemmaList: (l: LemmaList) => void
}

interface NotifyClient extends Socket {
  on<U extends keyof NotifyEvents>(event: U, listener: NotifyEvents[U]): this;
  emit<U extends keyof NotifyEvents>(event: U, ...args: Parameters<NotifyEvents[U]>): this;
}

const client = io(process.env.VUE_APP_EVENTBUS_HOST || 'http://localhost:3333') as NotifyClient

client.onAny((...args: any) => {
  // console.log('message from server:', args)
})

export default client
