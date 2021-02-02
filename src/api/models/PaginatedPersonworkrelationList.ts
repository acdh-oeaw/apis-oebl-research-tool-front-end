/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Personworkrelation } from './Personworkrelation';

export type PaginatedPersonworkrelationList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Personworkrelation>;
}
