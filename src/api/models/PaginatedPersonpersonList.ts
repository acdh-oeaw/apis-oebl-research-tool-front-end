/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Personperson } from './Personperson';

export type PaginatedPersonpersonList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Personperson>;
}