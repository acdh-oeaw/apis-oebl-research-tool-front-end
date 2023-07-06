import _ from "lodash";

import { type LemmaRow } from "@/types/lemma";

interface SearchItemLemma {
	type: "lemma";
	item: LemmaRow;
}

export type SearchItem = SearchItemLemma;

export default class SearchStore {
	_recentSearchItems: Array<SearchItem> = JSON.parse(
		localStorage.getItem("recentSearchItems") || "[]",
	);
	private maxSearchItems = 10;

	get recentSearchItems() {
		return this._recentSearchItems;
	}

	set recentSearchItems(sis) {
		localStorage.setItem("recentSearchItems", JSON.stringify(sis));
		this._recentSearchItems = sis;
	}

	addRecentSearchItem(si: SearchItem) {
		this.recentSearchItems = _.uniqBy(
			[si].concat(_.take(this.recentSearchItems, this.maxSearchItems - 1)),
			(i) => i.item.id + "__" + i.type,
		);
	}
}
