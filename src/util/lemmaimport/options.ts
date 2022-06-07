import { GenderAe0Enum } from "@/api";
import { NewLemmaRow } from "@/types/lemma";
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

export const defaultOptions: CsvOptions = {
    fileType: 'text/csv',
    useFirstRowAsHeaders: true,
    newLine: '\n',
    textDelimiter: '"',
    separator: ',',
};

export type ExtractColumnOptions = {
    // Use this key to extract data in rows
    sourceKey: string | null,
}

export type ColumnConversion = {
    extractOptions: ExtractColumnOptions,
}

export type ColumnConversions = {
    [
        key in keyof Omit<
        NewLemmaRow, 
        'list'              // Manual selection over the whole import 
        | 'columns_user'    // Have their own options
        | 'legacyGideonCitations'  // not imported
         // Not (yet) implemented
        | 'professionGroup' | 'alternativeNames'
        | 'secondaryLiterature' | 'zoteroKeysBy' | 'zoteroKeysAbout'
        >
    ]:  ColumnConversion
};


export const getEmptyColumnConversion = (): ColumnConversion => {return {extractOptions: {sourceKey: null}};}

export const defaultLemmaBuilderOptions: ColumnConversions = {
    firstName: getEmptyColumnConversion(),
	lastName: getEmptyColumnConversion(),
	dateOfBirth: getEmptyColumnConversion(),
	dateOfDeath: getEmptyColumnConversion(),
	gender: getEmptyColumnConversion(),
	gnd: getEmptyColumnConversion(),
	loc: getEmptyColumnConversion(),
	viaf_id: getEmptyColumnConversion(),
	professionDetail: getEmptyColumnConversion(),
	bioNote: getEmptyColumnConversion(),
	kinship: getEmptyColumnConversion(),
	religion: getEmptyColumnConversion(),
};

export type GenderMappingOption = Record<
    GenderAe0Enum, // Gender for the database
    /**
     * Gender representations in lemma import
     * 
     * This could be multiple strings, since the source could have more granular ore ambigous gender definitions.
     */
    string[]  
>;

export type LemmaFormatterOptions = {
    // Values, that should be converted into null
    nullValues: string[];
    dateFormat: SupportedDateFormatType;
    genderMapping: GenderMappingOption;
};

export const defautLemmaFormatterOptions: LemmaFormatterOptions = {
    // Inspired but reduced version of na_values in https://pandas.pydata.org/docs/reference/api/pandas.read_excel.html?highlight=read_excel#pandas.read_excel
    nullValues:  [
        '', '#N/A', '#NA', '<NA>', 'N/A', 'NA', 'NULL', 'NaN', 'n/a', 'nan', 'null'
    ],
    dateFormat: 'YYYY-MM-DD',
    genderMapping: {
        divers: ['divers', ],
        männlich: ['männlich',],
        weiblich: ['weiblich',],
    },
}

export type UserColumnMapping = {
    [sourceColumn: string]: string; // sourceColumn: targetColumn (lemma.user_columns.targetColumn)
};

export type SelectedList = NewLemmaRow['list'];

export class ImportOptions {
    
    fileOptions: SupportedFilesOptions = defaultOptions;

    lemmaBuilderOptions: ColumnConversions = defaultLemmaBuilderOptions;
    
    lemmaFormatterOptions: LemmaFormatterOptions = defautLemmaFormatterOptions;

    userColumnMapping: UserColumnMapping = {};    

    selectedList: SelectedList = undefined;

    allIsFilledIn(): boolean {
        return this.lemmaBuilderOptions.lastName?.extractOptions.sourceKey !== null;
    }
}
