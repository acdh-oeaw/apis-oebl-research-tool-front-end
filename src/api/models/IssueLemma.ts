/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IssueLemmaSerializerOpenApi } from './IssueLemmaSerializerOpenApi';
import type { Lemma } from './Lemma';

/**
 * TODO: This class really needs some refactorization.
 * - It is unclear, what the "serialization" field is for,
 * - why extened schema field?
 * - update and create are very simular, spaghetti, and not very pythonic.
 * I do not do it now, because, we have no tests and I don't have no time.
 */
export type IssueLemma = {
    readonly id?: number;
    readonly notes?: Array<number>;
    readonly serialization?: Array<IssueLemmaSerializerOpenApi>;
    lemma: Lemma;
    readonly authors?: Array<number>;
    order?: number;
    readonly created?: string;
    issue?: number | null;
    status?: number | null;
    editor?: number | null;
    labels?: Array<number>;
}
