/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Title } from './Title';

export type PaginatedTitleList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Title>;
}