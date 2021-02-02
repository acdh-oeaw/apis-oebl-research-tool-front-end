/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Personplacerelation } from './Personplacerelation';

export type PaginatedPersonplacerelationList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Personplacerelation>;
}
