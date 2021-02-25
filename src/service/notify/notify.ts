import { LemmaRow, ServerResearchLemma } from '@/types/lemma'
import { io, Socket } from 'socket.io-client'
import { List as LemmaList } from '@/api/models/List'

export interface NotifyEvents {
  message: (a: any) => void
  disconnect: () => void
  updateLemmas: (ls: LemmaRow[], u: Partial<LemmaRow>) => void
  importLemmas: (ls: ServerResearchLemma[]) => void
  deleteLemmas: (ids: number[]) => void
  createLemmaList: (l: LemmaList) => void
  updateLemmaList: (l: LemmaList) => void
  deleteLemmaList: (l: LemmaList) => void
}

interface NotifyClient extends Socket {
  on<U extends keyof NotifyEvents>(event: U, listener: NotifyEvents[U]): this;
  emit<U extends keyof NotifyEvents>(event: U, ...args: Parameters<NotifyEvents[U]>): this;
}

const client = io(process.env.VUE_APP_WEBSOCKET_HOST || 'http://localhost:8080') as NotifyClient

client.onAny((...args: any) => {
  console.log('message from server:', args)
})

export default client
