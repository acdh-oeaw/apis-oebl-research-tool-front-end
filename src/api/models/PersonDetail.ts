/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApisBase } from './ApisBase';
import type { BlankEnum } from './BlankEnum';
import type { GenderEnum } from './GenderEnum';
import type { Label } from './Label';
import type { NullEnum } from './NullEnum';

export type PersonDetail = {
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
    /**
     * The persons´s forename. In case of more then one name...
     */
    first_name?: string | null;
    gender?: (GenderEnum | BlankEnum | NullEnum) | null;
    readonly source?: ApisBase;
    readonly text?: Array<ApisBase>;
    readonly collection?: Array<ApisBase>;
    readonly profession?: Array<Label>;
    readonly title?: Array<Label>;
}
