/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ListSerializerLimited } from './ListSerializerLimited';

export type ListEntry = {
    readonly id?: number;
    readonly gnd?: Array<string>;
    list: ListSerializerLimited;
    firstName: string;
    lastName: string;
    columns_user?: Record<string, any> | null;
    columns_scrape?: Record<string, any> | null;
}