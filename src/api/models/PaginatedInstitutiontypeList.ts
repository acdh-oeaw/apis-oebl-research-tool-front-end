/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Institutiontype } from './Institutiontype';

export type PaginatedInstitutiontypeList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Institutiontype>;
}