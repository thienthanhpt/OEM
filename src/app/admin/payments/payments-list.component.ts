import { Component, Injector } from '@angular/core';

import { ListComponent } from '../shared/views/crud/list.component';
import { Payment, PaymentService } from '@app/core/data-services/index';

@Component({
  selector: 'admin-payments-list',
  templateUrl: 'payments-list.component.html',
})
export class PaymentsListComponent extends ListComponent<Payment, PaymentService> {

  protected searchFields = ['~msslNo', ];

  constructor(
    injector: Injector,
    protected dataService: PaymentService
  ) {
    super(injector);
  }
}
