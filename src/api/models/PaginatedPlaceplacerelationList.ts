/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Placeplacerelation } from './Placeplacerelation';

export type PaginatedPlaceplacerelationList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Placeplacerelation>;
}