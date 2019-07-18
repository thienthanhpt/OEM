import { Injectable } from '@angular/core';

import {
  BaseModel, BaseService, DateMoment,
  UsageData, UsageDataStatus, ConsumerMeter,
  USAGE_DATA_STATUS_OPTIONS,
} from './index';

import * as _ from 'lodash';

export const USAGE_DATA_METER_FIELD_MAP = {
  status: 'status', documentData: 'document', billingDate: 'billing_date', meterData: 'meter', consumerId: 'coid',
  usageFromDate: 'usage_date_from', usageToDate: 'usage_date_to', usageDataFileData: 'usage_file',
};

export class UsageDataMeter extends BaseModel {

  status: UsageDataStatus = null;
  billingDate = new DateMoment();
  usageFromDate = new DateMoment();
  usageToDate = new DateMoment();
  usageDataFile: UsageData = null;
  meter: ConsumerMeter = null;

  protected getFieldMap() {
    return super.getFieldMap(USAGE_DATA_METER_FIELD_MAP);
  }

  set meterData(data: object) {
    if (!_.isEmpty(data)) {
      this.meter = new ConsumerMeter().fromData(data);
    }
  }

  set usageDataFileData(data: object) {
    if (!_.isEmpty(data)) {
      this.usageDataFile = new UsageData().fromData(data);
    }
  }

  get statusDisplay() {
    return USAGE_DATA_STATUS_OPTIONS[this.status] || null;
  }
}

function newUsageDataMeter(data: object): UsageDataMeter {
  return new UsageDataMeter().fromData(data);
}

@Injectable()
export class UsageDataMeterService extends BaseService<UsageDataMeter> {

  protected baseUrl = 'meter_usage';

  protected newModel = (data: object) => newUsageDataMeter(data);

  protected getFieldMap() {
    return super.getFieldMap(USAGE_DATA_METER_FIELD_MAP);
  }
}
