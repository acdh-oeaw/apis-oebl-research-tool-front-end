/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { List } from './List';

export type PaginatedListList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<List>;
}
