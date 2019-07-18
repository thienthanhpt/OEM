import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  TemplateRef,
  ContentChild,
  ViewChildren,
  OnInit, AfterViewInit,
} from '@angular/core';
import { DataTableColumnComponent } from './data-table-column.component';
import { DataTableRowComponent } from './data-table-row.component';
import { DataTableParams } from './types';
import { RowCallback } from './types';
import { DataTableTranslations, defaultTranslations } from './types';
import { drag } from '../utils/drag';

@Component({
  selector: 'data-table',
  template: `
    <div class="data-table-wrapper">
      <data-table-header *ngIf="header"></data-table-header>

      <div class="data-table-box" [class.default-height]="minHeight">
        <table [class]="'table table-condensed data-table ' + tableClass">
          <thead>
            <tr>
              <th [hide]="!expandColumnVisible" class="expand-column-header"></th>
              <th [hide]="!indexColumnVisible" class="index-column-header" [style.width]="widthIndexColumn | px">
                <span [textContent]="indexColumnHeader"></span>
              </th>
              <th [hide]="!selectColumnVisible" class="select-column-header">
                <input [hide]="!multiSelect" type="checkbox" [(ngModel)]="selectAllCheckbox"/>
              </th>
              <th *ngFor="let column of columns" #th
                  [hide]="!column.visible"
                  (click)="headerClicked(column, $event)"
                  [class.sortable]="column.sortable"
                  [class.resizable]="column.resizable"
                  [ngClass]="column.styleClassObject"
                  class="column-header"
                  [style.width]="column.width | px">
                <div class="position-relative">
                  <div style="width: 95%;" [class.text-center]="column.center">
                    <span *ngIf="!column.headerTemplate" [textContent]="column.header"></span>
                    <span *ngIf="column.headerTemplate"
                          [ngTemplateOutlet]="column.headerTemplate"
                          [ngTemplateOutletContext]="{column: column}"></span>
                  </div>
                  <div class="position-absolute" style="width: 5%; bottom: 0; right: 0">
                    <span *ngIf="column.sortable">
                      <i class="fas fa-sort column-sortable-icon"
                         [hide]="checkSortProperty(column)"></i>
                      <span [hide]="!checkSortProperty(column)">
                        <i class="fas fa-sort-amount-down" [hide]="sortAsc"></i>
                        <i class="fas fa-sort-amount-up" [hide]="!sortAsc"></i>
                      </span>
                    </span>
                    <span *ngIf="column.resizable" class="column-resize-handle"
                          (mousedown)="resizeColumnStart($event, column, th)"></span>
                  </div>
                </div>
              </th>
           </tr>
          </thead>
          <thead *ngIf="searchable">
            <th [hide]="!expandColumnVisible" class="expand-column-header"></th>
            <th [hide]="!indexColumnVisible" class="index-column-header"></th>
            <th *ngFor="let column of columns" #th
                [hide]="!column.visible"
                class="column-header"
                [style.width]="column.width | px">
              <input *ngIf="column.searchable" type="text" class="form-control" [(ngModel)]="criteria[column.property]">
              <button class="btn btn-success" *ngIf="column.actionColumn">Search</button>
            </th>
          </thead>
          <tbody *ngFor="let item of items; let index=index" class="data-table-row-wrapper"
                 dataTableRow #row [item]="item" [index]="index" (selectedChange)="onRowSelectChanged(row)" (created)="rowCreated.emit(row)">
          </tbody>
          <tbody class="substitute-rows" *ngIf="pagination && substituteRows">
            <tr *ngFor="let item of substituteItems, let index = index"
                [class.row-odd]="(index + items.length) % 2 === 0"
                [class.row-even]="(index + items.length) % 2 === 1">
              <td [hide]="!expandColumnVisible"></td>
              <td [hide]="!indexColumnVisible">&nbsp;</td>
              <td [hide]="!selectColumnVisible"></td>
              <td *ngFor="let column of columns" [hide]="!column.visible"></td>
            </tr>
          </tbody>
        </table>
        <div [ngClass]="{'text-center mb-4': !minHeight, 'text-center-absolute': minHeight}"
             *ngIf="!items || (!reloading && items?.length === 0)">
          No Results Found
        </div>
        <div class="loading-cover loading-gif" *ngIf="items && showReloading && reloading"></div>
      </div>

      <data-table-pagination *ngIf="pagination"></data-table-pagination>
    </div>
  `,
  styles: [`
    :host /deep/ .data-table.table > tbody+tbody {
      border-top: none;
    }
    :host /deep/ .data-table.table td {
      vertical-align: middle;
    }

    :host /deep/ .data-table > thead > tr > th,
    :host /deep/ .data-table > tbody > tr > td {
      overflow: hidden;
      word-break: break-word;
    }

    /* I can't use the bootstrap striped table, because of the expandable rows */
    :host /deep/ .row-odd {
      background-color: #F6F6F6;
    }
    :host /deep/ .row-even {
    }

    .data-table .substitute-rows > tr:hover,
    :host /deep/ .data-table .data-table-row:hover {
      background-color: #ECECEC;
    }
    /* table itself: */

    .data-table {
      box-shadow: 0 0 15px rgb(236, 236, 236);
      table-layout: fixed;
    }

    /* header cells: */

    .column-header {
      position: relative;
    }
    .expand-column-header {
      width: 50px;
    }
    .select-column-header {
      width: 50px;
      text-align: center;
    }
    .index-column-header {
      width: 40px;
    }
    .column-header.sortable {
      cursor: pointer;
    }
    .column-header .column-sort-icon {
      float: right;
    }
    .column-header.resizable .column-sort-icon {
      margin-right: 8px;
    }
    .column-header .column-sort-icon .column-sortable-icon {
      color: lightgray;
    }
    .column-header .column-resize-handle {
      position: absolute;
      top: 0;
      right: 0;
      margin: 0;
      padding: 0;
      width: 8px;
      height: 100%;
      cursor: col-resize;
    }

    /* cover: */
    .data-table-box {
      position: relative;
    }
    .data-table-box.default-height {
      min-height: 40vh;
    }

    .loading-cover {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.3);
      top: 0;
    }
    
    .text-center-absolute {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
  `]
})
export class DataTableComponent implements DataTableParams, OnInit, AfterViewInit {

