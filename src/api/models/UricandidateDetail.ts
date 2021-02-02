/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApisBase } from './ApisBase';

export type UricandidateDetail = {
    readonly url?: string;
    readonly id?: number;
    uri: string;
    confidence?: number | null;
    responsible: string;
    readonly entity?: (ApisBase);
}
