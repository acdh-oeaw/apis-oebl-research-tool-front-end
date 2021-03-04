/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LemmaRequest } from './LemmaRequest';

export type IssueLemmaRequest = {
    lemma: LemmaRequest;
    order?: number;
    issue?: number | null;
    status?: number | null;
    author?: number | null;
    editor?: number | null;
    labels?: Array<number>;
}
