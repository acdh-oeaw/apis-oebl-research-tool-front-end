/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PatchedLemmaRequest } from './PatchedLemmaRequest';

export type PatchedIssueLemmaRequest = {
    lemma?: PatchedLemmaRequest;
    order?: number;
    issue?: number | null;
    status?: number | null;
    author?: number | null;
    editor?: number | null;
    labels?: Array<number>;
}
