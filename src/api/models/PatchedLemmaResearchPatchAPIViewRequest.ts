/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PatchedLemmaresearchEditorRequest } from './PatchedLemmaresearchEditorRequest';

export type PatchedLemmaResearchPatchAPIViewRequest = {
    list?: PatchedLemmaresearchEditorRequest;
    selected?: boolean;
    gnd?: Array<string>;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    dateOfDeath?: string;
}
