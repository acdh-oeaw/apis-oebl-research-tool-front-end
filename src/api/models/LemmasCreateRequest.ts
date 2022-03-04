/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GenderAe0Enum } from './GenderAe0Enum';

export type LemmasCreateRequest = {
    gnd?: Array<string>;
    selected: boolean;
    firstName?: string;
    lastName?: string;
    alternativeNames?: Array<Record<string, any>> | null;
    dateOfBirth?: string;
    dateOfDeath?: string;
    gender?: GenderAe0Enum;
    secondaryLiterature?: Array<Record<string, any>> | null;
    zoteroKeysBy?: Array<string> | null;
    zoteroKeysAbout?: Array<string> | null;
}
