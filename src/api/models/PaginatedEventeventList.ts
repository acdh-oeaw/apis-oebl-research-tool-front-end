/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Eventevent } from './Eventevent';

export type PaginatedEventeventList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Eventevent>;
}