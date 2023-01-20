/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Eventwork } from './Eventwork';

export type PaginatedEventworkList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Eventwork>;
}