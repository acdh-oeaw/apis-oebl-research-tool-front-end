/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Eventworkrelation } from './Eventworkrelation';

export type PaginatedEventworkrelationList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Eventworkrelation>;
}