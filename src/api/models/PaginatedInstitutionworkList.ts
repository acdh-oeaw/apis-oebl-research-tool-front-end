/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Institutionwork } from './Institutionwork';

export type PaginatedInstitutionworkList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Institutionwork>;
}
