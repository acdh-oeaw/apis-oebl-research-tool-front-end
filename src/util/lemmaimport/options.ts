import { LemmaRow } from "@/types/lemma";
import { SupportedDateFormatType } from "../dates";

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
};

export type LemmaFormatterOptions = {
    // Values, that should be converted into null
    nullValues: string[];
    dateFormat: SupportedDateFormatType;
};

export const defautLemmaFormatterOptions: LemmaFormatterOptions = {
    // Inspired but reduced version of na_values in https://pandas.pydata.org/docs/reference/api/pandas.read_excel.html?highlight=read_excel#pandas.read_excel
    nullValues:  [
        '', '#N/A', '#NA', '<NA>', 'N/A', 'NA', 'NULL', 'NaN', 'n/a', 'nan', 'null'
    ],
    dateFormat: 'YYYY-MM-DD',
}

export class ImportOptions {
    
    fileOptions: null | SupportedFilesOptions = null;

    lemmaBuilderOptions: ColumnConversions = defaultLemmaBuilderOptions;
    
    lemmaFormatterOptions: LemmaFormatterOptions = defautLemmaFormatterOptions;

    allIsFilledIn(): boolean {
        return this.fileOptions !== null;
    }
}
