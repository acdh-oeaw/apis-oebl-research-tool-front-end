/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Institutioninstitution } from './Institutioninstitution';

export type PaginatedInstitutioninstitutionList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Institutioninstitution>;
}
