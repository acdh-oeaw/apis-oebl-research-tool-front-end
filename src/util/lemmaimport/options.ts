
type FileOptions = {
    fileType: 'text/csv';
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


export class ImportOptions {
    fileOptions: null | SupportedFilesOptions = null;

    allIsFilledIn(): boolean {
        return this.fileOptions !== null;
    }
}