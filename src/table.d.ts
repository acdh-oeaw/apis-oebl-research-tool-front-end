
export interface Column {
  value: string|null;
  text: string;
}

export interface Header {
  matchWith: string|null;
  text: string;
  sortable: boolean;
  value: string;
}

export interface Row {
  [key: string]: string|number

}
export type Table = Row[]
