/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Workworkrelation } from './Workworkrelation';

export type PaginatedWorkworkrelationList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Workworkrelation>;
}
