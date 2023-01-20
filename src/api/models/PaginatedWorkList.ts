/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Work } from './Work';

export type PaginatedWorkList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Work>;
}