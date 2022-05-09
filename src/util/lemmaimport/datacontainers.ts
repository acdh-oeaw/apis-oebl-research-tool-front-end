
type row = {[column: string]: string}

// Wrapper class for x*y data coming from tabular data 
export class Data2D {

    data: row[] = [];

    get columns(): string[] {
        return this.data.length === 0 ? [] : Object.keys(this.data[0]);
    }

    get shape(): [number, number] {
        return [this.columns.length, this.data.length];
    }

}