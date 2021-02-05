/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PatchedListSerializerLimitedRequest } from './PatchedListSerializerLimitedRequest';

export type PatchedListEntryRequest = {
    list?: PatchedListSerializerLimitedRequest;
    firstName?: string;
    lastName?: string;
    columns_user?: Record<string, any> | null;
    columns_scrape?: Record<string, any> | null;
}
