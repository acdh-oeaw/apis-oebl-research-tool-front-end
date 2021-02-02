/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IssueLemma } from './IssueLemma';

export type PaginatedIssueLemmaList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<IssueLemma>;
}
