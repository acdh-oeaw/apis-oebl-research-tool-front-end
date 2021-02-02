/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Texttype } from './Texttype';

export type PaginatedTexttypeList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Texttype>;
}
