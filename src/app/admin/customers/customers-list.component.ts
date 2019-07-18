import { Component, Injector, OnInit } from '@angular/core';

import { Customer, CustomerService, Model, MODEL_OPTIONS } from '@app/core';
import { ListComponent } from '../shared';

@Component({
  selector: 'admin-customers-list',
  templateUrl: 'customers-list.component.html',
})
export class CustomersListComponent extends ListComponent<Customer, CustomerService> implements OnInit {

  protected searchFields = [
    '~spAccountNo', '~name', '~gstRegisteredNo', '~identificationNo',
    '~postalCode', '~address', '~typeValue',
  ];

  constructor(
    injector: Injector,
    protected dataService: CustomerService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.Customer]));
  }
}
