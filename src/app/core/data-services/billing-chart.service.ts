import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';

import { BaseModel, DateMoment, SuccessResponse } from './base.service';

export const CONSUMER_EXPECTED_DETAIL_FIELD_MAP = {
  monthValue: 'mth', billingCycleCount: 'bc_months_count', billingCycle: 'bc'
};

export const CONSUMER_EXPECTED_FIELD_MAP = {
  expectData: 'expect', effectiveData: 'effective'
};

export const BILLING_ISSUED_FIELD_MAP = {
  name: 'bills', value: 'count'
};

export const BILLING_CHART_FIELD_MAP = {
  expectedConsumersData: 'expected_consumers', billIssuedData: 'bills_issued',
  lastThreeMonths: 'last_three_months', currentTime: 'current_time'
};

export class ConsumerExpectedDetail extends BaseModel {
  month = new DateMoment();
  monthNumber = 0;
  billingCycleCount = 0;
  billingCycle = '';

  set monthValue(value: number) {
    if (value) {
      this.monthNumber = value;
      this.month.moment = moment().month(value - 1);
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(CONSUMER_EXPECTED_DETAIL_FIELD_MAP);
  }
}

export class ConsumerExpected extends BaseModel {
  billName: string = null;
  expectList: ConsumerExpectedDetail[] = [];
  effectiveList: ConsumerExpectedDetail[] = [];

  set expectData(dataArray: object[]) {
    this.expectList = _.map(dataArray, data => new ConsumerExpectedDetail().fromData(data));
    if (this.billName === null && !_.isEmpty(this.expectList)) {
      this.billName = this.expectList[0].billingCycle;
    }
  }

  set effectiveData(dataArray: object[]) {
    this.effectiveList = _.map(dataArray, data => new ConsumerExpectedDetail().fromData(data));
    if (this.billName === null && !_.isEmpty(this.effectiveList)) {
      this.billName = this.effectiveList[0].billingCycle;
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(CONSUMER_EXPECTED_FIELD_MAP);
  }
}


export class BillingIssued extends BaseModel {
  name = '';
  value = 0;

  protected getFieldMap() {
    return super.getFieldMap(BILLING_ISSUED_FIELD_MAP);
  }
}

export class BillingChart extends BaseModel {
  expectedConsumerList: ConsumerExpected[] = [];
  billIssuedList: BillingIssued[] = [];

  lastThreeMonths = new DateMoment();
  currentTime = new DateMoment();

  set billIssuedData(dataArray: object[]) {
    this.billIssuedList = _.map(dataArray, data => new BillingIssued().fromData(data));
  }

  set expectedConsumersData(dataArray: object[]) {
    this.expectedConsumerList = _.map(dataArray, data => new ConsumerExpected().fromData(data));
  }

  protected getFieldMap() {
    return super.getFieldMap(BILLING_CHART_FIELD_MAP);
  }
}


@Injectable()
export class BillingChartService {

  protected baseUrl = 'consumer/bills';

  protected newModel = (data: object) => new BillingChart().fromData(data);

  constructor(
    private http: HttpClient
  ) { }

  fetch(): Observable<BillingChart>  {
    return this.http.get(`${this.baseUrl}/`)
      .pipe(map((rs: SuccessResponse) => this.newModel(rs.data)));
  }
}
