/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Placeevent } from './Placeevent';

export type PaginatedPlaceeventList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Placeevent>;
}