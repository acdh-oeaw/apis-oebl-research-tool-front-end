/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Author } from './Author';

export type PaginatedAuthorList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Author>;
}
