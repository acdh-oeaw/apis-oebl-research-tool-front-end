import { LemmaArticleVersion } from "@/api/models/LemmaArticleVersion";
import { CommentStore, createCommentStoreFromBackendMarkup } from "./comments";
import { createDocumentTextStoreFromBackendMarkup, DocumentTextStore } from "./texts";


/**
 * All information regarding a document 
 */
export class DocumentContainer {

    constructor(
        public textStore: DocumentTextStore,
        public commentStore: CommentStore,
    ){}
    
}


/**
 * Convert backends markup Record<string, any> to a DocumentContainer
 * 
 * This function does:
 *   - Make sure the data has the right shape and types and provide fallbacks
 *   - Converts date strings to Date types.
 *   - Tells typescript, yes, this is the right data type
 * 
 * The markup json-column in the backend does not have any schema definition, 
 * and is automatically only defined as `Record<string, any>`which is not much.
 * 
 * @param backEndMarkup 
 */
export function createDocumentContainerFromBackendMarkup(backEndMarkup: LemmaArticleVersion['markup']): DocumentContainer {
    return {
        textStore: createDocumentTextStoreFromBackendMarkup(backEndMarkup.textStore),
        commentStore: createCommentStoreFromBackendMarkup(backEndMarkup.commentStore),
    };
}