import { CommentStore } from "./comments";
import { DocumentTextStore } from "./texts";


/**
 * All information regarding a document 
 */
export class DocumentContainer {

    constructor(
        public textStore: DocumentTextStore,
        public commentStore: CommentStore,
    ){}
    
}