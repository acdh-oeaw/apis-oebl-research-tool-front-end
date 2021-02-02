/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Personplace } from './Personplace';

export type PaginatedPersonplaceList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Personplace>;
}
