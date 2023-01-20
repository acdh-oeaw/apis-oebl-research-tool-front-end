/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Eventtype } from './Eventtype';

export type PaginatedEventtypeList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Eventtype>;
}