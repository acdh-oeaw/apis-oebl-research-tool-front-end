import { NewLemmaRow } from "@/types/lemma";

/**
 * A Lemma Prototype before type-casting / formatting
 */
export type LemmaPrototype = {
    [key in keyof NewLemmaRow]: string
};