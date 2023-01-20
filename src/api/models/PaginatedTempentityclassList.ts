/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Tempentityclass } from './Tempentityclass';

export type PaginatedTempentityclassList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Tempentityclass>;
}