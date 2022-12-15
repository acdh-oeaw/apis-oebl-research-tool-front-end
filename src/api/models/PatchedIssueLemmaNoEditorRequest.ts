/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LemmaRequest } from './LemmaRequest';

/**
 * A Serialization Of IssueLemma Without The Editor Field
 *
 * Our requirement is, that authors and editors can not see, who is assigned for IssueLemmas.
 */
export type PatchedIssueLemmaNoEditorRequest = {
    lemma?: LemmaRequest;
    order?: number;
    issue?: number | null;
    status?: number | null;
    labels?: Array<number>;
}
