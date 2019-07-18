import { Component, Injector } from '@angular/core';

import * as _ from 'lodash';

import { Collection, Invoice, InvoiceService, INVOICE_STATUS_OPTION } from '@app/core';
import { ListComponent } from '../shared';
import { DataTableParams } from '@libs/data-table/components/types';

@Component({
  selector: 'admin-invoices-list',
  templateUrl: 'invoices-list.component.html',
})
export class InvoicesListComponent extends ListComponent<Invoice, InvoiceService> {

  invocieStatusList = INVOICE_STATUS_OPTION;

  invoicePagination: DataTableParams = {
    sortBy: 'createdTime',
    sortAsc: false,
    limit: 20
  };

  invoiceStatusFilterValue = '';

  protected searchFields = [
    '~customer.name', '~consumer.premiseAddress', '~consumer.premisePostalCode',
    '~customer.spAccountNo', '~no', '~period', '~consumer.msslNo', '~customer.emailAddress',
  ];

  protected criteria: { [name: string]: any } = {};

  constructor(
    injector: Injector,
    protected dataService: InvoiceService
  ) {
    super(injector);
  }

  assignItems = (collection: Collection<Invoice>) => {
    this.items = _.uniqBy(collection.items, 'id');
    this.meta = collection.meta;
  }

  filterInvoiceByStatus(params: DataTableParams) {
    if (this.invoiceStatusFilterValue) {
      this.criteria['status'] = [this.invoiceStatusFilterValue];
    } else {
      delete this.criteria['status'];
    }
    this.reloadItems(params);
  }
}
