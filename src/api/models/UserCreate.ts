/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UserCreate = {
    email?: string;
    /**
     * Erforderlich. 150 Zeichen oder weniger. Nur Buchstaben, Ziffern und @/./+/-/_.
     */
    username: string;
    readonly id?: number;
}
