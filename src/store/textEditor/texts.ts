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
        public commentIds: Array<keyof DocumentCommentRegister> = [],
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
