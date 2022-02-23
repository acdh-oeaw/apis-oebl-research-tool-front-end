/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GenderAe0Enum } from './GenderAe0Enum';
import type { LemmaresearchEditor } from './LemmaresearchEditor';

export type ListPatchAPIViewResponseInstance = {
    list: LemmaresearchEditor;
    selected: boolean;
    gnd?: Array<string>;
    firstName?: string;
    lastName?: string;
    alternativeNames?: Array<Record<string, any>> | null;
    dateOfBirth?: string;
    dateOfDeath?: string;
    gender?: GenderAe0Enum;
    secondaryLiterature?: Array<Record<string, any>> | null;
}
