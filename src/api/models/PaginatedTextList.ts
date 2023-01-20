/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Text } from './Text';

export type PaginatedTextList = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Array<Text>;
}