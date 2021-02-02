/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LemmaStatus } from './LemmaStatus';

export type PaginatedLemmaStatusList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<LemmaStatus>;
}
