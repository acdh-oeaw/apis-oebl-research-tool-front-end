/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LemmasCreateRequest } from './LemmasCreateRequest';

export type ListCreateAPIViewRequest = {
    listId: number;
    lemmas: Array<LemmasCreateRequest>;
}
