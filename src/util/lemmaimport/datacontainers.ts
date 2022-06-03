
import { NewLemmaRow } from "@/types/lemma";

/**
 * Wrapper class for x*y data coming from tabular data
 */ 
export class Data2D {
    
    private _headers: string[];
    private _data: Array<string[]> = [];

    constructor(
        headers: string[],
        data: Array<string[]> = [],
    ) {
        this._headers = headers;
        this.data = data;
    }

    get headers(): string[] {
        return this._headers;
    }

    get data(): Array<string[]> {
        return this._data;
    }

    addRow(row: string[]) {
        if (row.length !== this.headers.length) {
            throw new Error(`This class only handles tabular data with a constant width. This object has ${this.headers.length} columns, but the row has ${row.length} fields`);
        }
        this._data.push(row);
    }

    set data(data: Array<string[]>) {
        data.forEach(row => this.addRow(row));
    }

    selectByHeaderName(headerName: string): string[] {
        const numericalHeaderName = this.headers.indexOf(headerName);
        if (numericalHeaderName === undefined) {
            const headers = JSON.stringify(this.headers);
            throw new Error(`Did not find <${headerName}> in ${headers}`);
        }

        return this.data.map(
            row => row[numericalHeaderName]
        );
    }

    /**
     * Get a new Data2D object by row numbers
     * 
     * @param rowIndexes 
     * @param inverseSelect If true, select the rows that are not in 
     * @returns A new Data2D object
     */
    selectRows(rowIndexes: number[], inverseSelect: boolean = false): Data2D {
        return new Data2D(
            this.headers,
            this.data.filter((_, index) => rowIndexes.includes(index) !== inverseSelect )
        );
    }

    get nRows(): number {
        return this.data.length;
    }

    get nColumns(): number {
        return this.headers.length;
    }

    get empty(): boolean {
        return this.nRows === 0;
    }

}
        

/**
 * A Lemma Prototype comming directly from csv/excel/… with only strings.
 */
export type LemmaPrototypeStringType = {
    [key in keyof NewLemmaRow]: string
};

/**
 * A Lemma Porototype with nan values like 'NAN' replaced with null.
 */
export type LemmaPrototypeNullableStringType = {
    [key in keyof NewLemmaRow]: string | null;
};

/**
 * It has been made sure, that there are no missing values.
 */
export type LemmaPrototypeRequiredFieldsType = 
    Omit<LemmaPrototypeNullableStringType, 'lastName'>
    & {
        lastName: NewLemmaRow['lastName'];
    }
;

export type LemmaDates = Pick<NewLemmaRow, 'dateOfBirth' | 'dateOfDeath'>;

export type LemmaGender = Pick<NewLemmaRow, 'gender'>;
