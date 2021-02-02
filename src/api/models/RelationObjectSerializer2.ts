/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Entity } from './Entity';
import type { VocabsBase } from './VocabsBase';

export type RelationObjectSerializer2 = {
    readonly id?: number;
    readonly label?: string;
    readonly url?: string;
    readonly relation_type?: (VocabsBase);
    readonly related_entity?: (Entity);
}
