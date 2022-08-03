/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EditTypeEnum } from './EditTypeEnum';

export type AuthorIssueLemmaAssignmentRequest = {
    issue_lemma: number;
    author: number;
    edit_type: EditTypeEnum;
}
