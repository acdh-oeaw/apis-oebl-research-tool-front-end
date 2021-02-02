/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Placeeventrelation } from './Placeeventrelation';

export type PaginatedPlaceeventrelationList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Placeeventrelation>;
}
