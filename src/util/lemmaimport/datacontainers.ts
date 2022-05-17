// Wrapper class for x*y data coming from tabular data 
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

}