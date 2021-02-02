/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Place } from './Place';

export type PaginatedPlaceList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Place>;
}
