/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LemmaLabel } from './LemmaLabel';

export type PaginatedLemmaLabelList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<LemmaLabel>;
}