import { NewLemmaRow } from "@/types/lemma";


export async function importLemmas(lemmas: NewLemmaRow[]): Promise<void> {
    await new Promise(r => setTimeout(r, 1123)); // Work in progress: Fake network loading time in ux.
    throw Error('Not implemented');

}