import { z } from "zod";

export const lemma = z.object({
	id: z.number().optional(),
	firstName: z.string(),
	lastName: z.string(),
	dateOfBirth: z.string().datetime().optional(),
	dateOfDeath: z.string().datetime().optional(),
	info: z.string().nullable().optional(),
});

export type Lemma = z.infer<typeof lemma>;

export const lemmas = z.array(lemma);

export type Lemmas = z.infer<typeof lemmas>;

export const issueLemma = z.object({
	id: z.number().optional(),
	notes: z.array(z.number()).optional(),
	serialization: z.array(z.any() /** IssueLemmaSerializerOpenApi */).optional(),
	lemma: lemma,
	authors: z.array(z.number()).optional(),
	order: z.number().optional(),
	created: z.string().optional(),
	issue: z.number().nullable().optional(),
	status: z.number().nullable().optional(),
	editor: z.number().nullable().optional(),
	labels: z.array(z.number()).optional(),
});

export type IssueLemma = z.infer<typeof issueLemma>;

export const issueLemmas = z.array(issueLemma);

export type IssueLemmas = z.infer<typeof issueLemmas>;
