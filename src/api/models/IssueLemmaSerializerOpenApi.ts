/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Editor } from './Editor';
import type { Issue } from './Issue';
import type { Lemma } from './Lemma';
import type { LemmaStatus } from './LemmaStatus';

export type IssueLemmaSerializerOpenApi = {
    readonly id?: number;
    issue: Issue;
    lemma: Lemma;
    editor: Editor;
    status: LemmaStatus;
    order?: number;
    readonly created?: string;
    labels?: Array<number>;
}
