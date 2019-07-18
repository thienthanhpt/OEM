import { Component, Input, OnInit } from '@angular/core';
import { Histories, HistoriesService } from '../../../../core/data-services/histories.service';
import { DataTableParams } from '../../../../libs/data-table/components/types';
import * as _ from 'lodash';

@Component({
  selector: 'admin-table-history',
  template: `
    <div *ngFor="let history of items; let index = index;" style="background-color: #f3f3f3">
      <div class="bg-hover-row p-2">
        <ng-container [ngSwitch]="history.action">
          <ng-container *ngSwitchCase="action.CREATED">
            <a class="row pl-4 d-inline offset-1">
              <span class="fa-stack text-secondary"><i class="fas fa-user-circle fa-stack-2x"></i></span>
              <span class="text-primary">{{ history.actionBy }}</span>
              {{ history.action }} {{ modelOfHistories }} - {{ history.updatedTime.short }}
            </a>
          </ng-container>
          <ng-container *ngSwitchDefault>
            <a class="row pl-4 d-inline offset-1">
              <span class="fa-stack text-secondary"><i class="fas fa-user-circle fa-stack-2x"></i></span>
              <span class="text-primary">{{ history.actionBy }}</span>
              {{ history.action }} {{ modelOfHistories }} - {{ history.updatedTime.short }}
            </a>
            <div class="row font-weight-bold offset-2" *ngIf="history.descriptionList.length > 1">
              <div class="col-2">Field</div>
              <div class="col-4">Original Value</div>
              <div class="col-4">New value</div>
            </div>
            <div class="row offset-2 pt-1" *ngFor="let detail of history.descriptionList">
              <div class="col-2 activity-field-name-color">{{ detail.field }}</div>
              <div class="col-4">{{ detail.oldValue }}</div>
              <div class="col-4">{{ detail.newValue }}</div>
            </div>
          </ng-container>
        </ng-container>
      </div>
    </div>
    <div *ngIf="isShowMore" class="text-center"><a href="javascript:void(0)" (click)="loadMoreHistories()">Show more...</a></div>
  `
})
export class TableHistoryComponent implements OnInit {
  @Input() modelOfHistories: string = null;
  @Input() id: number;

  historiesMeta: { [name: string]: any } = { count: 0, page: 1, next: null };
  historiesPagination: DataTableParams = { limit: 10, offset: 0, sortAsc: false, sortBy: 'updatedTime' };
  items: Histories[] = [];
  action = {
    CREATED: 'created',
    UPDATE: 'updated'
  };

  isShowMore = false;

  constructor(protected dataService: HistoriesService) { }

  ngOnInit() {
    this.reloadHistories(this.historiesPagination);
  }

  reloadHistories(params: DataTableParams) {
    this.dataService.fetchAllHistories(params, this.modelOfHistories, this.id).subscribe(
      collection => {
        if (collection.meta.next) {
          this.isShowMore = true;
        } else {
          this.isShowMore = false;
        }
        this.items = _.uniqWith(this.items.concat(collection.items), _.isEqual);
        this.historiesMeta = collection.meta;
      }
    );
  }

  loadMoreHistories() {
    this.historiesPagination.offset = this.historiesMeta.page * this.historiesPagination.limit;
    this.reloadHistories(this.historiesPagination);
  }

}
