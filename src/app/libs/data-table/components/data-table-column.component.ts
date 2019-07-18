import { Component, Input, ContentChild, OnInit } from '@angular/core';
import { DataTableRowComponent } from './data-table-row.component';
import { CellCallback } from './types';


@Component({
  selector: 'data-table-column',
  template: ''
})
export class DataTableColumnComponent implements OnInit {

  // init:
  @Input() header = '';
  @Input() selectable = true;
  @Input() sortable = false;
  @Input() searchable = false;
  @Input() resizable = false;
  @Input() actionColumn = false;
  @Input() property: string;
  @Input() sortProperty: string;
  @Input() styleClass: string;
  @Input() cellColors: CellCallback;

  // init and state:
  @Input() width: number | string;
  @Input() visible = true;
  @Input() center = false;

  @ContentChild('dataTableCell') cellTemplate: any;
  @ContentChild('dataTableHeader') headerTemplate: any;

  private styleClassObject = {}; // for [ngClass]

  ngOnInit() {
    this._initCellClass();
  }

  getCellColor(row: DataTableRowComponent, index: number) {
    return (this.cellColors !== undefined) ? (<CellCallback>this.cellColors)(row.item, row, this, index) : '';
  }

  private _initCellClass() {
    if (!this.styleClass && this.property) {
      if (/^[a-zA-Z0-9_]+$/.test(this.property)) {
        this.styleClass = 'column-' + this.property;
      } else {
        this.styleClass = 'column-' + this.property.replace(/[^a-zA-Z0-9_]/g, '');
      }
    }

    if (this.styleClass != null) {
      this.styleClassObject = {
        [this.styleClass]: true
      };
    }
  }
}
