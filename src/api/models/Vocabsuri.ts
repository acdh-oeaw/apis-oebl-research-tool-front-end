/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Label } from './Label';

export type Vocabsuri = {
    readonly url?: string;
    readonly id?: number;
    uri: string;
    domain?: string;
    rdf_link?: string;
    loaded?: boolean;
    loaded_time?: string | null;
    readonly vocab?: Label;
}