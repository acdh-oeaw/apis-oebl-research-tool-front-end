/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Personinstitution } from './Personinstitution';

export type PaginatedPersoninstitutionList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Personinstitution>;
}
