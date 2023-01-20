/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GenderAe0Enum } from './GenderAe0Enum';

export type LemmasCreateRequest = {
    gnd?: Array<string>;
    selected: boolean;
    firstName?: string | null;
    lastName?: string | null;
    alternativeNames?: Array<Record<string, any>> | null;
    dateOfBirth?: string | null;
    dateOfDeath?: string | null;
    gender?: GenderAe0Enum;
    secondaryLiterature?: Array<Record<string, any>> | null;
    gideonLegacyLiterature?: Array<Record<string, any>> | null;
    zoteroKeysBy?: Array<string> | null;
    zoteroKeysAbout?: Array<string> | null;
}