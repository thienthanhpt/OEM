import { Component, Injector } from '@angular/core';

import { SupportTransaction, SupportTransactionService } from '@app/core';
import { ListComponent } from '../shared';


@Component({
  selector: 'admin-support-transactions-list',
  templateUrl: 'support-transactions-list.component.html',
})
export class SupportTransactionsListComponent
  extends ListComponent<SupportTransaction, SupportTransactionService> {

  constructor(
    injector: Injector,
    protected dataService: SupportTransactionService
  ) {
    super(injector);
  }
}
