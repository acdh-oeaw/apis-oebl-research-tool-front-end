/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { User } from './User';

export type PaginatedUserList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<User>;
}
