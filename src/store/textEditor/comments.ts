import { UserProfile } from "../user";


export class Comment {

    /**
     * The user who writes / wrote this comment.
     */
    readonly userID: UserProfile['userId']; 
    /**
     * If this is a reply to another comment, give the ID
     */
    readonly replayToCommentId: null | keyof DocumentCommentRegister;
    /**
     * The comment content is stored as html
     */
    private _htmlContent: string = '';
    readonly dateCreated: Date = new Date(); 
    public dateModified: Date = new Date();

    /**
     * 
     * @param userID The user who writes / wrote this comment.
     * @param replayToCommentId If this is a reply to another comment, give the ID
     * @param htmlContent The comment content is stored as html
     * @param dateCreated 
     * @param dateModified 
     */
    constructor(
        userID: UserProfile['userId'], 
        replayToCommentId: null | keyof DocumentCommentRegister,
        htmlContent: string = '', 
        dateCreated: Date = new Date(),  
        dateModified: Date = new Date(),
    ){
        this.userID = userID;
        this.replayToCommentId = replayToCommentId;
        this._htmlContent = htmlContent;
        this.dateCreated = dateCreated;
        this.dateModified = dateModified;
    }

    set htmlContent(htmlContent: string) {
        this._htmlContent = htmlContent;
        this.dateModified = new Date();
    }

    get htmlContent(): string {
        return this._htmlContent;
    }


}

export type DocumentCommentRegister = Map<number, Comment>;


export class CommentStore {
    
    constructor(
        public documentCommentRegister: DocumentCommentRegister = new Map()
    ) {}

    /**
     * 
     * @returns a new, unique, and auto incremented key for this map. This key is not inserted in the register – you have to use it before.
     */
    private getAutoIncrementKey(): number {
        if (this.documentCommentRegister.size === 0) {
            return 0;
        }
        const biggestKey: number = Array.from(
                this.documentCommentRegister.keys()
            ).reduce(
                (value1, value2) => value1 >= value2 ? value1 : value2  // There is currentlx no spread operator in this ts version, so no Math.max(...register.keys())
            )
        ;
        return biggestKey + 1;
    }

    /**
     * 
     * @param comment 
     * @returns the key of the inserted comment.
     */
    public addComment(comment: Comment): number {
        const key = this.getAutoIncrementKey();
        this.documentCommentRegister.set(key, comment);
        return key;
    }

    /**
     * 
     * @param userId 
     * @param replayToCommentId 
     * @returns the key of the inserted comment.
     */
    public createComment(userId: UserProfile['userId'], replayToCommentId: null | keyof DocumentCommentRegister): number {
        const comment = new Comment(userId, replayToCommentId);
        return this.addComment(comment);
    }


    /**
     * 
     * @param commentId 
     * @returns True on success, False on not found.
     */
    public deleteComment(commentId: number): boolean {
        return this.documentCommentRegister.delete(commentId);
    }

}


export const ClickOnCommentEventType = 'ClickOnComment';


/**
 * Converts backends data to or creates DocumentTextStore, Used by `./documents/createDocumentContainerFromBackendMarkup
 * 
 * This function does:
 *   - Make sure the data has the right shape and types and provide fallbacks
 *   - Converts date strings to Date types.
 *   - Tells typescript, yes, this is the right data type
 * 
 * The markup json-column in the backend does not have any schema definition, 
 * and is automatically only defined as `Record<string, any>`which is not much.
 * 
 * @param backEndComments – if undefined, will generate empty document 
 */
 export function createCommentStoreFromBackendMarkup(backEndComments?: Record<string, any>): CommentStore {

    if (backEndComments === undefined) {
        return new CommentStore();
    }

    const documentCommentRegisterAnyType: undefined | Record<string, any> | any = backEndComments.documentCommentRegister;

    if (typeof documentCommentRegisterAnyType !== 'object') {
        return new CommentStore();
    }

    const documentCommentRegisterEntries = Object.entries(documentCommentRegisterAnyType);
    const documentCommentRegisterMap = new Map();

    let key: number | any;
    let value:  Record<string, any> | any;

    for ([key, value] of documentCommentRegisterEntries) {
        if (typeof key !== "number") {
            return new CommentStore();
        }
        const comment: undefined | Comment = createCommentFromBackEndMarkup(value);
        if (comment === undefined) {
            return new CommentStore();
        }

        documentCommentRegisterMap.set(key, comment);
    }

    return new CommentStore(documentCommentRegisterMap);
    
}

function createCommentFromBackEndMarkup(value: any  |Record<string, any>): Comment | undefined {

    if (value === undefined) {
        return undefined;
    }

    const userID: UserProfile['userId'] | undefined = value.iserID;
    
    if (typeof userID !== "number") {
        return undefined;
    }

    let replayToCommentId = value.replayToCommentId;
    if (typeof replayToCommentId !== 'number') {
        replayToCommentId = null;
    }

    const dateCreated: Date | undefined = typeof(value.dateCreated) === 'string' ? new Date(value.dateCreated) : undefined;
    const dateModified: Date | undefined = typeof(value.dateModified) === 'string' ? new Date(value.dateModified) : undefined;

    return new Comment(
        userID,
        replayToCommentId,
        value.htmlContent,
        dateCreated,
        dateModified,
    );

}

