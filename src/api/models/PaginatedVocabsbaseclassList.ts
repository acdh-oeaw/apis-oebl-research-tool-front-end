/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Vocabsbaseclass } from './Vocabsbaseclass';

export type PaginatedVocabsbaseclassList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Vocabsbaseclass>;
}