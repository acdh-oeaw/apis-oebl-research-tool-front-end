/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ListSerializerLimited } from './ListSerializerLimited';

export type ListEntry = {
    readonly id?: number;
    readonly gnd?: Array<string>;
    selected?: boolean;
    list?: ListSerializerLimited | null;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    dateOfDeath: string;
    columns_user?: Record<string, any> | null;
    columns_scrape?: Record<string, any> | null;
    deleted: boolean;
    readonly last_updated?: string;
}
