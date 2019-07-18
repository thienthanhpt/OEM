import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import {
  BaseModel, BaseService, PricingPlanRate, SuccessResponse, PromotionTemplate,
  PRICING_PLAN_RATE_FIELD_MAP
} from './index';

export enum ProductType {
  DiscountOffTariff = 'dot',
  FixedPrice = 'fix',
}

export const PRODUCT_TYPE_OPTIONS: { [key: string]: string } = {
  [ProductType.DiscountOffTariff]: 'dot',
  [ProductType.FixedPrice]: 'fixed',
};

const PRICING_PLAN_FIELD_MAP = {
  name: 'pricing_name', subscription: 'subscription', description: 'description', companyName: 'company',
  currentPricingPlanRateData: 'current_rate', productType: 'product_type', promotionTemplateData: 'promotion_templates',
  displayPriceName: 'web_portal_display_name',
};

export class PricingPlan extends BaseModel {

  name: string = null;
  subscription: string = null;
  description: string = null;
  companyName: string = null;
  productType: ProductType = null;
  currentPricingPlanRate: PricingPlanRate = null;
  promotionTemplate: PromotionTemplate[] = null;
  displayPricingPlanRate: string = null;

  set currentPricingPlanRateData(data: object) {
    if (!_.isEmpty(data)) {
      this.currentPricingPlanRate = new PricingPlanRate().fromData(data);
      this.currentPricingPlanRate.pricingPlan = this;
    }
  }

  set promotionTemplateData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.promotionTemplate = _.map(dataArray, data => new PromotionTemplate().fromData(data));
    }
  }

  get pricingPlanRateDisplay() {
    if (_.isEmpty(this.promotionTemplate)) {
      return '';
    }

    let rates = '';
    let periods = '';

    if (this.productType === ProductType.DiscountOffTariff) {
      _.forEach(this.promotionTemplate, (promotion, index) => {
        rates += (promotion.percentDiscount * 100).toFixed(2) + '%';

        if ((index + 1) < this.promotionTemplate.length) {
          rates += ' / ';
        } else if ((index + 1) === this.promotionTemplate.length) {
          rates += ' DOT ';
        }

        if (index === 0 && this.promotionTemplate.length > 1) {
          periods += ' first ';
        }

        if (index > 0) {
          periods += ' / next ';
        }

        if (index > 1) {
          periods += promotion.defaultPeriodApplied + ' mths';
        }
      });

    } else {
      _.forEach(this.promotionTemplate, (promotion, index) => {
        if (index > 0) {
          rates += ', ';
        }

        rates += (promotion.rateExcludingTax * 100).toFixed(2);

        if ((index + 1) < this.promotionTemplate.length) {
          rates += ' / ';
        } else if ((index + 1) === this.promotionTemplate.length) {
          rates += ' cents/kWh FIXED';
        }

        if (index === 0 && this.promotionTemplate.length > 1) {
          periods += 'first ';
        } else if (this.promotionTemplate.length === 1) {
          periods += (promotion.defaultPeriodApplied + 'mths');
        }

        if ((index + 1) === this.promotionTemplate.length) {
          periods += ' - Excluding GST';
        }
      });
    }
    if (periods) {
      periods = ' - ' + periods;
    }

    return this.name + ' (' + rates + periods + ')';
  }

  protected getFieldMap() {
    return super.getFieldMap(PRICING_PLAN_FIELD_MAP);
  }
}

function newPricingPlan(data: object): PricingPlan {
  return new PricingPlan().fromData(data);
}

@Injectable()
export class PricingPlanService extends BaseService<PricingPlan> {

  protected baseUrl = 'priceplan';

  protected newModel = (data: object) => newPricingPlan(data);

  assignPromotionTemplate(pricePlanId: number, promotionTemplateId: number, startingPeriod: number): Observable<PromotionTemplate> {
    return this.http.post(`${this.baseUrl}/${pricePlanId}/promotion-template/${promotionTemplateId}/assign/`,
      { starting_period: startingPeriod }, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new PromotionTemplate().fromData(rs.data)));
  }

  fetchOneByCustomerType(id: number, customerType?: string) {
    return this.http.get(`${this.baseUrl}/${id}/?customer_type=${customerType}`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => (this.newModel(rs.data))));
  }

  fetchOnePricingPlan(isExtend?: boolean, ctrId?: number) {
    return this.http.get(`catalogue/?crid=${ctrId}&is_extend=${isExtend}/`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => this.newModel(rs.data)));
  }

  fetchAllPricingPlan(): Observable<{ items: PricingPlan[]}>  {
    return this.http.get('catalogue/', this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => ({ items: _.map(rs.data, row => (this.newModel(row))) })));
  }

  protected getFieldMap() {
    return super.getFieldMap(PRICING_PLAN_FIELD_MAP);
  }

  protected getSortFieldMap() {
    return super.getSortFieldMap({
      currentPricingPlanRate: PRICING_PLAN_RATE_FIELD_MAP
    });
  }
}
