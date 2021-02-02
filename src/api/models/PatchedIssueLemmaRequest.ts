/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PatchedIssueLemmaRequest = {
    order?: number;
    issue?: number | null;
    status?: number | null;
    lemma?: number | null;
    author?: number | null;
    editor?: number | null;
    labels?: Array<number>;
}
