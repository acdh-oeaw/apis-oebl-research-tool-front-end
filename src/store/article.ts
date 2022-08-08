import { LemmaArticleVersion } from "@/api";





export interface ArticleStoreInterface {


    get versions(): LemmaArticleVersion[];

    /**
     * The newest version of an article is undefined, if there is no version
     */
    get newestVersion(): LemmaArticleVersion|undefined;

    /**
     * Updates tthe markup of the newest version, if there is one.
     * 
     * @param new_markup 
     */
    updateMarkup(new_markup: LemmaArticleVersion['markup']): Promise<ArticleStoreInterface>;

    addVersion(new_markup: LemmaArticleVersion['markup']): Promise<ArticleStoreInterface>;

}

export async function loadArticle(article_id: number): Promise<ArticleStoreInterface> {
    throw new Error('Not iemplemented');
}

export class ArticleStore implements ArticleStoreInterface {
    get versions(): LemmaArticleVersion[] {
        throw new Error("Method not implemented.");
    }
    get newestVersion(): LemmaArticleVersion | undefined {
        throw new Error("Method not implemented.");
    }
    updateMarkup(new_markup: Record<string, any>): Promise<ArticleStoreInterface> {
        throw new Error("Method not implemented.");
    }
    addVersion(new_markup: Record<string, any>): Promise<ArticleStoreInterface> {
        throw new Error("Method not implemented.");
    }


}
