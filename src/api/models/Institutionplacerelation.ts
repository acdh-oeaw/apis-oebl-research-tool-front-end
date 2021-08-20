/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Label } from './Label';
import type { StatusEnum } from './StatusEnum';

export type Institutionplacerelation = {
    readonly url?: string;
    readonly id?: number;
    name: string;
    /**
     * Brief description of the used term.
     */
    description?: string;
    status?: StatusEnum;
    /**
     * Inverse relation like: "is sub-class of" vs. "is super-class of".
     */
    name_reverse?: string;
    readonly parent_class?: Label;
    readonly vocab_name?: Label;
}
