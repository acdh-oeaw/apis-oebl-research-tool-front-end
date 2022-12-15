/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LemmaArticle } from './LemmaArticle';

export type PaginatedLemmaArticleList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<LemmaArticle>;
}
