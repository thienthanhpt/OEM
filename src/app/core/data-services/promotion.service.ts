import { Injectable } from '@angular/core';

import { BaseModel, BaseService, DateMoment, PromotionTemplate } from './index';


export enum Issuer {
  Sunseap = 'sunseap',
  Starhub = 'starhub',
}

export const ISSUER_OPTIONS: { [key: string]: string} = {
  [Issuer.Sunseap]: 'Sunseap',
  [Issuer.Starhub]: 'Starhub',
};

const PROMOTION_FIELD_MAP = {
  actualUsedDate: 'actual_used_date', contractId: 'crid', expiredDate: 'expired_date', issuedDate: 'issued_date',
  promotionTemplateId: 'promotion_template_id', planRateType: 'plan_rate_type', planRateValue: 'plan_rate_value',
  applyingPeriods: 'applying_periods', promotionTemplateData: 'promotion_template'
};

export class Promotion extends BaseModel {
  actualUsedDate = new DateMoment();
  expiredDate = new DateMoment();
  issuedDate = new DateMoment();
  promotionTemplateId: number = null;
  promotionTemplate: PromotionTemplate = null;
  contractId: number = null;
  planRateType: string = null;
  planRateValue: number = null;
  applyingPeriods: number = null;

  set promotionTemplateData(data: object) {
    this.promotionTemplate = new PromotionTemplate().fromData(data);
  }

  protected getFieldMap() {
    return super.getFieldMap(PROMOTION_FIELD_MAP);
  }
}

function newPromotion(data: object): Promotion {
  return new Promotion().fromData(data);
}

@Injectable()
export class PromotionService extends BaseService<Promotion> {

  protected baseUrl = 'promotion';

  protected newModel = (data: object) => newPromotion(data);

  protected getFieldMap() {
    return super.getFieldMap(PROMOTION_FIELD_MAP);
  }

}
