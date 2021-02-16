import { LemmaRow } from '@/types/lemma'
import { io, Socket } from 'socket.io-client'

interface NotifyEvents {
  message: (a: any) => void;
  delete: (changedCount: number) => void;
  updateLemmas: (ls: LemmaRow[], u: Partial<LemmaRow>) => void
}

declare interface NotifyClass extends Socket {
  on<U extends keyof NotifyEvents>(event: U, listener: NotifyEvents[U]): this;
  emit<U extends keyof NotifyEvents>(event: U, ...args: Parameters<NotifyEvents[U]>): this;
}

const client = io(process.env.VUE_APP_WEBSOCKET_HOST || 'http://localhost:8080') as NotifyClass

client.on('message', (...args: any) => {
  console.log(args)
})

export default client
