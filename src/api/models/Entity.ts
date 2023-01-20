/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EntityUri } from './EntityUri';
import type { LabelSerializerLegacy } from './LabelSerializerLegacy';

export type Entity = {
    id: number;
    readonly url?: string;
    name: string;
    start_date: string;
    end_date: string;
    uris: Array<EntityUri>;
    labels: Array<LabelSerializerLegacy>;
    readonly revisions?: string;
}