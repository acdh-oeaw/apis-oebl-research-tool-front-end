/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Institutioneventrelation } from './Institutioneventrelation';

export type PaginatedInstitutioneventrelationList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Institutioneventrelation>;
}