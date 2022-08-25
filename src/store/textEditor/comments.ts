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
        private _documentCommentRegister: DocumentCommentRegister = new Map()
    ) {}

    /**
     * 
     * @returns a new, unique, and auto incremented key for this map. This key is not inserted in the register – you have to use it before.
     */
    private getAutoIncrementKey(): number {
        if (this._documentCommentRegister.size === 0) {
            return 0;
        }
        const biggestKey: number = Array.from(
                this._documentCommentRegister.keys()
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
        this._documentCommentRegister.set(key, comment);
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
     * Please don't edit this object, ... uhm
     */
    get documentCommentRegister(): DocumentCommentRegister {
        return this._documentCommentRegister;
    }

    /**
     * 
     * @param commentId 
     * @returns True on success, False on not found.
     */
    public deleteComment(commentId: number): boolean {
        return this._documentCommentRegister.delete(commentId);
    }

}


export const ClickOnCommentEventType = 'ClickOnComment';

