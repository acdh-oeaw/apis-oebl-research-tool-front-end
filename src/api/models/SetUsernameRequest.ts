/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SetUsernameRequest = {
    current_password: string;
    /**
     * Erforderlich. 150 Zeichen oder weniger. Nur Buchstaben, Ziffern und @/./+/-/_.
     */
    new_username: string;
}