/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { request as __request } from '../core/request';

export class MeService {

    /**
     * Viewset to show UserProfile of current User
     * @returns any No response body
     * @throws ApiError
     */
    public static async meRetrieve(): Promise<any> {
        const result = await __request({
            method: 'GET',
            path: `/me/`,
        });
        return result.body;
    }

}