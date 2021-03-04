/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Author } from '../models/Author';
import type { Editor } from '../models/Editor';
import type { Issue } from '../models/Issue';
import type { IssueLemma } from '../models/IssueLemma';
import type { IssueLemmaRequest } from '../models/IssueLemmaRequest';
import type { IssueRequest } from '../models/IssueRequest';
import type { Lemma } from '../models/Lemma';
import type { LemmaLabel } from '../models/LemmaLabel';
import type { LemmaLabelRequest } from '../models/LemmaLabelRequest';
import type { LemmaNote } from '../models/LemmaNote';
import type { LemmaNoteRequest } from '../models/LemmaNoteRequest';
import type { LemmaStatus } from '../models/LemmaStatus';
import type { LemmaStatusRequest } from '../models/LemmaStatusRequest';
import type { PaginatedAuthorList } from '../models/PaginatedAuthorList';
import type { PaginatedEditorList } from '../models/PaginatedEditorList';
import type { PaginatedIssueLemmaList } from '../models/PaginatedIssueLemmaList';
import type { PaginatedIssueList } from '../models/PaginatedIssueList';
import type { PaginatedLemmaLabelList } from '../models/PaginatedLemmaLabelList';
import type { PaginatedLemmaList } from '../models/PaginatedLemmaList';
import type { PaginatedLemmaNoteList } from '../models/PaginatedLemmaNoteList';
import type { PaginatedLemmaStatusList } from '../models/PaginatedLemmaStatusList';
import type { PatchedIssueLemmaRequest } from '../models/PatchedIssueLemmaRequest';
import type { PatchedIssueRequest } from '../models/PatchedIssueRequest';
import type { PatchedLemmaLabelRequest } from '../models/PatchedLemmaLabelRequest';
import type { PatchedLemmaNoteRequest } from '../models/PatchedLemmaNoteRequest';
import type { PatchedLemmaStatusRequest } from '../models/PatchedLemmaStatusRequest';
import type { ResearchLemma2WorkfloweResponse } from '../models/ResearchLemma2WorkfloweResponse';
import type { ResearchLemma2WorkflowLemmaRequest } from '../models/ResearchLemma2WorkflowLemmaRequest';
import { request as __request } from '../core/request';

export class WorkflowService {

