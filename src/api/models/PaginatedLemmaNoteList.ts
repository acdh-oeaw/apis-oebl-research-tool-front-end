/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LemmaNote } from './LemmaNote';

export type PaginatedLemmaNoteList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<LemmaNote>;
}