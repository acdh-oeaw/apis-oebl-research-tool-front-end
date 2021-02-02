/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { StatusEnum } from './StatusEnum';

export type PatchedInstitutionplacerelationDetailRequest = {
    name?: string;
    /**
     * Brief description of the used term.
     */
    description?: string;
    status?: StatusEnum;
    /**
     * Inverse relation like: "is sub-class of" vs. "is super-class of".
     */
    name_reverse?: string;
}
