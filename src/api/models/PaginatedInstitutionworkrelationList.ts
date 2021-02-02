/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Institutionworkrelation } from './Institutionworkrelation';

export type PaginatedInstitutionworkrelationList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Institutionworkrelation>;
}
