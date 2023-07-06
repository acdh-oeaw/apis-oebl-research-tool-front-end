/* eslint-disable @typescript-eslint/consistent-type-imports */

/// <reference types="vuetify2-component-types" />

declare module "vue" {
	export interface GlobalComponents {
		RouterLink: typeof import("vue-router")["RouterLink"];
		RouterView: typeof import("vue-router")["RouterView"];
	}
}

export {};
