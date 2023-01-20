/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Collection } from './Collection';

export type PaginatedCollectionList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Collection>;
}