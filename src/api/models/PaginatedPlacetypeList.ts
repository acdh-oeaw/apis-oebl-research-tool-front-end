/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Placetype } from './Placetype';

export type PaginatedPlacetypeList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Placetype>;
}