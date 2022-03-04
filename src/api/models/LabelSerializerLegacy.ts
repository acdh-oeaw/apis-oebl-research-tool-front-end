/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LabelTypeMinimal } from './LabelTypeMinimal';

export type LabelSerializerLegacy = {
    readonly id?: number;
    /**
     * The entities label or name.
     */
    label?: string;
    /**
     * The ISO 639-3 (or 2) code for the label's language.
     */
    isoCode_639_3?: string | null;
    label_type: LabelTypeMinimal;
}
