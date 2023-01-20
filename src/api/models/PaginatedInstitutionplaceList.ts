/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Institutionplace } from './Institutionplace';

export type PaginatedInstitutionplaceList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Institutionplace>;
}