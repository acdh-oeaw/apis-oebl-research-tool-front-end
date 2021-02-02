/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Placeplace } from './Placeplace';

export type PaginatedPlaceplaceList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Placeplace>;
}
