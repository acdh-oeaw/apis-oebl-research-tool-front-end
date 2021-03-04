/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IssueLemmaSerializerOpenApi } from './IssueLemmaSerializerOpenApi';
import type { Lemma } from './Lemma';

export type IssueLemma = {
    readonly id?: number;
    readonly notes?: Array<number>;
    readonly serialization?: Array<IssueLemmaSerializerOpenApi>;
    lemma: Lemma;
    order?: number;
    readonly created?: string;
    issue?: number | null;
    status?: number | null;
    author?: number | null;
    editor?: number | null;
    labels?: Array<number>;
}