    /**
     * Viewset to retrieve Author objects
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @param username username
     * @returns PaginatedAuthorList
     * @throws ApiError
     */
    public static async workflowApiV1AuthorsList(
        limit?: number,
        offset?: number,
        username?: string,
    ): Promise<PaginatedAuthorList> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/authors/`,
            query: {
                'limit': limit,
                'offset': offset,
                'username': username,
            },
        });
        return result.body;
    }

    /**
     * Viewset to retrieve Author objects
     * @param id A unique integer value identifying this Benutzer.
     * @returns Author
     * @throws ApiError
     */
    public static async workflowApiV1AuthorsRetrieve(
        id: number,
    ): Promise<Author> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/authors/${id}/`,
        });
        return result.body;
    }

    /**
     * Viewset to retrieve Editor objects
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @param username username
     * @returns PaginatedEditorList
     * @throws ApiError
     */
    public static async workflowApiV1EditorsList(
        limit?: number,
        offset?: number,
        username?: string,
    ): Promise<PaginatedEditorList> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/editors/`,
            query: {
                'limit': limit,
                'offset': offset,
                'username': username,
            },
        });
        return result.body;
    }

    /**
     * Viewset to retrieve Editor objects
     * @param id A unique integer value identifying this Benutzer.
     * @returns Editor
     * @throws ApiError
     */
    public static async workflowApiV1EditorsRetrieve(
        id: number,
    ): Promise<Editor> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/editors/${id}/`,
        });
        return result.body;
    }

    /**
     * @param author author
     * @param editor editor
     * @param issue issue
     * @param lemma lemma
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @returns PaginatedIssueLemmaList
     * @throws ApiError
     */
    public static async workflowApiV1IssueLemmaList(
        author?: number,
        editor?: number,
        issue?: number,
        lemma?: number,
        limit?: number,
        offset?: number,
    ): Promise<PaginatedIssueLemmaList> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/issue-lemma/`,
            query: {
                'author': author,
                'editor': editor,
                'issue': issue,
                'lemma': lemma,
                'limit': limit,
                'offset': offset,
            },
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns IssueLemma
     * @throws ApiError
     */
    public static async workflowApiV1IssueLemmaCreate(
        requestBody: IssueLemmaRequest,
    ): Promise<IssueLemma> {
        const result = await __request({
            method: 'POST',
            path: `/workflow/api/v1/issue-lemma/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this issue lemma.
     * @returns IssueLemma
     * @throws ApiError
     */
    public static async workflowApiV1IssueLemmaRetrieve(
        id: number,
    ): Promise<IssueLemma> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/issue-lemma/${id}/`,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this issue lemma.
     * @param requestBody
     * @returns IssueLemma
     * @throws ApiError
     */
    public static async workflowApiV1IssueLemmaPartialUpdate(
        id: number,
        requestBody?: PatchedIssueLemmaRequest,
    ): Promise<IssueLemma> {
        const result = await __request({
            method: 'PATCH',
            path: `/workflow/api/v1/issue-lemma/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this issue lemma.
     * @returns any No response body
     * @throws ApiError
     */
    public static async workflowApiV1IssueLemmaDestroy(
        id: number,
    ): Promise<any> {
        const result = await __request({
            method: 'DELETE',
            path: `/workflow/api/v1/issue-lemma/${id}/`,
        });
        return result.body;
    }

    /**
     * @param limit Number of results to return per page.
     * @param name name
     * @param offset The initial index from which to return the results.
     * @param pubDate pubDate
     * @returns PaginatedIssueList
     * @throws ApiError
     */
    public static async workflowApiV1IssuesList(
        limit?: number,
        name?: string,
        offset?: number,
        pubDate?: string,
    ): Promise<PaginatedIssueList> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/issues/`,
            query: {
                'limit': limit,
                'name': name,
                'offset': offset,
                'pubDate': pubDate,
            },
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns Issue
     * @throws ApiError
     */
    public static async workflowApiV1IssuesCreate(
        requestBody: IssueRequest,
    ): Promise<Issue> {
        const result = await __request({
            method: 'POST',
            path: `/workflow/api/v1/issues/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this issue.
     * @returns Issue
     * @throws ApiError
     */
    public static async workflowApiV1IssuesRetrieve(
        id: number,
    ): Promise<Issue> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/issues/${id}/`,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this issue.
     * @param requestBody
     * @returns Issue
     * @throws ApiError
     */
    public static async workflowApiV1IssuesUpdate(
        id: number,
        requestBody: IssueRequest,
    ): Promise<Issue> {
        const result = await __request({
            method: 'PUT',
            path: `/workflow/api/v1/issues/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this issue.
     * @param requestBody
     * @returns Issue
     * @throws ApiError
     */
    public static async workflowApiV1IssuesPartialUpdate(
        id: number,
        requestBody?: PatchedIssueRequest,
    ): Promise<Issue> {
        const result = await __request({
            method: 'PATCH',
            path: `/workflow/api/v1/issues/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this issue.
     * @returns any No response body
     * @throws ApiError
     */
    public static async workflowApiV1IssuesDestroy(
        id: number,
    ): Promise<any> {
        const result = await __request({
            method: 'DELETE',
            path: `/workflow/api/v1/issues/${id}/`,
        });
        return result.body;
    }

    /**
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @returns PaginatedLemmaList
     * @throws ApiError
     */
    public static async workflowApiV1LemmaList(
        limit?: number,
        offset?: number,
    ): Promise<PaginatedLemmaList> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/lemma/`,
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
        return result.body;
    }

    /**
     * @param issuelemma issuelemma
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @returns PaginatedLemmaLabelList
     * @throws ApiError
     */
    public static async workflowApiV1LemmaLabelList(
        issuelemma?: number,
        limit?: number,
        offset?: number,
    ): Promise<PaginatedLemmaLabelList> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/lemma-label/`,
            query: {
                'issuelemma': issuelemma,
                'limit': limit,
                'offset': offset,
            },
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns LemmaLabel
     * @throws ApiError
     */
    public static async workflowApiV1LemmaLabelCreate(
        requestBody: LemmaLabelRequest,
    ): Promise<LemmaLabel> {
        const result = await __request({
            method: 'POST',
            path: `/workflow/api/v1/lemma-label/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma label.
     * @returns LemmaLabel
     * @throws ApiError
     */
    public static async workflowApiV1LemmaLabelRetrieve(
        id: number,
    ): Promise<LemmaLabel> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/lemma-label/${id}/`,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma label.
     * @param requestBody
     * @returns LemmaLabel
     * @throws ApiError
     */
    public static async workflowApiV1LemmaLabelUpdate(
        id: number,
        requestBody: LemmaLabelRequest,
    ): Promise<LemmaLabel> {
        const result = await __request({
            method: 'PUT',
            path: `/workflow/api/v1/lemma-label/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma label.
     * @param requestBody
     * @returns LemmaLabel
     * @throws ApiError
     */
    public static async workflowApiV1LemmaLabelPartialUpdate(
        id: number,
        requestBody?: PatchedLemmaLabelRequest,
    ): Promise<LemmaLabel> {
        const result = await __request({
            method: 'PATCH',
            path: `/workflow/api/v1/lemma-label/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma label.
     * @returns any No response body
     * @throws ApiError
     */
    public static async workflowApiV1LemmaLabelDestroy(
        id: number,
    ): Promise<any> {
        const result = await __request({
            method: 'DELETE',
            path: `/workflow/api/v1/lemma-label/${id}/`,
        });
        return result.body;
    }

    /**
     * @param lemma lemma
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @returns PaginatedLemmaNoteList
     * @throws ApiError
     */
    public static async workflowApiV1LemmaNoteList(
        lemma?: number,
        limit?: number,
        offset?: number,
    ): Promise<PaginatedLemmaNoteList> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/lemma-note/`,
            query: {
                'lemma': lemma,
                'limit': limit,
                'offset': offset,
            },
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns LemmaNote
     * @throws ApiError
     */
    public static async workflowApiV1LemmaNoteCreate(
        requestBody: LemmaNoteRequest,
    ): Promise<LemmaNote> {
        const result = await __request({
            method: 'POST',
            path: `/workflow/api/v1/lemma-note/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma note.
     * @returns LemmaNote
     * @throws ApiError
     */
    public static async workflowApiV1LemmaNoteRetrieve(
        id: number,
    ): Promise<LemmaNote> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/lemma-note/${id}/`,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma note.
     * @param requestBody
     * @returns LemmaNote
     * @throws ApiError
     */
    public static async workflowApiV1LemmaNoteUpdate(
        id: number,
        requestBody: LemmaNoteRequest,
    ): Promise<LemmaNote> {
        const result = await __request({
            method: 'PUT',
            path: `/workflow/api/v1/lemma-note/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma note.
     * @param requestBody
     * @returns LemmaNote
     * @throws ApiError
     */
    public static async workflowApiV1LemmaNotePartialUpdate(
        id: number,
        requestBody?: PatchedLemmaNoteRequest,
    ): Promise<LemmaNote> {
        const result = await __request({
            method: 'PATCH',
            path: `/workflow/api/v1/lemma-note/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma note.
     * @returns any No response body
     * @throws ApiError
     */
    public static async workflowApiV1LemmaNoteDestroy(
        id: number,
    ): Promise<any> {
        const result = await __request({
            method: 'DELETE',
            path: `/workflow/api/v1/lemma-note/${id}/`,
        });
        return result.body;
    }

    /**
     * @param issue issue
     * @param issuelemma issuelemma
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @returns PaginatedLemmaStatusList
     * @throws ApiError
     */
    public static async workflowApiV1LemmaStatusList(
        issue?: number,
        issuelemma?: number,
        limit?: number,
        offset?: number,
    ): Promise<PaginatedLemmaStatusList> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/lemma-status/`,
            query: {
                'issue': issue,
                'issuelemma': issuelemma,
                'limit': limit,
                'offset': offset,
            },
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns LemmaStatus
     * @throws ApiError
     */
    public static async workflowApiV1LemmaStatusCreate(
        requestBody: LemmaStatusRequest,
    ): Promise<LemmaStatus> {
        const result = await __request({
            method: 'POST',
            path: `/workflow/api/v1/lemma-status/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma status.
     * @returns LemmaStatus
     * @throws ApiError
     */
    public static async workflowApiV1LemmaStatusRetrieve(
        id: number,
    ): Promise<LemmaStatus> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/lemma-status/${id}/`,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma status.
     * @param requestBody
     * @returns LemmaStatus
     * @throws ApiError
     */
    public static async workflowApiV1LemmaStatusUpdate(
        id: number,
        requestBody: LemmaStatusRequest,
    ): Promise<LemmaStatus> {
        const result = await __request({
            method: 'PUT',
            path: `/workflow/api/v1/lemma-status/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma status.
     * @param requestBody
     * @returns LemmaStatus
     * @throws ApiError
     */
    public static async workflowApiV1LemmaStatusPartialUpdate(
        id: number,
        requestBody?: PatchedLemmaStatusRequest,
    ): Promise<LemmaStatus> {
        const result = await __request({
            method: 'PATCH',
            path: `/workflow/api/v1/lemma-status/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma status.
     * @returns any No response body
     * @throws ApiError
     */
    public static async workflowApiV1LemmaStatusDestroy(
        id: number,
    ): Promise<any> {
        const result = await __request({
            method: 'DELETE',
            path: `/workflow/api/v1/lemma-status/${id}/`,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma.
     * @returns Lemma
     * @throws ApiError
     */
    public static async workflowApiV1LemmaRetrieve(
        id: number,
    ): Promise<Lemma> {
        const result = await __request({
            method: 'GET',
            path: `/workflow/api/v1/lemma/${id}/`,
        });
        return result.body;
    }

    /**
     * Endpoint that allows to POST a list of lemmas to the research pipeline for processing.
     * All additional fields not mentioned in the Schema are stored and retrieved as user specific fields.
     *
     * @param requestBody
     * @returns ResearchLemma2WorkfloweResponse
     * @throws ApiError
     */
    public static async workflowApiV1Research2WorkflowCreate(
        requestBody: ResearchLemma2WorkflowLemmaRequest,
    ): Promise<ResearchLemma2WorkfloweResponse> {
        const result = await __request({
            method: 'POST',
            path: `/workflow/api/v1/research2workflow/`,
            body: requestBody,
        });
        return result.body;
    }

}