import Vue from "vue";
import VueRouter, { type RouteConfig } from "vue-router";

import EditorLoader from "../views/ArticleManager/EditorLoader.vue";
import IssueManager from "../views/IssueManager/IssueManager.vue";
import LemmaManager from "../views/LemmaManager/LemmaManager.vue";
import LemmaPrintView from "../views/LemmaManager/LemmaPrintView.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
	{
		path: "/",
		redirect: "/lemmas",
	},
	{
		path: "/issue/:issueId",
		name: "Issue",
		component: IssueManager,
		props: (route) => {
			return {
				issueId: Number(route.params.issueId) || null,
			};
		},
	},
	{
		path: "/lemmas",
		name: "Lemmas",
		component: LemmaManager,
		props: (route) => {
			return {
				highlightId: Number(route.query.focus) || null,
			};
		},
	},
	{
		path: "/lemmas/list/:lemmaListId",
		component: LemmaManager,
		props: (route) => {
			return {
				lemmaListId: Number(route.params.lemmaListId) || null,
				highlightId: Number(route.query.focus) || null,
			};
		},
	},
	{
		path: "/lemmas/filter/:lemmaFilterId",
		component: LemmaManager,
	},
	{
		path: "/article/:issueLemmaId",
		component: EditorLoader,
		props: (route) => {
			return {
				issueLemmaId: Number(route.params.issueLemmaId) || null,
			};
		},
	},
	{
		path: "/lemmas/print/:lemmaId",
		component: LemmaPrintView,
		props: (route) => {
			return {
				lemmaId: Number(route.params.lemmaId),
			};
		},
	},
	// route level code-splitting
	// this generates a separate chunk (about.[hash].js) for this route
	// which is lazy-loaded when the route is visited.
	// component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes,
});

export default router;
