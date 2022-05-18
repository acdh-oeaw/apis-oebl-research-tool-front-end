import { LemmaRow } from "@/types/lemma";

type FileOptions = {
    fileType: 'text/csv';
    useFirstRowAsHeaders: boolean,
};

export type CsvOptions = FileOptions & {
    newLine: string;
    textDelimiter: string;
    separator: string;
};

export type XlsxOptions = FileOptions & {
    sheetName: string | null;
};

export type SupportedFilesOptions = CsvOptions | XlsxOptions;

export type ExtractColumnOptions = {
    // Use this key to extract data in rows
    sourceKey: string | null,
}

export type ColumnConversion = {
    extractOptions: ExtractColumnOptions,
}

export type ColumnConversions = {
    [key in keyof Partial<LemmaRow>]: // We only want keys in lemma row, but we do not need all. 
    ColumnConversion
};

export const defaultLemmaBuilderOptions: ColumnConversions = {
    
    firstName: {
        extractOptions: {
            sourceKey: null,
        }
    },

    lastName: {
        extractOptions: {
            sourceKey: null,
        }
    }
}


export class ImportOptions {
    
    fileOptions: null | SupportedFilesOptions = null;

    lemmaBuilderOptions: ColumnConversions = defaultLemmaBuilderOptions;
    
    allIsFilledIn(): boolean {
        return this.fileOptions !== null;
    }
}