  @Input() get items() {
    return this._items;
  }

  set items(items: any[]) {
    this._items = items;
    this._onReloadFinished();
  }

  @Input() itemCount: number;

  // UI components:

  @ContentChildren(DataTableColumnComponent) columns: QueryList<DataTableColumnComponent>;
  @ViewChildren(DataTableRowComponent) rows: QueryList<DataTableRowComponent>;
  @ContentChild('dataTableExpand') expandTemplate: TemplateRef<any>;

  // One-time optional bindings with default values:

  @Input() headerTitle: string;
  @Input() header = true;
  @Input() pagination = true;
  @Input() indexColumn = true;
  @Input() indexColumnHeader = '';
  @Input() rowColors: RowCallback;
  @Input() rowTooltip: RowCallback;
  @Input() selectColumn = false;
  @Input() multiSelect = true;
  @Input() substituteRows = true;
  @Input() expandableRows = false;
  @Input() translations: DataTableTranslations = defaultTranslations;
  @Input() selectOnRowClick = false;
  @Input() autoReload = true;
  @Input() showReloading = false;
  @Input() searchable = false;
  @Input() isRefreshable = true;
  @Input() isColumnsSelectable = true;
  @Input() minHeight = true;
  @Input() selectOnCheckboxClick = true;

  @Input() isLoading = false;

  @Output() reload = new EventEmitter();
  // event handlers:
  @Output() rowClick: any  = new EventEmitter();
  @Output() rowDoubleClick: EventEmitter<any>  = new EventEmitter();
  @Output() headerClick: EventEmitter<any> = new EventEmitter();
  @Output() cellClick: EventEmitter<any>  = new EventEmitter();
  @Output() multipleSelectRow: EventEmitter<DataTableRowComponent> = new EventEmitter();
  @Output() rowCreated: EventEmitter<DataTableRowComponent> = new EventEmitter();

  // UI state without input:

  indexColumnVisible: boolean;
  selectColumnVisible: boolean;
  expandColumnVisible: boolean;
  widthIndexColumn = '50';

  resizeLimit = 30;

  criteria = {};

  _displayParams = <DataTableParams>{}; // params of the last finished reload

  get displayParams() {
    return this._displayParams;
  }

  // Reloading:

  _reloading = false;

  _scheduledReload: any = null;

  get reloading() {
    return this._reloading;
  }

