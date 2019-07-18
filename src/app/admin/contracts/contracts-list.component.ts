import { Component, Injector, OnInit } from '@angular/core';

import { Contract, ContractService, Model, MODEL_OPTIONS } from '@app/core';
import { ListComponent } from '../shared/views/crud/list.component';

@Component({
  selector: 'admin-consumers-list',
  templateUrl: 'contracts-list.component.html',
})
export class ContractsListComponent extends ListComponent<Contract, ContractService> implements OnInit {

  protected searchFields = [
    '~contractRef', '~customer.name', '~consumer.name', '~consumer.premiseAddress', '~consumer.premisePostalCode',
    '~consumer.msslNo', '~pricingPlanName'
  ];

  constructor(
    injector: Injector,
    protected dataService: ContractService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.Contract]));
  }
}
