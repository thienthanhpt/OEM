import { Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as moment from 'moment';

import {
  PricingPlan, PricingPlanService, PricingPlanRate, PricingPlanRateService, ModelPermission, Model, PageAccess,
  PRICING_PLAN_RATE_STATUS_OPTIONS, MODEL_OPTIONS, PRODUCT_TYPE_OPTIONS,
} from '@app/core';

import { FormComponent } from '../shared';
import { DataTableParams } from '@app/libs/data-table/components/types';

@Component({
  selector: 'admin-plan-form',
  templateUrl: 'pricing-plan-form.component.html',
})
export class PricingPlanFormComponent extends FormComponent<PricingPlan, PricingPlanService> implements OnInit {

  @ViewChild('promotionTemplateAssignForm') promotionTemplateAssignForm: TemplateRef<any>;

  productTypeOptions = PRODUCT_TYPE_OPTIONS;

  modelName = 'Pricing Plan';

  modelPricingPlanRatePermission: ModelPermission = null;

  pricingPlanRatePagination: DataTableParams = {
    limit: 10,
    offset: 0,
    sortBy: 'startDate',
    sortAsc: true
  };

  pricingPlanRates: PricingPlanRate[] = [];
  pricingPlanRateCount = 0;

  modelPricingPlanRate: PricingPlanRate = null;

  modalAction: string = null;

  pricingPlanRateOptions = PRICING_PLAN_RATE_STATUS_OPTIONS;

  constructor(
    injector: Injector,
    protected dataService: PricingPlanService,
    protected pricingPlanRateService: PricingPlanRateService,
  ) {
    super(injector);
    this.model = new PricingPlan();
    this.model.currentPricingPlanRate = new PricingPlanRate();
    this.model.currentPricingPlanRate.startDate.moment = moment();

    this.modelPricingPlanRate = new PricingPlanRate();
    this.modelPricingPlanRate.startDate.moment = moment();
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.PricePlan]));
    this.modelPricingPlanRatePermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.PlanRate]));
    super.ngOnInit();
  }

  protected onFetchModelSuccess = (model: PricingPlan) => {
    this.model = model;
    this.reloadPricingPlanRates(this.pricingPlanRatePagination);
  }

  isPricingPlanRateAccessible(action: PageAccess): boolean {
    if (this.modelPricingPlanRatePermission) {
      return this.authorizationService.checkPermission(action, this.modelPricingPlanRatePermission);
    } else {
      return false;
    }
  }

  reloadPricingPlanRates(params: DataTableParams) {
    if (this.model.id) {
      this.pricingPlanRateService
        .fetchAll({ 'pricePlanId': this.model.id }, params)
        .subscribe(collection => (this.pricingPlanRates = collection.items) && (this.pricingPlanRateCount = collection.meta.count));
    }
  }

  initActionOnPricingPlanRate = (modalAction: string, planRate?: PricingPlanRate) => {
    this.modalAction = modalAction;
    if (this.modalAction === 'create') {
      this.modelPricingPlanRate = new PricingPlanRate();
      this.modelPricingPlanRate.pricePlanId = this.model.id;
      this.modelPricingPlanRate.startDate.moment = moment();
    } else {
      this.modelPricingPlanRate = this.pricingPlanRateService.clone(planRate);
    }
  }

  onSubmitSuccess(model: PricingPlan) {
    if (this.is('new')) {
      this.modelPricingPlanRate = this.model.currentPricingPlanRate;
      this.modelPricingPlanRate.pricePlanId = model.id;
      this.pricingPlanRateService.create(this.modelPricingPlanRate)
        .subscribe(() => {
          super.onSubmitSuccess(model);
        });
    } else {
      super.onSubmitSuccess(model);
    }
  }

  createPricingPlanRate = () => {
    this.pricingPlanRateService.create(this.modelPricingPlanRate)
      .subscribe(() => {
        this.alertService.success( (this.modalAction === 'Create' ? 'Created' : 'Duplicated') + ' success.', false);
        this.afterPricingPlanRateAction();
      });
  }

  updatePricingPlanRate = () => {
    this.pricingPlanRateService.update(this.modelPricingPlanRate)
      .subscribe(
        () => {
          this.alertService.success('Updated success.', false);
          this.afterPricingPlanRateAction();
        }
      );
  }

  onPricingPlanRateAction = () => {
    if (this.modalAction === 'update') {
      this.updatePricingPlanRate();
    } else {
      this.createPricingPlanRate();
    }
  }

  afterPricingPlanRateAction = () => {
    this.reloadPricingPlanRates(this.pricingPlanRatePagination);
    this.modal.hide();
  }

}
