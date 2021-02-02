/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ListCreateAPIViewResponse } from './ListCreateAPIViewResponse';

export type PaginatedListCreateAPIViewResponseList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<ListCreateAPIViewResponse>;
}
