import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DataTableComponent } from './components/data-table.component';
import { DataTableColumnComponent } from './components/data-table-column.component';
import { DataTableRowComponent } from './components/data-table-row.component';
import { DataTablePaginationComponent } from './components/data-table-pagination.component';
import { DataTableHeaderComponent } from './components/data-table-header.component';

import { PixelConverter } from './utils/px';
import { Hide } from './utils/hide';
import { MinPipe } from './utils/min';

export * from './components/types';
export * from './tools/data-table-resource';

export {
  DataTableComponent,
  DataTableColumnComponent,
  DataTableRowComponent,
  DataTablePaginationComponent,
  DataTableHeaderComponent
};

@NgModule({
  imports: [ CommonModule, FormsModule ],
  declarations: [
    DataTableComponent, DataTableColumnComponent,
    DataTableRowComponent, DataTablePaginationComponent, DataTableHeaderComponent,
    PixelConverter, Hide, MinPipe
  ],
  exports: [ DataTableComponent, DataTableColumnComponent, DataTableRowComponent ]
})
export class DataTableModule { }
