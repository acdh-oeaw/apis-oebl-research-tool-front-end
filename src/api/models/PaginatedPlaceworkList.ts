/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Placework } from './Placework';

export type PaginatedPlaceworkList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Placework>;
}