import { Component, Injector, OnInit } from '@angular/core';

import { Consumer, ConsumerService, Model, MODEL_OPTIONS } from '@app/core';
import { ListComponent } from '../shared/views/crud/list.component';


@Component({
  selector: 'admin-consumers-list',
  templateUrl: 'consumers-list.component.html',
})
export class ConsumersListComponent extends ListComponent<Consumer, ConsumerService> implements OnInit {

  protected searchFields = ['~name', '~premiseAddress', '~premisePostalCode', '~msslNo',
                            '~customer.name', '~customer.identificationNo', '~ebsNo', '~shBillingAccount'];


  constructor(
    injector: Injector,
    protected dataService: ConsumerService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.Consumer]));
  }

}
