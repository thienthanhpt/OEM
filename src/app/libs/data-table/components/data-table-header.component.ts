import { Component, Inject, forwardRef } from '@angular/core';
import { DataTableComponent } from './data-table.component';

@Component({
  selector: 'data-table-header',
  template: `
    <div class="data-table-header">
      <h4 class="title" [textContent]="dataTable.headerTitle || ''"></h4>
      <div class="button-panel">
        <!--<button *ngIf="dataTable.sortBy" type="button" class="btn btn-default btn-sm refresh-button d-none"-->
                <!--(click)="dataTable.clearSort()" title="Clear sort">-->
          <!--<i class="far fa-times-circle"></i>-->
        <!--</button>-->
        <button *ngIf="dataTable.isRefreshable" type="button" class="btn btn-default btn-sm refresh-button"
                (click)="dataTable.reloadItems()" title="Reload">
          <i class="fas fa-sync"></i>
        </button>
        <button *ngIf="dataTable.isColumnsSelectable" type="button" class="btn btn-default btn-sm column-selector-button"
                [class.active]="columnSelectorOpen"
                (click)="columnSelectorOpen = !columnSelectorOpen; $event.stopPropagation()" title="Selector" >
          <i class="fas fa-list"></i>
        </button>
        <div class="column-selector-wrapper" (click)="$event.stopPropagation()">
          <div *ngIf="columnSelectorOpen" class="column-selector-box card">
            <div *ngIf="dataTable.expandableRows" class="column-selector-fixed-column checkbox">
              <label>
                <input type="checkbox" [(ngModel)]="dataTable.expandColumnVisible"/>
                <span>{{ dataTable.translations.expandColumn }}</span>
              </label>
            </div>
            <div *ngIf="dataTable.indexColumn" class="column-selector-fixed-column checkbox">
              <label>
                <input type="checkbox" [(ngModel)]="dataTable.indexColumnVisible"/>
                <span>{{ dataTable.translations.indexColumn }}</span>
              </label>
            </div>
            <div *ngIf="dataTable.selectColumn" class="column-selector-fixed-column checkbox">
              <label>
                <input type="checkbox" [(ngModel)]="dataTable.selectColumnVisible"/>
                <span>{{ dataTable.translations.selectColumn }}</span>
              </label>
            </div>
            <ng-container *ngFor="let column of dataTable.columns">
              <div *ngIf="column.selectable" class="column-selector-column checkbox">
                <label>
                  <input type="checkbox" [(ngModel)]="column.visible"/>
                  <span [textContent]="column.header || ''"></span>
                </label>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .data-table-header {
      min-height: 25px;
      margin-bottom: 10px;
    }
    .title {
      display: inline-block;
      margin: 5px 0 0 5px;
    }
    .button-panel {
      float: right;
    }
    .button-panel button {
      outline: none !important;
    }

    .column-selector-wrapper {
      position: relative;
    }
    .column-selector-box {
      box-shadow: 0 0 10px lightgray;
      width: 150px;
      padding: 10px;
      position: absolute;
      right: 0;
      top: 1px;
      z-index: 1060;
    }
    .column-selector-box .checkbox {
      margin-bottom: 4px;
    }
    .column-selector-fixed-column {
      font-style: italic;
    }
  `],
  host: {
    '(document:click)': '_closeSelector()'
  }
})
export class DataTableHeaderComponent {

  columnSelectorOpen = false;

  _closeSelector() {
    this.columnSelectorOpen = false;
  }

  constructor(@Inject(forwardRef(() => DataTableComponent)) public dataTable: DataTableComponent) {}
}