  selectedRow: DataTableRowComponent;
  selectedRows: DataTableRowComponent[] = [];

  private _selectAllCheckbox = false;

  // selection:

  get selectAllCheckbox() {
    return this._selectAllCheckbox;
  }

  set selectAllCheckbox(value) {
    this._selectAllCheckbox = value;
    this._onSelectAllChanged(value);
  }

  private _resizeInProgress = false;

  private _items: any[] = [];

  // UI state: visible ge/set for the outside with @Input for one-time initial values

  private _sortBy: string;
  private _sortAsc = true;

  private _offset = 0;
  private _limit = 10;

  @Input()
  get sortBy() {
    return this._sortBy;
  }

  set sortBy(value) {
    if (value !== this._sortBy) {
      this._sortBy = value;
      this._triggerReload();
    }
  }

  @Input()
  get sortAsc() {
    return this._sortAsc;
  }

  set sortAsc(value) {
    if (value !== this._sortAsc) {
      this._sortAsc = value;
      this._triggerReload();
    }
  }

  @Input()
  get offset() {
    return this._offset;
  }

  set offset(value) {
    if (value !== this._offset) {
      this._offset = value;
      this._triggerReload();
    }
  }

  @Input()
  get limit() {
    return this._limit;
  }

  set limit(value) {
    if (value !== this._limit) {
      this._limit = value;
      this._triggerReload();
    }
  }

  // calculated property:

  @Input()
  get page() {
    return Math.floor(this.offset / this.limit) + 1;
  }

  set page(value) {
    const offset = (value - 1) * this.limit;
    if (offset !== this.offset) {
      this.offset = offset;
    }
  }

  @Input()
  set pageDisplay(value: any) {
    const offset = (value - 1) * this.limit;
    if (offset !== this.offset) {
      this._offset = offset;
      this._updateDisplayParams();
    }
  }

  get lastPage() {
    return Math.ceil(this.itemCount / this.limit);
  }

  get columnCount() {
    let count = 0;
    count += this.indexColumnVisible ? 1 : 0;
    count += this.selectColumnVisible ? 1 : 0;
    count += this.expandColumnVisible ? 1 : 0;
    this.columns.toArray().forEach(column => {
      count += column.visible ? 1 : 0;
    });
    return count;
  }

  get substituteItems() {
    return Array.from({ length: this.displayParams!.limit - this.items.length });
  }

  // setting multiple observable properties simultaneously

  sort(sortBy: string, asc: boolean) {
    this.sortBy = sortBy;
    this.sortAsc = asc;
  }

  // set table cl
  tableClass = '';

  @Input()
  set sizeClass(value: 'sm' | 'md' | 'lg') {
    if (value.length > 0) {
      this.tableClass = `table-${value}`;
    }
  }

  // init

