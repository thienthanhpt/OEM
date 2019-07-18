import {
  Component, Input, Inject, forwardRef, Output, EventEmitter, OnDestroy, AfterViewInit
} from '@angular/core';
import * as _ from 'lodash';

import { DataTableComponent } from './data-table.component';

@Component({
  selector: '[dataTableRow]',
  template: `
    <tr	class="data-table-row"
        [title]="getTooltip()"
        [style.background-color]="dataTable.getRowColor(item, index, _this)"
        [class.row-odd]="index % 2 === 0"
        [class.row-even]="index % 2 === 1"
        [class.text-muted]="muted"
        [class.selected]="selected"
        [class.clickable]="dataTable.selectOnRowClick"
        (dblclick)="dataTable.rowDoubleClicked(_this, $event)"
        (click)="dataTable.rowClicked(_this, $event)">
      <td [hide]="!dataTable.expandColumnVisible" (click)="expanded = !expanded; $event.stopPropagation()" class="row-expand-button">
        <span class="fa fa-arrow-circle-o-right" [hide]="expanded"></span>
        <span class="fa fa-arrow-circle-o-down" [hide]="!expanded"></span>
      </td>
      <td [hide]="!dataTable.indexColumnVisible" class="index-column" [textContent]="displayIndex"></td>
      <td [hide]="!dataTable.selectColumnVisible" class="select-column">
        <input type="checkbox" (change)="isCheckboxClicked = true; selected = !selected" [checked]="selected || null"/>
      </td>
      <td *ngFor="let column of dataTable.columns" [hide]="!column.visible" [ngClass]="column.styleClassObject" class="data-column"
          [style.background-color]="column.getCellColor(_this, index)" [class.text-center]="column.center">
        <div *ngIf="!column.cellTemplate" [textContent]="getContent(item, column.property)"></div>
        <div *ngIf="column.cellTemplate"
             [ngTemplateOutlet]="column.cellTemplate" [ngTemplateOutletContext]="{column: column, row: _this, item: item}"></div>
      </td>
    </tr>
    <tr *ngIf="dataTable.expandableRows" [hide]="!expanded" class="row-expansion">
      <td [attr.colspan]="dataTable.columnCount">
        <div [ngTemplateOutlet]="dataTable.expandTemplate" [ngTemplateOutletContext]="{row: _this, item: item}"></div>
      </td>
    </tr>
  `,
  styles: [`
    .select-column {
      text-align: center;
    }

    .row-expand-button {
      cursor: pointer;
      text-align: center;
    }

    .clickable {
      cursor: pointer;
    }
  `]
})
export class DataTableRowComponent implements AfterViewInit, OnDestroy {

  public _this = this; // FIXME is there no template keyword for this in angular 2

  @Input() item: any;
  @Input() index: number;

  expanded: boolean;
  muted = false;

  isCheckboxClicked = false;

  // row selection:

  @Output() selectedChange = new EventEmitter();
  @Output() created = new EventEmitter();

  private _selected = false;

  get selected() {
    return this._selected;
  }

  set selected(selected) {
    this._selected = selected;
    this.selectedChange.emit(selected);
  }

  // other:

  constructor(@Inject(forwardRef(() => DataTableComponent)) public dataTable: DataTableComponent) {}

  ngAfterViewInit() {
    this.created.emit();
  }

  get displayIndex() {
    if (this.dataTable.pagination) {
      return this.dataTable.displayParams.offset + this.index + 1;
    } else {
      return this.index + 1;
    }
  }

  getContent(item: any, property: string) {
    return _.get(item, property);
  }

  getTooltip() {
    if (this.dataTable.rowTooltip) {
      return this.dataTable.rowTooltip(this.item, this, this.index);
    }
    return '';
  }

  ngOnDestroy() {
    this.isCheckboxClicked = false;
    this.selected = false;
  }
}
