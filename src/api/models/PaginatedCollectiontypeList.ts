/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Collectiontype } from './Collectiontype';

export type PaginatedCollectiontypeList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Collectiontype>;
}