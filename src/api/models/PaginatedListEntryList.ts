/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ListEntry } from './ListEntry';

export type PaginatedListEntryList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<ListEntry>;
}
