/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Personevent } from './Personevent';

export type PaginatedPersoneventList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Personevent>;
}