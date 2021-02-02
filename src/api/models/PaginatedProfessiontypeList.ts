/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Professiontype } from './Professiontype';

export type PaginatedProfessiontypeList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Professiontype>;
}
