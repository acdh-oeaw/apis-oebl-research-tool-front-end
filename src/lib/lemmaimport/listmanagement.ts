import Vue from "vue";

import { type List } from "@/api/models/List";
import store from "@/store";
import { type NewLemmaRow } from "@/types/lemma";

type ChosenLemmaList = NonNullable<NewLemmaRow["list"]>;

export class ListManager {
	static createObservableListManager(): ListManager {
		return Vue.observable(new ListManager());
	}

	private store = store;

	get lemmaLists(): Array<ChosenLemmaList> {
		const listsInOtherListFormat = this.store.lemma.lemmaLists;
		return listsInOtherListFormat.map((otherFormat) => {
			return {
				id: otherFormat.id,
				title: otherFormat.title,
				editor: otherFormat.editor?.userId,
			};
		});
	}

	public async createNewLemmaList(title: string): Promise<ChosenLemmaList> {
		if (title in this.lemmaLists.map((list) => list.title)) {
			throw Error(`Lemma list with title <${title}> can not be created: It already exists`);
		}

		const theOtherListFormat: List = await this.store.lemma.createList(title);
		return {
			id: theOtherListFormat.id,
			title: theOtherListFormat.title,
			editor: theOtherListFormat.editor?.userId,
		};
	}

	public async getLemmaList(title: string): Promise<ChosenLemmaList> {
		const lemmaLists = this.lemmaLists.filter(
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			(list) => list.title != null && list.title === title,
		);
		if (lemmaLists.length === 1) {
			return lemmaLists[0]!;
		}

		if (lemmaLists.length > 1) {
			console.warn(
				`Found ${lemmaLists.length} lemma lists with title <${title}> – these should be unique, Dude! (I am pretty sure ;-)`,
			);
			return lemmaLists[0]!; // I don't really care, they have IDs.
		}

		return await this.createNewLemmaList(title);
	}
}
