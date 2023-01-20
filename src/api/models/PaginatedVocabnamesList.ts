/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Vocabnames } from './Vocabnames';

export type PaginatedVocabnamesList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Vocabnames>;
}