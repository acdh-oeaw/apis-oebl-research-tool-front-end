/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Uricandidate } from './Uricandidate';

export type PaginatedUricandidateList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Uricandidate>;
}