import { EditTypesEnum, type LemmaArticleVersion, WorkflowService } from "@/api";
import { EditorService } from "@/api/services/EditorService";

/**
 * Server side versions have default values for this properties and are not nullable
 */
type SavedArticleVersion = LemmaArticleVersion & {
	date_created: string;
	date_modified: string;
	id: number;
};

export type Markup = LemmaArticleVersion["markup"];

export interface ArticleStoreInterface {
	versions: Array<SavedArticleVersion>;

	/**
	 * The newest version of an article is undefined, if there is no version
	 */
	newestVersion: SavedArticleVersion | undefined;

	/**
	 * Updates tthe markup of the newest version, if there is one.
	 *
	 * @param new_markup
	 */
	updateMarkup(new_markup: Markup): Promise<ArticleStoreInterface>;

	addVersion(new_markup: Markup): Promise<ArticleStoreInterface>;
}

/**
 * Summarizes the rights an user has for an article.
 */
export interface UserArticleAssignmentStoreInterface {
	userCanView: boolean;
	userCanComment: boolean;
	userCanAnnotate: boolean;
	userCanWrite: boolean;
	/**
	 * Shortcut boolean, if use can write or annotate or comment / more than just view or nothing.
	 */
	userCanEditInAnyWay: boolean;
}

export async function loadArticle(article_id: number): Promise<ArticleStore> {
	const listResponse = await EditorService.editorApiV1LemmaArticleVersionList(article_id);
	const versions = listResponse["results"] as Array<SavedArticleVersion>;
	return new ArticleStore(article_id, versions);
}

/**
 *
 * @param article_id Load assignments for this article and the authenticated user.
 */
export async function loadAssignments(
	article_id: number,
): Promise<UserArticleAssignmentStoreInterface> {
	const article_param = String(article_id);
	const assignments = await WorkflowService.workflowApiV1OwnIssueLemmaAssignmentRetrieve(
		article_param,
	);
	return new UserArticleAssignmentStore(assignments.edit_types ?? []); // with readonly types, our model generator makes them possibly undefined, even if they aren't.
}

export class ArticleStore implements ArticleStoreInterface {
	constructor(
		private article_id: number,
		private _versions: Array<SavedArticleVersion> = [],
		public showSidebar: boolean = true,
		public sideBarWidth: number = 370,
	) {}

	get versions(): Array<SavedArticleVersion> {
		return this._versions;
	}

	get newestVersion(): SavedArticleVersion | undefined {
		if (this.versions.length === 0) {
			return undefined;
		}

		return this.versions.reduce((version1, version2) =>
			new Date(version1.date_created) > new Date(version2.date_created) ? version1 : version2,
		);
	}

	async updateMarkup(new_markup: Markup): Promise<ArticleStore> {
		const newestVersion = this.newestVersion;
		if (newestVersion == null) {
			throw new Error("Can not update markup – newest version not found");
		}

		const index = this.versions.indexOf(newestVersion);

		const updatedVersion = (await EditorService.editorApiV1LemmaArticleVersionPartialUpdate(
			newestVersion.id,
			{ markup: new_markup },
		)) as SavedArticleVersion;

		this._versions[index] = updatedVersion;

		return this;
	}

	async addVersion(new_markup: Markup): Promise<ArticleStore> {
		const newVersion = (await EditorService.editorApiV1LemmaArticleVersionCreate({
			lemma_article: this.article_id,
			markup: new_markup,
		})) as SavedArticleVersion;
		this.versions.push(newVersion);
		return this;
	}
}

export class UserArticleAssignmentStore implements UserArticleAssignmentStoreInterface {
	constructor(private editTypes: Array<EditTypesEnum>) {}

	get userCanView(): boolean {
		return this.editTypes.length > 0;
	}

	get userCanComment(): boolean {
		return (
			this.editTypes.includes(EditTypesEnum.WRITE) || this.editTypes.includes(EditTypesEnum.COMMENT)
		);
	}

	get userCanAnnotate(): boolean {
		return (
			this.editTypes.includes(EditTypesEnum.WRITE) ||
			this.editTypes.includes(EditTypesEnum.ANNOTATE)
		);
	}

	get userCanWrite(): boolean {
		return this.editTypes.includes(EditTypesEnum.WRITE);
	}

	get userCanEditInAnyWay(): boolean {
		return (
			this.editTypes.includes(EditTypesEnum.WRITE) ||
			this.editTypes.includes(EditTypesEnum.ANNOTATE) ||
			this.editTypes.includes(EditTypesEnum.COMMENT)
		);
	}
}
