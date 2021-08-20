/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApisBase } from './ApisBase';
import type { Label } from './Label';
import type { StatusEnum } from './StatusEnum';

export type Texttype = {
    readonly url?: string;
    readonly id?: number;
    name: string;
    /**
     * Brief description of the used term.
     */
    description?: string;
    status?: StatusEnum;
    entity: string;
    /**
     * The ISO 639-3 (or 2) code for the label's language.
     */
    lang?: string | null;
    readonly parent_class?: Label;
    readonly vocab_name?: Label;
    readonly collections?: Array<ApisBase>;
}
