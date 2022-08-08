import { LemmaArticleVersion } from "@/api";
import { EditorService } from "@/api/services/EditorService";


/**
 * Server side versions have default values for this properties and are not nullable 
 */
type SavedArticleVersion = LemmaArticleVersion & { date_created: string, date_modified: string, id: number };

type Markup = LemmaArticleVersion['markup'];

export interface ArticleStoreInterface {


    versions: SavedArticleVersion[];

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

export async function loadArticle(article_id: number): Promise<ArticleStoreInterface> {
    const listResponse = await EditorService.editorApiV1LemmaArticleVersionList(article_id);
    const versions = listResponse['results'] as SavedArticleVersion[];
    return new ArticleStore(article_id, versions);
}




export class ArticleStore implements ArticleStoreInterface {

    constructor(
        private article_id: number,
        private _versions: SavedArticleVersion[],
    ) { }


    get versions(): SavedArticleVersion[] {
        return this._versions;
    }

    get newestVersion(): SavedArticleVersion | undefined {

        if (this.versions.length === 0) {
            return undefined;
        }

        return this.versions.reduce(
            (version1, version2) => new Date(version1.date_created) > new Date(version2.date_created) ? version1 : version2
        );

    }

    async updateMarkup(new_markup: Markup): Promise<ArticleStoreInterface> {
        const newestVersion = this.newestVersion;
        if (newestVersion === undefined) {
            throw new Error('Can not update markup – newest version not found');
        }

        const index = this.versions.indexOf(newestVersion);

        const updatedVersion = await EditorService.editorApiV1LemmaArticleVersionPartialUpdate(newestVersion.id, { markup: new_markup }) as SavedArticleVersion;

        this._versions[index] = updatedVersion;

        return this;
    }

    async addVersion(new_markup: Markup): Promise<ArticleStoreInterface> {
        const newVersion = await EditorService.editorApiV1LemmaArticleVersionCreate({ lemma_article: this.article_id, markup: new_markup }) as SavedArticleVersion;
        this.versions.push(newVersion);
        return this;
    }

}
