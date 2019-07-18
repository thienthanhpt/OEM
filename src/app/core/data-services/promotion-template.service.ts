import { Injectable } from '@angular/core';

import { BaseModel, BaseService } from './index';

export enum DiscountType {
  Percent = 'percent',
  Fixed = 'fixed',
}

export const DISCOUNT_TYPE_OPTIONS: { [key: string]: string } = {
  [DiscountType.Percent]: 'Percent',
  [DiscountType.Fixed]: 'Fixed',
};

export const PROMOTION_TEMPLATE_FIELD_MAP = {
  discountType: 'discount_type', prefixCode: 'prefix_code', promotionName: 'name', promotionDescription: 'description',
  percentDiscount: 'percent_discount', defaultPeriodApplied: 'default_applying_periods', pricePlanId: 'price_plan_id',
  createdTime: 'created_date', updatedTime: 'last_modified_date', fixedPriceDiscount: 'fixed_price_discount', isActive: 'is_active',
  startingPeriod: 'starting_period', promotionTemplateType: 'promotion_tmpl_type', applyOnPeriod: 'apply_on_period',
  rateExcludingTax: 'rate_with_promotion_excluding_tax', rate: 'rate_with_promotion',

};

const PROMOTION_TEMPLATE_IGNORE_FIELDS = [ 'startingPeriod' ];

export class PromotionTemplate extends BaseModel {
  defaultPeriodApplied: number = null;
  discountType: DiscountType = null;
  fixedPriceDiscount: number = null;
  percentDiscount: number = null;
  prefixCode = '';
  pricePlanId: number = null;
  promotionDescription = '';
  promotionName = '';
  startingPeriod: number = null;
  rateExcludingTax: number = null;
  rate: number = null;

  get discountTypeDisplay() {
    return DISCOUNT_TYPE_OPTIONS[this.discountType] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(PROMOTION_TEMPLATE_FIELD_MAP);
  }

  protected getToDataIgnoredFields() {
    return super.getToDataIgnoredFields(PROMOTION_TEMPLATE_IGNORE_FIELDS);
  }
}

function newPromotionTemplate(data: object): PromotionTemplate {
  return new PromotionTemplate().fromData(data);
}

@Injectable()
export class PromotionTemplateService extends BaseService<PromotionTemplate> {

  protected baseUrl = 'promotiontemplate';

  protected newModel = (data: object) => newPromotionTemplate(data);

  protected getFieldMap() {
    return super.getFieldMap(PROMOTION_TEMPLATE_FIELD_MAP);
  }

}
