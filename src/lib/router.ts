import Vue from "vue";
import VueRouter, { type RouteConfig } from "vue-router";

import IssueByIdPage from "@/pages/issues/[id]/index.vue";
// import EditorLoader from "@/views/ArticleManager/EditorLoader.vue";
// import LemmaManager from "@/views/LemmaManager/LemmaManager.vue";
import LemmaByIdPrintPage from "@/pages/lemmas/[id]/print.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
	// {
	// 	path: "/",
	// 	redirect: "/lemmas",
	// },
	{
		path: "/issues/:id(\\d+)",
		component: IssueByIdPage,
		props(route) {
			return {
				id: Number(route.params.id)
			}
		}
	},
	// {
	// 	path: "/lemmas",
	// 	component: LemmaManager,
	// 	props(route) {
	// 		return {
	// 			highlightId: Number(route.query.focus) || null,
	// 		};
	// 	},
	// },
	// {
	// 	path: "/lemmas/list/:lemmaListId",
	// 	component: LemmaManager,
	// 	props(route) {
	// 		return {
	// 			lemmaListId: Number(route.params.lemmaListId) || null,
	// 			highlightId: Number(route.query.focus) || null,
	// 		};
	// 	},
	// },
	// {
	// 	path: "/lemmas/filter/:lemmaFilterId",
	// 	component: LemmaManager,
	// },
	// {
	// 	path: "/article/:issueLemmaId",
	// 	component: EditorLoader,
	// 	props(route) {
	// 		return {
	// 			issueLemmaId: Number(route.params.issueLemmaId) || null,
	// 		};
	// 	},
	// },
	{
		path: "/lemmas/:id(\\d+)/print",
		component: LemmaByIdPrintPage,
		props(route) {
			return {
				id: Number(route.params.id),
			};
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
