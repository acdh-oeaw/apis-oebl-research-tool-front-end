/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Workwork } from './Workwork';

export type PaginatedWorkworkList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Workwork>;
}
