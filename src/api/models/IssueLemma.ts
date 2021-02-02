/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IssueLemmaSerializerOpenApi } from './IssueLemmaSerializerOpenApi';

export type IssueLemma = {
    readonly id?: number;
    readonly notes?: Array<number>;
    readonly serialization?: Array<IssueLemmaSerializerOpenApi>;
    order?: number;
    readonly created?: string;
    issue?: number | null;
    status?: number | null;
    lemma?: number | null;
    author?: number | null;
    editor?: number | null;
    labels?: Array<number>;
}
