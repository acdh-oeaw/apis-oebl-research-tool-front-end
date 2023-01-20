/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Label } from './Label';

export type Text = {
    readonly url?: string;
    readonly id?: number;
    text?: string;
    readonly kind?: Label;
}