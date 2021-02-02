/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Lemma } from './Lemma';

export type PaginatedLemmaList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Lemma>;
}
