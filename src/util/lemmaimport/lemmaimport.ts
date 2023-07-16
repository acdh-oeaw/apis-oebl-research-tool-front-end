import { type LemmasCreateRequest, ResearchService } from "@/api";
import { type NewLemmaRow } from "@/types/lemma";

export async function importLemmas(lemmas: Array<NewLemmaRow>): Promise<void> {
	const lists = new Set(lemmas.map((lemma) => lemma.list?.id));
	if (lists.size !== 1) {
		throw new Error("Can only import lemmas belonging to one list at a time");
	}

	const list = lemmas[0]!.list;

	if (list == null) {
		throw new Error("Can not import lemmas without a list");
	}

	const id = list.id;

	if (id == null) {
		throw new Error("can not import with a list, without an ID");
	}

	const requestReadyLemmas: Array<LemmasCreateRequest> = lemmas.map((lemma) =>
		Object.assign(lemma, {
			selected: false, // Now this makes sense, doesn't it?
			dateOfBirth: lemma.dateOfBirth.generateISO_OnlyDate(),
			dateOfDeath: lemma.dateOfDeath.generateISO_OnlyDate(),
		}),
	);

	await ResearchService.researchApiV1LemmaresearchCreate({
		listId: id,
		lemmas: requestReadyLemmas,
	});
}
