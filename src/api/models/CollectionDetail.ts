/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApisBase } from './ApisBase';
import type { Label } from './Label';

export type CollectionDetail = {
    readonly url?: string;
    readonly id?: number;
    name: string;
    description?: string;
    published?: boolean;
    readonly collection_type?: Label;
    readonly parent_class?: ApisBase;
}
