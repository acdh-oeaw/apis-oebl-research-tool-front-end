import { DocumentCommentRegister } from "./comments";

/**
 * All annotations that are supported
 */
enum AnnotationTypes {
    COMMENT = 'Kommentieren',
}

/**
 * A coherent text sequence, which links to the same annotations.
 */
export class AnnotatedTextSequence {
    

    /**
    * All annotations that are referenced in this class.
    */
    static AnnotationTypes = AnnotationTypes;

    /**
     * @param plainText 
     * @param commentIds The comments, that are linked to this text sequence.
     */
    constructor(
        public plainText: string = '',
        public commentIds: number[] = [],  // Array<keyof DocumentCommentRegister>
    ){}

}


/**
 * A container for AnnotatedTextSequences, which form used to render tags like h1, h1, p
 */
export class AnnotatedTextSequenceStore {

    /**
     * 
     * @param tag which will be used to render the content
     * @param textSequences All text sequences in this heading or paragraph.
     */
    constructor(
        public tag: 'h1' | 'h2' | 'p' = 'p',
        public textSequences: Array<AnnotatedTextSequence> = [], 
    ){}
}


/**
 * A container presenting the all text of an Document
 */
export class DocumentTextStore {

    constructor(
        public segments: Array<AnnotatedTextSequenceStore> = [],
    ){}

}

// Emit on selection of AnnotatedTextSequence
export const AnnotatedTextSequenceSelectEventType = 'AnnotatedTextSequenceEditEventName';
// With this data
export type AnnotatedTextSequenceSelectEventDataType = {
    annotatedTextSequence: AnnotatedTextSequence,
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/select_event
    selectionStart: number,
    selectionEnd: number,
}




/**
 * Converts backends data to or creates DocumentTextStore, Used by `./documents/createDocumentContainerFromBackendMarkup
 * 
 * This function does:
 *   - Make sure the data has the right shape and types and provide fallbacks
 *   - Tells typescript, yes, this is the right data type
 * 
 * The markup json-column in the backend does not have any schema definition, 
 * and is automatically only defined as `Record<string, any>`which is not much.
 * 
 * @param backEndDocument – if undefined, will generate empty document 
 */
 export function createDocumentTextStoreFromBackendMarkup(backEndDocument?: Record<string, any>): DocumentTextStore {

    // Empty do
    if (backEndDocument === undefined) {
        return new DocumentTextStore();
    }
    
    const backEndSegments: undefined | Array<Record<string, any>> | any  = backEndDocument.segments;

    // Empty fallback
    if (!Array.isArray(backEndSegments)) {
        return new DocumentTextStore();
    }


    return new DocumentTextStore(backEndSegments.map(createAnnotatedTextSequenceStoreFromBackendMarkup));

}

function createAnnotatedTextSequenceStoreFromBackendMarkup(backEndTextSegment: Record<string, any>): AnnotatedTextSequenceStore {
    
    const tag: 'h1' | 'h2' | 'p' = ['h1', 'h2', 'p'].includes(backEndTextSegment.tag) ? backEndTextSegment.tag : 'p';
    const textSequences: undefined | Array<Record<string, any>> | any = backEndTextSegment.textSequences;
    if (!Array.isArray(textSequences)) {
        return new AnnotatedTextSequenceStore(tag);
    }

    return new AnnotatedTextSequenceStore(tag, textSequences.map(createAnnotatedTextSequenceFromBackendMarkup));
}

function createAnnotatedTextSequenceFromBackendMarkup(backEndTextWithAnnotation: Record<string, any>): AnnotatedTextSequence {
    const unknownTypeCommentIds: Array<number | any>= Array.isArray(backEndTextWithAnnotation.commentIds) ? backEndTextWithAnnotation.commentIds : [];
    const commentIds: Array<number> = unknownTypeCommentIds.every(Number.isInteger) ? unknownTypeCommentIds : [];
    return new AnnotatedTextSequence(
        backEndTextWithAnnotation.plainText,
        commentIds,
    );

}
