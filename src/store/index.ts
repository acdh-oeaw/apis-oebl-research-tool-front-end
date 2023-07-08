import { createUrl, request } from "@acdh-oeaw/lib";
import Vue from "vue";

import { OpenAPI } from "@/api/core/OpenAPI";
import { env } from "@/config/env";
import AuthorStore from "@/store/author";
import EditorStore from "@/store/editor";
import IssueStore from "@/store/issue";
import LabelStore from "@/store/label";
import LemmaStore from "@/store/lemma";
import SearchStore from "@/store/search";
import UserStore from "@/store/user";
import { type LemmaFilterItem } from "@/types/lemma";

OpenAPI.BASE = env.VUE_APP_API_HOST;
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.TOKEN = localStorage.getItem("token") ?? undefined;

export interface StoredLemmaFilter {
	name: string;
	id: string;
	filterItems: Array<LemmaFilterItem>;
}

interface Settings {
	darkTheme: boolean;
	issueLayout: "board" | "list";
	issueLemmaSearchItems: Array<any>;
	drawerRightWidth: number;
	drawerLeftWidth: number;
	showNavDrawer: boolean;
	articleZoomFactor: number;
	showLemmaFilter: boolean;
	issueViewOptions: {
		showBirthAndDeath: boolean;
		showEditor: boolean;
		showAuthor: boolean;
		showLabels: number;
	};
}

class Store {
	public isLoggedIn = OpenAPI.TOKEN != null;

	/** This is where we put functions that we want to run after the login. */
	private loginCallbacks: Array<() => unknown> = [];
	private _selectedIssueId: number | null = null;
	private _selectedBiographyId = 1;
	public showSearchDialog = false;
	/** Settings for the entire application */
	private _settings: Settings = {
		darkTheme: false,
		issueLayout: "board",
		issueLemmaSearchItems: [],
		drawerRightWidth: 370,
		drawerLeftWidth: 370,
		showNavDrawer: true,
		articleZoomFactor: 1,
		showLemmaFilter: false,
		issueViewOptions: {
			showBirthAndDeath: true,
			showEditor: true,
			showAuthor: true,
			showLabels: 3,
		},
	};

	public onLoginSuccess(cb: () => unknown): void {
		this.loginCallbacks.push(cb);
	}

	private async runCallbacks(cbs: Array<() => unknown>): Promise<void> {
		for (const cb of cbs) {
			await cb();
		}
	}

	async logIn(user: string, pwd: string): Promise<boolean> {
		try {
			const url = createUrl({ baseUrl: OpenAPI.BASE, pathname: "/auth/token/login" });

			const data = (await request(url, {
				method: "post",
				body: { username: user, password: pwd },
				responseType: "json",
			})) as { auth_token: string };

			await this.runCallbacks(this.loginCallbacks);
			this.loginCallbacks = [];

			OpenAPI.TOKEN = data.auth_token;
			localStorage.setItem("token", data.auth_token);
			this.isLoggedIn = true;

			return true;
		} catch (e) {
			this.logOut();

			return false;
		}
	}

	logOut(): void {
		OpenAPI.TOKEN = undefined;
		localStorage.removeItem("token");
		this.isLoggedIn = false;
	}

	get settings(): Settings {
		return { ...this._settings, ...JSON.parse(localStorage.getItem("settings") || "{}") };
	}

	set settings(s: Settings) {
		this._settings = s;
		localStorage.setItem("settings", JSON.stringify(s));
	}

	get selectedIssue(): number | null {
		return this._selectedIssueId;
	}

	get selectedBiography(): number {
		return this._selectedBiographyId;
	}

	user = new UserStore();
	lemma = new LemmaStore();
	editors = new EditorStore();
	search = new SearchStore();
	issue = new IssueStore(this.selectedIssue);
	authors = new AuthorStore();
	labels = new LabelStore();
}

export default Vue.observable(new Store());