  ngOnInit() {
    this._initDefaultValues();
    this._initDefaultClickEvents();
    this._updateDisplayParams();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.autoReload && this._scheduledReload == null) {
        this.reloadItems();
      }
    });
  }

  clearSort() {
    this.sortBy = null;
    this.sortAsc = null;
  }

  reloadItems() {
    this._reloading = true;
    this.reload.emit(this.getTableParameters());
  }

  _updateDisplayParams() {
    this._displayParams = {
      sortBy: this.sortBy,
      sortAsc: this.sortAsc,
      offset: this.offset,
      limit: this.limit
    };
  }

  // for avoiding cascading reloads if multiple params are set at once:
  _triggerReload() {
    if (this._scheduledReload) {
      clearTimeout(this._scheduledReload);
    }
    this._scheduledReload = setTimeout(() => {
      this.reloadItems();
    });
  }

  rowClicked(row: DataTableRowComponent, event: MouseEvent) {
    if (!this.selectOnCheckboxClick && row.isCheckboxClicked) {
      row.isCheckboxClicked = false;
      return;
    }
    this.rowClick.emit({ row, event });
  }

  rowDoubleClicked(row: DataTableRowComponent, event: MouseEvent) {
    this.rowDoubleClick.emit({ row, event });
  }

  getRowColor(item: any, index: number, row: DataTableRowComponent) {
    return (this.rowColors !== undefined) ? (<RowCallback>this.rowColors)(item, row, index) : '';
  }

  resetAllSelected() {
    this.selectedRows = [];
    this.rows.toArray().filter(row_ => row_.selected).forEach(row_ => {
      row_.selected = false;
    });
  }

  onRowSelectChanged(row: DataTableRowComponent) {

    // maintain the selectedRow(s) view
    if (this.multiSelect) {
      const index = this.selectedRows.indexOf(row);
      if (row.selected && index < 0) {
        this.selectedRows.push(row);
      } else if (!row.selected && index >= 0) {
        this.selectedRows.splice(index, 1);
      }
      if (row.isCheckboxClicked) {
        this.multipleSelectRow.emit(row);
      }
    } else {
      if (row.selected) {
        this.selectedRow = row;
      } else if (this.selectedRow === row) {
        this.selectedRow = undefined;
      }
    }

    // unselect all other rows:
    if (row.selected && !this.multiSelect) {
      this.rows.toArray().filter(row_ => row_.selected).forEach(row_ => {
        if (row_ !== row) { // avoid endless loop
          row_.selected = false;
        }
      });
    }
  }

  getTableParameters(): DataTableParams {
    const params = <DataTableParams>{};

    if (this.sortBy) {
      params.sortBy = this.sortBy;
      params.sortAsc = this.sortAsc;
    }
    if (this.pagination) {
      params.offset = this.offset;
      params.limit = this.limit;
    }
    if (this.searchable) {
      params.criteria = this.criteria;
    }
    return params;
  }

  private _initDefaultValues() {
    this.indexColumnVisible = this.indexColumn;
    this.selectColumnVisible = this.selectColumn;
    this.expandColumnVisible = this.expandableRows;
  }

  private _initDefaultClickEvents() {
    this.headerClick.subscribe((tableEvent: any) => this.sortColumn(tableEvent.column));
    if (this.selectOnRowClick) {
      this.rowClick.subscribe((tableEvent: any) => tableEvent.row.selected = !tableEvent.row.selected);
    }
  }

  private _onReloadFinished() {
    this._updateDisplayParams();

    this._selectAllCheckbox = false;
    this._reloading = false;
  }

  private headerClicked(column: DataTableColumnComponent, event: MouseEvent) {
    if (!this._resizeInProgress) {
      this.headerClick.emit({ column, event });
    } else {
      this._resizeInProgress = false; // this is because I can't prevent click from mousup of the drag end
    }
  }

  private cellClicked(column: DataTableColumnComponent, row: DataTableRowComponent, event: MouseEvent) {
    this.cellClick.emit({ row, column, event });
  }

  private checkSortProperty(column: DataTableColumnComponent) {
    if (column.sortProperty === undefined) {
      return column.property === this.sortBy;
    } else {
      return column.sortProperty === this.sortBy;
    }
  }

  // functions:

  // other:

  private _onSelectAllChanged(value: boolean) {
    this.rows.toArray().forEach(row => {
      row.isCheckboxClicked = true;
      row.selected = value;
    });
  }

  private sortColumn(column: DataTableColumnComponent) {
    if (column.sortable) {
      if (column.sortProperty) {
        const ascending = this.sortBy === column.sortProperty ? !this.sortAsc : true;
        this.sort(column.sortProperty, ascending);
      } else {
        const ascending = this.sortBy === column.property ? !this.sortAsc : true;
        this.sort(column.property, ascending);
      }
    }
  }

  // column resizing:

  private resizeColumnStart(event: MouseEvent, column: DataTableColumnComponent, columnElement: HTMLElement) {
    this._resizeInProgress = true;

    drag(event, {
      move: (moveEvent: MouseEvent, dx: number) => {
        if (this._isResizeInLimit(columnElement, dx)) {
          column.width = columnElement.offsetWidth + dx;
        }
      },
    });
  }

  private _isResizeInLimit(columnElement: HTMLElement, dx: number) {
    /* This is needed because CSS min-width didn't work on table-layout: fixed.
     Without the limits, resizing can make the next column disappear completely,
     and even increase the table width. The current implementation suffers from the fact,
     that offsetWidth sometimes contains out-of-date values. */
    return ((dx < 0 && (columnElement.offsetWidth + dx) <= this.resizeLimit) ||
      !columnElement.nextElementSibling || // resizing doesn't make sense for the last visible column
      (dx >= 0 && ((<HTMLElement> columnElement.nextElementSibling).offsetWidth + dx) <= this.resizeLimit));
  }
}
