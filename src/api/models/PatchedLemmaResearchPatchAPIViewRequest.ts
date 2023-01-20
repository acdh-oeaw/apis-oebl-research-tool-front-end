/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GenderAe0Enum } from './GenderAe0Enum';
import type { LemmaresearchEditorRequest } from './LemmaresearchEditorRequest';

export type PatchedLemmaResearchPatchAPIViewRequest = {
    list?: LemmaresearchEditorRequest;
    selected: boolean;
    gnd?: Array<string>;
    firstName?: string;
    lastName?: string;
    alternativeNames?: Array<Record<string, any>> | null;
    dateOfBirth?: string;
    dateOfDeath?: string;
    gender?: GenderAe0Enum;
    secondaryLiterature?: Array<Record<string, any>> | null;
    gideonLegacyLiterature?: Array<Record<string, any>> | null;
    zoteroKeysBy?: Array<string> | null;
    zoteroKeysAbout?: Array<string> | null;
}