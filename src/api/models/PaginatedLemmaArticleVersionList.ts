/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LemmaArticleVersion } from './LemmaArticleVersion';

export type PaginatedLemmaArticleVersionList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<LemmaArticleVersion>;
}