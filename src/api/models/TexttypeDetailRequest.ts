/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { StatusEnum } from './StatusEnum';

export type TexttypeDetailRequest = {
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
}
