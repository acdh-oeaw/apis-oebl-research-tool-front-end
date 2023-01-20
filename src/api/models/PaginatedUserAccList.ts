/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserAcc } from './UserAcc';

export type PaginatedUserAccList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<UserAcc>;
}