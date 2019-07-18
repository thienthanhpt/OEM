import { Component, Inject, forwardRef } from '@angular/core';
import { DataTableComponent } from './data-table.component';

@Component({
  selector: 'data-table-pagination',
  template: `
    <div class="pagination-box">
      <div class="pagination-range">
        {{ dataTable.translations.paginationRange }}:
        <span [textContent]="dataTable.offset + 1"></span>
        -
        <span [textContent]="[dataTable.offset + dataTable.limit , dataTable.itemCount] | min"></span>
        /
        <span [textContent]="dataTable.itemCount"></span>
      </div>
      <div class="pagination-controllers">
        <div class="pagination-limit">
          <div class="input-group">
            <span class="input-group-addon">{{ dataTable.translations.paginationLimit }}:</span>
            <input #limitInput type="number" class="form-control pagination-limit-customize" min="1" step="1"
                   [ngModel]="limit" (blur)="limit = limitInput.value"
                   (keyup.enter)="limit = limitInput.value" (keyup.esc)="limitInput.value = limit"/>
          </div>
        </div>
        <div class="pagination-pages">
          <button [disabled]="dataTable.offset <= 0"
                  (click)="pageFirst()"
                  class="btn btn-default pagination-firstpage">
            &laquo;
          </button>
          <button [disabled]="dataTable.offset <= 0"
                  (click)="pageBack()"
                  class="btn btn-default pagination-prevpage">
            &lsaquo;
          </button>
          <div class="pagination-page">
            <div class="input-group">
              <input #pageInput type="number" class="form-control" min="1" step="1" max="{{maxPage}}"
                     [ngModel]="page" (blur)="page = pageInput.value"
                     (keyup.enter)="page = pageInput.value" (keyup.esc)="pageInput.value = page"/>
              <div class="input-group-addon page-total-number">
                <span>/</span>
                <span [textContent]="dataTable.lastPage"></span>
              </div>
            </div>
          </div>
          <button [disabled]="(dataTable.offset + dataTable.limit) >= dataTable.itemCount"
                  (click)="pageForward()"
                  class="btn btn-default pagination-nextpage">
            &rsaquo;
          </button>
          <button [disabled]="(dataTable.offset + dataTable.limit) >= dataTable.itemCount"
                  (click)="pageLast()"
                  class="btn btn-default pagination-lastpage">
            &raquo;
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pagination-box {
      position: relative;
      margin-top: -10px;
    }
    .pagination-range {
      margin-top: 7px;
      margin-left: 3px;
      display: inline-block;
    }
    .pagination-controllers {
      float: right;
    }
    .pagination-controllers input {
      min-width: 60px;
      /*padding: 1px 0px 0px 5px;*/
      text-align: right;
    }
    .pagination-limit {
      margin-right: 25px;
      display: inline-table;
      width: 150px;
    }
    .pagination-pages {
      display: inline-block;
    }
    .pagination-page {
      width: 110px;
      display: inline-table;
      margin-top: 2px;
    }
    .pagination-page .input-group-addon {
      display: inline;
    }
    .pagination-box button {
      outline: none !important;
    }
    .pagination-prevpage,
    .pagination-nextpage,
    .pagination-firstpage,
    .pagination-lastpage {
      vertical-align: top;
    }
    .pagination-limit-customize {
      margin-top: -7px;
    }
    .page-total-number {
      padding: 7px;
    }
  `]
})
export class DataTablePaginationComponent {

  constructor(@Inject(forwardRef(() => DataTableComponent)) public dataTable: DataTableComponent) {}

  pageBack() {
    this.dataTable.offset -= Math.min(this.dataTable.limit, this.dataTable.offset);
  }

  pageForward() {
    this.dataTable.offset += this.dataTable.limit;
  }

  pageFirst() {
    this.dataTable.offset = 0;
  }

  pageLast() {
    this.dataTable.offset = (this.maxPage - 1) * this.dataTable.limit;
  }

  get maxPage() {
    return Math.ceil(this.dataTable.itemCount / this.dataTable.limit);
  }

  get limit() {
    return this.dataTable.limit;
  }

  set limit(value) {
    this.dataTable.limit = Number(<any>value); // TODO better way to handle that value of number <input> is string?
  }

  get page() {
    return this.dataTable.page;
  }

  set page(value) {
    this.dataTable.page = Number(<any>value);
  }
}
