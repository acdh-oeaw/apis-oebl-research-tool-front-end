/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EditTypeEnum } from './EditTypeEnum';

export type AuthorIssueLemmaAssignment = {
    issue_lemma: number;
    author: number;
    edit_type: EditTypeEnum;
    readonly id?: number;
}
