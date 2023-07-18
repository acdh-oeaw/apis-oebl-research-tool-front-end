import Vue from "vue";
import VueRouter, { type RouteConfig } from "vue-router";

import { isPositiveInteger } from "@/lib/is-positive-integer";
import ArticleByIdPage from "@/pages/articles/[id]/index.vue";
import IssueByIdPage from "@/pages/issues/[id]/index.vue";
import LemmaByIdPrintPage from "@/pages/lemmata/[id]/print.vue";
import LemmataPage from "@/pages/lemmata/index.vue";
import LemmaListByIdPage from "@/pages/lemmata/list/[id]/index.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
	{
		path: "/",
		redirect: "/lemmata",
	},
	{
		path: "/lemmata",
		component: LemmataPage,
	},
	{
		path: "/lemmata/list/:id(\\d+)",
		component: LemmaListByIdPage,
		beforeEnter(to) {
			const id = Number(to.params.id);
			if (!isPositiveInteger(id)) {
				return { path: "/not-found", replace: true };
			}
			return undefined;
		},
	},
	{
		path: "/lemmata/:id(\\d+)/print",
		component: LemmaByIdPrintPage,
		beforeEnter(to) {
			const id = Number(to.params.id);
			if (!isPositiveInteger(id)) {
				return { path: "/not-found", replace: true };
			}
			return undefined;
		},
	},
	{
		path: "/issues/:id(\\d+)",
		component: IssueByIdPage,
		beforeEnter(to) {
			const id = Number(to.params.id);
			if (!isPositiveInteger(id)) {
				return { path: "/not-found", replace: true };
			}
			return undefined;
		},
	},
	{
		path: "/articles/:id(\\d+)",
		component: ArticleByIdPage,
		beforeEnter(to) {
			const id = Number(to.params.id);
			if (!isPositiveInteger(id)) {
				return { path: "/not-found", replace: true };
			}
			return undefined;
		},
	},
	// {
	// 	path: "*",
	// 	component: PageNotFound,
	// },
];

export const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes,
});
