/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Institution } from './Institution';

export type PaginatedInstitutionList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Institution>;
}
