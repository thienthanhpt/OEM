import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';

import * as _ from 'lodash';

import { ContractOrigin, DdaFileService, Transaction, TransactionService } from '@app/core';
import { ListComponent, AlertModalService } from '../../shared';

@Component({
  selector: 'admin-generation-transactions-list',
  templateUrl: './generation-transactions-list.component.html',
})
export class GenerationTransactionsListComponent
  extends ListComponent<Transaction, TransactionService> implements OnInit {

  @Output() complete: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() generating: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() set generateTrigger(value: number) {
    if (value > 0) {
      this.generate();
    }
  }
  loading = false;
  contractIdList: number[] = [];
  contractRemovedIdList: number[] = [];

  constructor(
    injector: Injector,
    protected dataService: TransactionService,
    private ddaFileService: DdaFileService,
    private alertModalService: AlertModalService,
  ) {
    super(injector);
    this.criteria = {
      contractOrigin: ContractOrigin.DBS,
      status: 'done',
      contractAutoDeduct: false,
      isSentPDDA: false,
    };
    this.meta.sortBy = 'createdTime';
    this.meta.sortAsc = false;
    this.meta.limit = 1000;
  }

  ngOnInit() {
    this.dataService
      .fetchAll(this.criteria, this.meta)
      .subscribe((transactionCollection) => {
        this.contractIdList = _.map(transactionCollection.items, (item: Transaction) => item.id);
      });
  }

  remove = (item: Transaction) => {
    this.contractRemovedIdList.push(item.id);
    const removedRow = this.dataTable.rows.find(row =>  row.item === item);
    if (removedRow) {
      removedRow.muted = true;
    }
  }

  undo = (item: Transaction) => {
    const index = this.contractRemovedIdList.indexOf(item.id);
    if (index >= 0) {
      this.contractRemovedIdList.splice(index, 1);
      const removedRow = this.dataTable.rows.find(row =>  row.item === item);
      if (removedRow) {
        removedRow.muted = false;
      }
    }
  }

  generate = () => {
    const generateList = _.difference(this.contractIdList, this.contractRemovedIdList);
    if (_.isEmpty(generateList)) {
      this.alertModalService.warn('Notice!', 'There is no file to generate! Please choose one.');
      return;
    }

    this.generating.emit(this.loading = true);
    this.ddaFileService.generate(generateList).subscribe(() => {
      this.generating.emit(this.loading = false);
      this.complete.emit(true);
    }, () => {
      this.generating.emit(this.loading = false);
      this.complete.emit(false);
    });
  }

}
