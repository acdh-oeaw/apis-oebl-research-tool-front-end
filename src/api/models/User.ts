/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type User = {
    email?: string;
    readonly id?: number;
    /**
     * Erforderlich. 150 Zeichen oder weniger. Nur Buchstaben, Ziffern und @/./+/-/_.
     */
    readonly username?: string;
}
