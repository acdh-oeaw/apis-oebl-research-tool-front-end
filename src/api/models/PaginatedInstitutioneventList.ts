/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Institutionevent } from './Institutionevent';

export type PaginatedInstitutioneventList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Institutionevent>;
}