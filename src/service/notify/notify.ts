import { io, type Socket } from "socket.io-client";

import { type Editor } from "@/api";
import { type IssueLemma } from "@/api/models/IssueLemma";
import { type List as LemmaList } from "@/api/models/List";
import { env } from "@/config/env";
import { type WithId } from "@/types";
import { type LemmaRow, type ServerResearchLemma } from "@/types/lemma";

/** All possible Events that can be sent over the bus. Add new Event Types here. */
export interface NotifyEvents {
	disconnect: () => void;
	updateIssueLemmas: (ids: Array<number>, ils: Partial<IssueLemma>) => void;
	addLemma: (ls: LemmaRow) => void;
	updateLemmas: (ls: Array<LemmaRow>, u: Partial<LemmaRow>, e: Editor) => void;
	importLemmas: (ls: Array<ServerResearchLemma>) => void;
	importIssueLemmas: (ls: Array<WithId<IssueLemma>>) => void;
	deleteLemmas: (ids: Array<number>) => void;
	createLemmaList: (l: LemmaList) => void;
	updateLemmaList: (l: LemmaList) => void;
	deleteLemmaList: (l: LemmaList) => void;
}

interface NotifyClient extends Socket {
	on<U extends keyof NotifyEvents>(event: U, listener: NotifyEvents[U]): this;
	emit<U extends keyof NotifyEvents>(event: U, ...args: Parameters<NotifyEvents[U]>): this;
}

const client = io(env.VUE_APP_EVENTBUS_HOST || "http://localhost:3333") as NotifyClient;

client.onAny((...args: any) => {
	console.log("message from server:", args);
});

export default client;
