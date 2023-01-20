/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApisBase } from './ApisBase';
import type { Label } from './Label';

export type Place = {
    readonly url?: string;
    readonly id?: number;
    name?: string;
    /**
     * Should be set to True, if the data record holds up quality standards.
     */
    review?: boolean;
    start_date?: string | null;
    start_start_date?: string | null;
    start_end_date?: string | null;
    end_date?: string | null;
    end_start_date?: string | null;
    end_end_date?: string | null;
    start_date_written?: string | null;
    end_date_written?: string | null;
    status: string;
    references?: string | null;
    notes?: string | null;
    published?: boolean;
    lat?: number | null;
    lng?: number | null;
    readonly source?: ApisBase;
    readonly kind?: Label;
    readonly text?: Array<ApisBase>;
    readonly collection?: Array<ApisBase>;
    readonly sameAs?: string;
}