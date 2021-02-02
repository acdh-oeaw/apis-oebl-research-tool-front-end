/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Labeltype } from './Labeltype';

export type PaginatedLabeltypeList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Labeltype>;
}
