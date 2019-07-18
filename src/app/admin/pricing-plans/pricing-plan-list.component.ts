import { Component, Injector, OnInit } from '@angular/core';

import { PricingPlan, PricingPlanService, Model, MODEL_OPTIONS } from '@app/core';
import { ListComponent } from '../shared';

@Component({
  selector: 'admin-plan-list',
  templateUrl: 'pricing-plan-list.component.html',
})
export class PricingPlanListComponent extends ListComponent<PricingPlan, PricingPlanService> implements OnInit {

  protected searchFields = [
    '~name', '~subscription', '~companyName',
  ];

  constructor(
    injector: Injector,
    protected dataService: PricingPlanService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.PricePlan]));
  }
}
