/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { StatusEnum } from './StatusEnum';

export type PatchedInstitutiontypeDetailRequest = {
    name?: string;
    /**
     * Brief description of the used term.
     */
    description?: string;
    status?: StatusEnum;
}
