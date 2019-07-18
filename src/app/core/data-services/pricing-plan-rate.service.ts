import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, DateMoment } from './base.service';
import { PricingPlan } from './pricing-plan.service';
import { PromotionTemplate } from './promotion-template.service';

export enum PricingPlanRateStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export const PRICING_PLAN_RATE_STATUS_OPTIONS: { [key: string]: string } = {
  [PricingPlanRateStatus.Active]: 'Active',
  [PricingPlanRateStatus.Inactive]: 'Inactive',
};

export const PRICING_PLAN_RATE_FIELD_MAP = {
  rate: 'rate', cleanEnergyPercentage: 'clean_energy', offPeakRate: 'off_peak_rate',
  status: 'sales_status', startDate: 'sales_start_date', discountPercentage: 'discount',
  pricePlanId: 'priceplan_id', pricingPlanName: 'pricing_name', promotionTemplateData: 'promotion_templates'
};

export class PricingPlanRate extends BaseModel {

  pricingPlan: PricingPlan = null;
  rate: number = null;
  discountPercentage: number = null;
  cleanEnergyPercentage: number = null;
  offPeakRate: number = null;
  pricePlanId: number = null;
  status: PricingPlanRateStatus = null;
  startDate = new DateMoment();
  promotionTemplate: PromotionTemplate[] = null;

  get statusDisplay() {
    return PRICING_PLAN_RATE_STATUS_OPTIONS[_.lowerCase(this.status)] || null; //Todo: need BE to clean Database
  }

  set promotionTemplateData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.promotionTemplate = _.map(dataArray, data => new PromotionTemplate().fromData(data));
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(PRICING_PLAN_RATE_FIELD_MAP);
  }
}

function newPricingPlanRate(data: object): PricingPlanRate {
  return new PricingPlanRate().fromData(data);
}

@Injectable()
export class PricingPlanRateService extends BaseService<PricingPlanRate> {

  protected baseUrl = 'planrate';

  protected newModel = (data: object) => newPricingPlanRate(data);

  protected getFieldMap() {
    return super.getFieldMap(PRICING_PLAN_RATE_FIELD_MAP);
  }
}
