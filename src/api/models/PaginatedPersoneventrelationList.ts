/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Personeventrelation } from './Personeventrelation';

export type PaginatedPersoneventrelationList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Personeventrelation>;
}
