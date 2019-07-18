import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseModel, BaseService, DateMoment, SuccessResponse } from './base.service';


export class BillingOptionContent {
  dateOfBill: string = null;
  periodSendFrom: number = null;
  periodSendTo: number = null;
  value: string = null;
}

export enum BillingOption {
  BC71 = 'BC71',
  BC72 = 'BC72',
  BC73 = 'BC73',
  BC74 = 'BC74',
  BC75 = 'BC75',
  BC76 = 'BC76',
  BC77 = 'BC77',
  BP1 = 'BP1',
  BP12 = 'BP12',
  BP8 = 'BP8',
  BP14 = 'BP14',
  BP20 = 'BP20',
  BP16 = 'BP16',
  BP24 = 'BP24',
}

export const BILLING_OPTIONS: { [key: string]: BillingOptionContent } = {
  [BillingOption.BP1]: { dateOfBill: '1',  periodSendFrom: 23, periodSendTo: 29, value: 'BP1'},
  [BillingOption.BP12]: { dateOfBill: '12',  periodSendFrom: 7, periodSendTo: 10, value: 'BP12'},
  [BillingOption.BP8]: { dateOfBill: '8',  periodSendFrom: 2, periodSendTo:  6, value: 'BP8'},
  [BillingOption.BP14]: { dateOfBill: '14',  periodSendFrom: 11, periodSendTo: 12, value: 'BP14'},
  [BillingOption.BP20]: { dateOfBill: '20',  periodSendFrom: 15, periodSendTo: 18, value: 'BP20'},
  [BillingOption.BP16]: { dateOfBill: '16',  periodSendFrom: 13, periodSendTo: 14, value: 'BP16'},
  [BillingOption.BP24]: { dateOfBill: '24',  periodSendFrom: 19, periodSendTo: 22, value: 'BP24'},
};

export const BILLING_BC_OPTIONS = {
  [BillingOption.BC71]: { dateOfBill: '1',  periodSendFrom: 23, periodSendTo: 29, value: 'BC71' },
  [BillingOption.BC72]: { dateOfBill: '12',  periodSendFrom: 7, periodSendTo: 10, value: 'BC72'},
  [BillingOption.BC73]: { dateOfBill: '8',  periodSendFrom: 30, periodSendTo:  6, value: 'BC73'},
  [BillingOption.BC74]: { dateOfBill: '14',  periodSendFrom: 11, periodSendTo: 12, value: 'BC74'},
  [BillingOption.BC75]: { dateOfBill: '20',  periodSendFrom: 15, periodSendTo: 18, value: 'BC75'},
  [BillingOption.BC76]: { dateOfBill: '16',  periodSendFrom: 13, periodSendTo: 14, value: 'BC76'},
  [BillingOption.BC77]: { dateOfBill: '24',  periodSendFrom: 19, periodSendTo: 22, value: 'BC77'}
};

export const BILLING_PERIOD_FIELD_MAP = {
  startDate: 'start_date', frequency: 'frequency', billingOption: 'billing_option', billingCount: 'count',
  nextBillingDate: 'next_billing_day', rollOver: 'roll_over', totalPeriod: 'total_period',
};

export class BillingPeriod extends BaseModel {

  startDate = new DateMoment();
  frequency: string = null;
  billingOption: BillingOption = null;
  billingCount: number = null;
  nextBillingDate = new DateMoment();
  rollOver: number = null;
  totalPeriod: number = null;

  // Use for billing BC type.
  billingBC = '';

  get billingOptionContent(): BillingOptionContent {
    return BILLING_OPTIONS[this.billingOption] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(BILLING_PERIOD_FIELD_MAP);
  }
}

function newBillingPeriod(data: object): BillingPeriod {
  return new BillingPeriod().fromData(data);
}

@Injectable()
export class BillingPeriodService extends BaseService<BillingPeriod> {

  protected baseUrl = 'billingperiod';

  protected newModel = (data: object) => newBillingPeriod(data);

  protected getFieldMap() {
    return super.getFieldMap(BILLING_PERIOD_FIELD_MAP);
  }

  validateBillingOption(model: BillingPeriod, validateFields: string[]): Observable<BillingPeriod> {
    return this.http.post(`${this.baseUrl}/${model.id}/validate/`, model.toData(validateFields), this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => this.newModel(rs.data)));
  }
}
