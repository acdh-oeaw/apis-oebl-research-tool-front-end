/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Worktype } from './Worktype';

export type PaginatedWorktypeList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Worktype>;
}