/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApisBase } from './ApisBase';

export type Uri = {
    readonly url?: string;
    readonly id?: number;
    uri?: string | null;
    domain?: string;
    rdf_link?: string;
    loaded?: boolean;
    loaded_time?: string | null;
    readonly entity?: ApisBase;
}