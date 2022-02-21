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
    dateOfBirth?: string;
    dateOfDeath?: string;
    gender?: GenderAe0Enum;
}
