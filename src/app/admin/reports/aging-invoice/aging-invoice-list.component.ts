import { Component, Injector } from '@angular/core';

import { InvoiceAgingReport, InvoiceAgingReportService } from '@app/core';
import { ListComponent } from '../../shared';

@Component({
  selector: 'admin-aging-invoice-list',
  templateUrl: 'aging-invoice-list.component.html',
})

export class AgingInvoiceListComponent extends ListComponent<InvoiceAgingReport, InvoiceAgingReportService> {

  constructor(
    injector: Injector,
    protected dataService: InvoiceAgingReportService
  ) {
    super(injector);
  }

}
