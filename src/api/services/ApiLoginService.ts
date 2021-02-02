/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthToken } from '../models/AuthToken';
import type { AuthTokenRequest } from '../models/AuthTokenRequest';
import { request as __request } from '../core/request';

export class ApiLoginService {

    /**
     * @param requestBody
     * @returns AuthToken
     * @throws ApiError
     */
    public static async apiLoginCreate(
        requestBody: AuthTokenRequest,
    ): Promise<AuthToken> {
        const result = await __request({
            method: 'POST',
            path: `/api_login/`,
            body: requestBody,
        });
        return result.body;
    }

}