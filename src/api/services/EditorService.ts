/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LemmaArticle } from '../models/LemmaArticle';
import type { LemmaArticleRequest } from '../models/LemmaArticleRequest';
import type { LemmaArticleVersion } from '../models/LemmaArticleVersion';
import type { LemmaArticleVersionRequest } from '../models/LemmaArticleVersionRequest';
import type { PaginatedLemmaArticleList } from '../models/PaginatedLemmaArticleList';
import type { PaginatedLemmaArticleVersionList } from '../models/PaginatedLemmaArticleVersionList';
import type { PatchedLemmaArticleRequest } from '../models/PatchedLemmaArticleRequest';
import type { PatchedLemmaArticleVersionRequest } from '../models/PatchedLemmaArticleVersionRequest';
import { request as __request } from '../core/request';

export class EditorService {

    /**
     * Helper class that provides a standard way to create an ABC using
 * inheritance.
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @returns PaginatedLemmaArticleList 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticleList(
limit?: number,
offset?: number,
): Promise<PaginatedLemmaArticleList> {
        const result = await __request({
            method: 'GET',
            path: `/editor/api/v1/lemma-article/`,
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
        return result.body;
    }

    /**
     * Helper class that provides a standard way to create an ABC using
 * inheritance.
     * @param requestBody 
     * @returns LemmaArticle 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticleCreate(
requestBody: LemmaArticleRequest,
): Promise<LemmaArticle> {
        const result = await __request({
            method: 'POST',
            path: `/editor/api/v1/lemma-article/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param lemmaArticle 
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @returns PaginatedLemmaArticleVersionList 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticleVersionList(
lemmaArticle?: number,
limit?: number,
offset?: number,
): Promise<PaginatedLemmaArticleVersionList> {
        const result = await __request({
            method: 'GET',
            path: `/editor/api/v1/lemma-article-version/`,
            query: {
                'lemma_article': lemmaArticle,
                'limit': limit,
                'offset': offset,
            },
        });
        return result.body;
    }

    /**
     * @param requestBody 
     * @returns LemmaArticleVersion 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticleVersionCreate(
requestBody: LemmaArticleVersionRequest,
): Promise<LemmaArticleVersion> {
        const result = await __request({
            method: 'POST',
            path: `/editor/api/v1/lemma-article-version/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma article version.
     * @returns LemmaArticleVersion 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticleVersionRetrieve(
id: number,
): Promise<LemmaArticleVersion> {
        const result = await __request({
            method: 'GET',
            path: `/editor/api/v1/lemma-article-version/${id}/`,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma article version.
     * @param requestBody 
     * @returns LemmaArticleVersion 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticleVersionUpdate(
id: number,
requestBody: LemmaArticleVersionRequest,
): Promise<LemmaArticleVersion> {
        const result = await __request({
            method: 'PUT',
            path: `/editor/api/v1/lemma-article-version/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma article version.
     * @param requestBody 
     * @returns LemmaArticleVersion 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticleVersionPartialUpdate(
id: number,
requestBody?: PatchedLemmaArticleVersionRequest,
): Promise<LemmaArticleVersion> {
        const result = await __request({
            method: 'PATCH',
            path: `/editor/api/v1/lemma-article-version/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this lemma article version.
     * @returns void 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticleVersionDestroy(
id: number,
): Promise<void> {
        const result = await __request({
            method: 'DELETE',
            path: `/editor/api/v1/lemma-article-version/${id}/`,
        });
        return result.body;
    }

    /**
     * Helper class that provides a standard way to create an ABC using
 * inheritance.
     * @param id 
     * @returns LemmaArticle 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticleRetrieve(
id: string,
): Promise<LemmaArticle> {
        const result = await __request({
            method: 'GET',
            path: `/editor/api/v1/lemma-article/${id}/`,
        });
        return result.body;
    }

    /**
     * Helper class that provides a standard way to create an ABC using
 * inheritance.
     * @param id 
     * @param requestBody 
     * @returns LemmaArticle 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticleUpdate(
id: string,
requestBody: LemmaArticleRequest,
): Promise<LemmaArticle> {
        const result = await __request({
            method: 'PUT',
            path: `/editor/api/v1/lemma-article/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * Helper class that provides a standard way to create an ABC using
 * inheritance.
     * @param id 
     * @param requestBody 
     * @returns LemmaArticle 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticlePartialUpdate(
id: string,
requestBody?: PatchedLemmaArticleRequest,
): Promise<LemmaArticle> {
        const result = await __request({
            method: 'PATCH',
            path: `/editor/api/v1/lemma-article/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * Helper class that provides a standard way to create an ABC using
 * inheritance.
     * @param id 
     * @returns void 
     * @throws ApiError
     */
    public static async editorApiV1LemmaArticleDestroy(
id: string,
): Promise<void> {
        const result = await __request({
            method: 'DELETE',
            path: `/editor/api/v1/lemma-article/${id}/`,
        });
        return result.body;
    }

}