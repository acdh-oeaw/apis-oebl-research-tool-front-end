/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Personwork } from './Personwork';

export type PaginatedPersonworkList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Personwork>;
}
