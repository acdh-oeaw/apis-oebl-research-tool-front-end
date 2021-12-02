/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Activation } from '../models/Activation';
import type { ActivationRequest } from '../models/ActivationRequest';
import type { PaginatedUserList } from '../models/PaginatedUserList';
import type { PasswordResetConfirm } from '../models/PasswordResetConfirm';
import type { PasswordResetConfirmRequest } from '../models/PasswordResetConfirmRequest';
import type { PatchedUserRequest } from '../models/PatchedUserRequest';
import type { SendEmailReset } from '../models/SendEmailReset';
import type { SendEmailResetRequest } from '../models/SendEmailResetRequest';
import type { SetPassword } from '../models/SetPassword';
import type { SetPasswordRequest } from '../models/SetPasswordRequest';
import type { SetUsername } from '../models/SetUsername';
import type { SetUsernameRequest } from '../models/SetUsernameRequest';
import type { TokenCreate } from '../models/TokenCreate';
import type { TokenCreateRequest } from '../models/TokenCreateRequest';
import type { User } from '../models/User';
import type { UserCreate } from '../models/UserCreate';
import type { UserCreateRequest } from '../models/UserCreateRequest';
import type { UsernameResetConfirm } from '../models/UsernameResetConfirm';
import type { UsernameResetConfirmRequest } from '../models/UsernameResetConfirmRequest';
import type { UserRequest } from '../models/UserRequest';
import { request as __request } from '../core/request';

export class AuthService {

    /**
     * Use this endpoint to obtain user authentication token.
     * @param requestBody
     * @returns TokenCreate
     * @throws ApiError
     */
    public static async authTokenLoginCreate(
        requestBody?: TokenCreateRequest,
    ): Promise<TokenCreate> {
        const result = await __request({
            method: 'POST',
            path: `/auth/token/login/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * Use this endpoint to logout user (remove user authentication token).
     * @returns any No response body
     * @throws ApiError
     */
    public static async authTokenLogoutCreate(): Promise<any> {
        const result = await __request({
            method: 'POST',
            path: `/auth/token/logout/`,
        });
        return result.body;
    }

    /**
     * @param limit Number of results to return per page.
     * @param offset The initial index from which to return the results.
     * @returns PaginatedUserList
     * @throws ApiError
     */
    public static async authUsersList(
        limit?: number,
        offset?: number,
    ): Promise<PaginatedUserList> {
        const result = await __request({
            method: 'GET',
            path: `/auth/users/`,
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns UserCreate
     * @throws ApiError
     */
    public static async authUsersCreate(
        requestBody: UserCreateRequest,
    ): Promise<UserCreate> {
        const result = await __request({
            method: 'POST',
            path: `/auth/users/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this Benutzer.
     * @returns User
     * @throws ApiError
     */
    public static async authUsersRetrieve(
        id: number,
    ): Promise<User> {
        const result = await __request({
            method: 'GET',
            path: `/auth/users/${id}/`,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this Benutzer.
     * @param requestBody
     * @returns User
     * @throws ApiError
     */
    public static async authUsersUpdate(
        id: number,
        requestBody?: UserRequest,
    ): Promise<User> {
        const result = await __request({
            method: 'PUT',
            path: `/auth/users/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this Benutzer.
     * @param requestBody
     * @returns User
     * @throws ApiError
     */
    public static async authUsersPartialUpdate(
        id: number,
        requestBody?: PatchedUserRequest,
    ): Promise<User> {
        const result = await __request({
            method: 'PATCH',
            path: `/auth/users/${id}/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param id A unique integer value identifying this Benutzer.
     * @returns void
     * @throws ApiError
     */
    public static async authUsersDestroy(
        id: number,
    ): Promise<void> {
        const result = await __request({
            method: 'DELETE',
            path: `/auth/users/${id}/`,
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns Activation
     * @throws ApiError
     */
    public static async authUsersActivationCreate(
        requestBody: ActivationRequest,
    ): Promise<Activation> {
        const result = await __request({
            method: 'POST',
            path: `/auth/users/activation/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @returns User
     * @throws ApiError
     */
    public static async authUsersMeRetrieve(): Promise<User> {
        const result = await __request({
            method: 'GET',
            path: `/auth/users/me/`,
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns User
     * @throws ApiError
     */
    public static async authUsersMeUpdate(
        requestBody?: UserRequest,
    ): Promise<User> {
        const result = await __request({
            method: 'PUT',
            path: `/auth/users/me/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns User
     * @throws ApiError
     */
    public static async authUsersMePartialUpdate(
        requestBody?: PatchedUserRequest,
    ): Promise<User> {
        const result = await __request({
            method: 'PATCH',
            path: `/auth/users/me/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @returns void
     * @throws ApiError
     */
    public static async authUsersMeDestroy(): Promise<void> {
        const result = await __request({
            method: 'DELETE',
            path: `/auth/users/me/`,
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns SendEmailReset
     * @throws ApiError
     */
    public static async authUsersResendActivationCreate(
        requestBody: SendEmailResetRequest,
    ): Promise<SendEmailReset> {
        const result = await __request({
            method: 'POST',
            path: `/auth/users/resend_activation/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns SendEmailReset
     * @throws ApiError
     */
    public static async authUsersResetPasswordCreate(
        requestBody: SendEmailResetRequest,
    ): Promise<SendEmailReset> {
        const result = await __request({
            method: 'POST',
            path: `/auth/users/reset_password/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns PasswordResetConfirm
     * @throws ApiError
     */
    public static async authUsersResetPasswordConfirmCreate(
        requestBody: PasswordResetConfirmRequest,
    ): Promise<PasswordResetConfirm> {
        const result = await __request({
            method: 'POST',
            path: `/auth/users/reset_password_confirm/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns SendEmailReset
     * @throws ApiError
     */
    public static async authUsersResetUsernameCreate(
        requestBody: SendEmailResetRequest,
    ): Promise<SendEmailReset> {
        const result = await __request({
            method: 'POST',
            path: `/auth/users/reset_username/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns UsernameResetConfirm
     * @throws ApiError
     */
    public static async authUsersResetUsernameConfirmCreate(
        requestBody: UsernameResetConfirmRequest,
    ): Promise<UsernameResetConfirm> {
        const result = await __request({
            method: 'POST',
            path: `/auth/users/reset_username_confirm/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns SetPassword
     * @throws ApiError
     */
    public static async authUsersSetPasswordCreate(
        requestBody: SetPasswordRequest,
    ): Promise<SetPassword> {
        const result = await __request({
            method: 'POST',
            path: `/auth/users/set_password/`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * @param requestBody
     * @returns SetUsername
     * @throws ApiError
     */
    public static async authUsersSetUsernameCreate(
        requestBody: SetUsernameRequest,
    ): Promise<SetUsername> {
        const result = await __request({
            method: 'POST',
            path: `/auth/users/set_username/`,
            body: requestBody,
        });
        return result.body;
    }

}