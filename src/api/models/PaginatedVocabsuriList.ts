/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Vocabsuri } from './Vocabsuri';

export type PaginatedVocabsuriList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Vocabsuri>;
}
