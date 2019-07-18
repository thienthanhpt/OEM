import { DataTableRowComponent } from './data-table-row.component';
import { DataTableColumnComponent } from './data-table-column.component';


export type RowCallback = (item: any, row: DataTableRowComponent, index: number) => string;

export type CellCallback = (item: any, row: DataTableRowComponent, column: DataTableColumnComponent, index: number) => string;

// export type HeaderCallback = (column: DataTableColumn) => string;


export interface DataTableTranslations {
  indexColumn: string;
  selectColumn: string;
  expandColumn: string;
  paginationLimit: string;
  paginationRange: string;
}

export const defaultTranslations = <DataTableTranslations>{
  indexColumn: 'index',
  selectColumn: 'select',
  expandColumn: 'expand',
  paginationLimit: 'Limit',
  paginationRange: 'Results'
};


export interface DataTableParams {
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortAsc?: boolean;
  criteria?: object;
}
