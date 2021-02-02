/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Uri } from './Uri';

export type PaginatedUriList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Uri>;
}
