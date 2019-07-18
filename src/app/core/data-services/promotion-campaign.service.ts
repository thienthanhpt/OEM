import { BaseModel, BaseService, Collection, DateMoment, SuccessResponse } from './base.service';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export enum PromotionStatus {
  Valid = 'valid', Invalid = 'invalid'
}

export const PROMOTION_CODE_STATUS: { [key: string]: string } = {
  [PromotionStatus.Valid]: 'Can be imported.',
  [PromotionStatus.Invalid]: 'INVALID',
};

export enum CustomerTypes {
  Residential = 'r', Commercial = 'c', Any = 'a'
}

export const CUSTOMER_TYPES: { [key: string]: string } = {
  [CustomerTypes.Residential]: 'Residential',
  [CustomerTypes.Commercial]: 'Commercial',
  [CustomerTypes.Any]: 'Any'
};

export const PROMOTION_CODE_FIELD_MAP = {
  code: 'code', customerType: 'customer_type', limit: 'used_count_limit', usedCount: 'used_count'
};

export class PromotionCode extends BaseModel {
  code: string = null;
  customerType: string = null;
  limit: number = null;
  usedCount = 0;

  // Use to display status of Promotion Code
  status: string = null;
  reason: string = null;

  get statusDisplay() {
    return PROMOTION_CODE_STATUS[this.status];
  }

  get customerTypeDisplay() {
    return CUSTOMER_TYPES[_.toLower(this.customerType)];
  }

  protected getFieldMap() {
    return super.getFieldMap(PROMOTION_CODE_FIELD_MAP);
  }
}

export const PROMOTION_CAMPAIGN_FIELD_MAP = {
  name: 'name', amount: 'amount', description: 'description', fromDate: 'date_from', toDate: 'date_to',
  promotionCodesData: 'promotion_codes', customerType: 'customer_type'
};

export class PromotionCampaign extends BaseModel {
  name: string = null;
  amount: number = null;
  description: string = null;
  customerType: string = null;
  fromDate = new DateMoment();
  toDate = new DateMoment();

  promotionCodes: PromotionCode[] = [];

  get customerTypeDisplay() {
    return CUSTOMER_TYPES[this.customerType];
  }

  set promotionCodesData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.promotionCodes = _.map(dataArray, data => new PromotionCode().fromData(data));
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(PROMOTION_CAMPAIGN_FIELD_MAP);
  }
}

function newPromotionCampain(data: object): PromotionCampaign {
  return new PromotionCampaign().fromData(data);
}

@Injectable()
export class PromotionCampaignService extends BaseService<PromotionCampaign> {

  protected baseUrl = 'campaigns';
  protected newModel = (data: object) => newPromotionCampain(data);

  protected getFieldMap() {
    return super.getFieldMap(PROMOTION_CAMPAIGN_FIELD_MAP);
  }

  delete(ids: number[], promotionCampaignId: number): Observable<any> {
    const data = {
      promotion_code_id_list: ids
    }
    return this.http.post(`${this.baseUrl}/${promotionCampaignId}/codes/delete/`, data, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => rs.data));
  }

  create(model: PromotionCampaign) {
    const data = model.toData();
    data['codes'] = model.promotionCodes.map((item: PromotionCode) => item.toData());

    if (!_.has(data, 'date_from')) {
      data['date_from'] = null;
    }
    if (!_.has(data, 'date_to')) {
      data['date_to'] = null;
    }
    return this.createFromData(data);
  }

  update(model: PromotionCampaign, updateFields?: string[]) {
    const data = model.toData(updateFields);

    if (!_.has(data, 'date_from')) {
      data['date_from'] = null;
    }
    if (!_.has(data, 'date_to')) {
      data['date_to'] = null;
    }
    return this.updateFromData(model.id, data);
  }

  checkExists(promotionCodeList: PromotionCode[], id: number): Observable<{ items: PromotionCampaign[] }> {
    const data = {
      promotion_code_list: _.map(promotionCodeList, promo => promo.toData())
    };
    return this.http.post(`${this.baseUrl}/${id}/codes/verify/`, data, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => ({ items: _.map(rs.data, row => this.newModel(row)) })));
  }

  addPromotionCode(promotionCodeList: PromotionCode[], id: number): Observable<PromotionCampaign> {
    const data = {
      promotion_code_list: _.map(promotionCodeList, (row: PromotionCode) => row.toData())
    };
    return this.http.post(`${this.baseUrl}/${id}/codes/add/`, data, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => this.newModel(rs.data)));
  }

  editPromotionCode(promotionCode: PromotionCode, id: number): Observable<PromotionCampaign> {
    console.log(promotionCode);
    const data = [
      promotionCode.toData()
    ]
    return this.http.post(`${this.baseUrl}/${id}/codes/edit/`, data, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => this.newModel(rs.data)));
  }

  protected getSortFieldMap() {
    return super.getSortFieldMap({
      codes: PROMOTION_CODE_FIELD_MAP
    });
  }
}
