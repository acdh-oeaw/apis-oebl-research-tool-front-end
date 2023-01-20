/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Personinstitutionrelation } from './Personinstitutionrelation';

export type PaginatedPersoninstitutionrelationList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Personinstitutionrelation>;
}