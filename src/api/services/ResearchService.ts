/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateResearchListAPIViewRequest } from '../models/CreateResearchListAPIViewRequest';
import type { List } from '../models/List';
import type { ListCreateAPIViewRequest } from '../models/ListCreateAPIViewRequest';
import type { ListCreateAPIViewResponse } from '../models/ListCreateAPIViewResponse';
import type { ListEntry } from '../models/ListEntry';
import type { ListPatchAPIViewResponse } from '../models/ListPatchAPIViewResponse';
import type { ListRequest } from '../models/ListRequest';
import type { PaginatedListEntryList } from '../models/PaginatedListEntryList';
import type { PaginatedListList } from '../models/PaginatedListList';
import type { PatchedLemmaResearchPatchAPIViewRequest } from '../models/PatchedLemmaResearchPatchAPIViewRequest';
import type { PatchedListRequest } from '../models/PatchedListRequest';
import { request as __request } from '../core/request';

export class ResearchService {

    /**
     * APIView to process scraping requests
 *
 * Args:
 * GenericAPIView ([type]): [description]
     * @param deleted 
     * @param limit Number of results to return per page.
     * @param modifiedAfter 
     * @param offset The initial index from which to return the results.
     * @returns PaginatedListEntryList 
     * @throws ApiError
     */
    public static async researchApiV1LemmaresearchList(
deleted?: boolean,
limit?: number,
modifiedAfter?: string,
offset?: number,
): Promise<PaginatedListEntryList> {
        const result = await __request({
            method: 'GET',
            path: `/research/api/v1/lemmaresearch/`,
            query: {
                'deleted': deleted,
                'limit': limit,
                'modified_after': modifiedAfter,
                'offset': offset,
            },
        });
        return result.body;
    }

    /**
     * Endpoint that allows to POST a list of lemmas to the research pipeline for processing.
 * All additional fields not mentioned in the Schema are stored and retrieved as user specific fields.
 * 
     * @param requestBody 
     * @returns ListCreateAPIViewResponse 
     * @throws ApiError
     */
    public static async researchApiV1LemmaresearchCreate(
requestBody: ListCreateAPIViewRequest,
): Promise<ListCreateAPIViewResponse> {
        const result = await __request({
            method: 'POST',
            path: `/research/api/v1/lemmaresearch/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * APIView to process scraping requests
 *
 * Args:
 * GenericAPIView ([type]): [description]
     * @param id A unique integer value identifying this list entry.
     * @returns ListEntry 
     * @throws ApiError
     */
    public static async researchApiV1LemmaresearchRetrieve(
id: number,
): Promise<ListEntry> {
        const result = await __request({
            method: 'GET',
            path: `/research/api/v1/lemmaresearch/${id}/`,
        });
        return result.body;
    }

    /**
     * Endpoint that allows to POST a list of lemmas to the research pipeline for processing.
 * All additional fields not mentioned in the Schema are stored and retrieved as user specific fields.
 * 
     * @param id A unique integer value identifying this list entry.
     * @param requestBody 
     * @returns ListPatchAPIViewResponse 
     * @throws ApiError
     */
    public static async researchApiV1LemmaresearchPartialUpdate(
id: number,
requestBody?: PatchedLemmaResearchPatchAPIViewRequest,
): Promise<ListPatchAPIViewResponse> {
        const result = await __request({
            method: 'PATCH',
            path: `/research/api/v1/lemmaresearch/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * APIView to process scraping requests
 *
 * Args:
 * GenericAPIView ([type]): [description]
     * @param id A unique integer value identifying this list entry.
     * @returns void 
     * @throws ApiError
     */
    public static async researchApiV1LemmaresearchDestroy(
id: number,
): Promise<void> {
        const result = await __request({
            method: 'DELETE',
            path: `/research/api/v1/lemmaresearch/${id}/`,
        });
        return result.body;
    }

    /**
     * @param editor 
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @param title 
     * @returns PaginatedListList 
     * @throws ApiError
     */
    public static async researchApiV1ListresearchList(
editor?: number,
limit?: number,
offset?: number,
title?: string,
): Promise<PaginatedListList> {
        const result = await __request({
            method: 'GET',
            path: `/research/api/v1/listresearch/`,
            query: {
                'editor': editor,
                'limit': limit,
                'offset': offset,
                'title': title,
            },
        });
        return result.body;
    }

    /**
     * Endpoint that allows to create a Research Lemma List
 * 
     * @param requestBody 
     * @returns List 
     * @throws ApiError
     */
    public static async researchApiV1ListresearchCreate(
requestBody: CreateResearchListAPIViewRequest,
): Promise<List> {
        const result = await __request({
            method: 'POST',
            path: `/research/api/v1/listresearch/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this list.
     * @returns List 
     * @throws ApiError
     */
    public static async researchApiV1ListresearchRetrieve(
id: number,
): Promise<List> {
        const result = await __request({
            method: 'GET',
            path: `/research/api/v1/listresearch/${id}/`,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this list.
     * @param requestBody 
     * @returns List 
     * @throws ApiError
     */
    public static async researchApiV1ListresearchUpdate(
id: number,
requestBody: ListRequest,
): Promise<List> {
        const result = await __request({
            method: 'PUT',
            path: `/research/api/v1/listresearch/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this list.
     * @param requestBody 
     * @returns List 
     * @throws ApiError
     */
    public static async researchApiV1ListresearchPartialUpdate(
id: number,
requestBody?: PatchedListRequest,
): Promise<List> {
        const result = await __request({
            method: 'PATCH',
            path: `/research/api/v1/listresearch/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this list.
     * @returns void 
     * @throws ApiError
     */
    public static async researchApiV1ListresearchDestroy(
id: number,
): Promise<void> {
        const result = await __request({
            method: 'DELETE',
            path: `/research/api/v1/listresearch/${id}/`,
        });
        return result.body;
    }

}