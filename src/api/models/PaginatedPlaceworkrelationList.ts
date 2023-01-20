/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Placeworkrelation } from './Placeworkrelation';

export type PaginatedPlaceworkrelationList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Placeworkrelation>;
}