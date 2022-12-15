/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AuthorIssueLemmaAssignment } from './AuthorIssueLemmaAssignment';

export type PaginatedAuthorIssueLemmaAssignmentList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<AuthorIssueLemmaAssignment>;
}
