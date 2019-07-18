import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, User, Consumer, Customer, Attachment, DateMoment, CONSUMER_FIELD_MAP, CUSTOMER_FIELD_MAP } from './index';


export enum ConsumerMeterType {
  AMI = 'ami', SRLP = 'srlp',
}

export const CONSUMER_METER_TYPE_OPTIONS: { [key: string]: string } = {
  [ConsumerMeterType.AMI]: 'AMI',
  [ConsumerMeterType.SRLP]: 'SRLP',
};

export enum MeterActiveStatus {
  Active = 'active', Inactive = 'inactive',
}

export const METER_ACTIVE_STATUS_OPTIONS: { [key: string]: string } = {
  [MeterActiveStatus.Active]: 'Active',
  [MeterActiveStatus.Inactive]: 'Inactive',
};

export const CONSUMER_METER_FIELD_MAP = {
  meterId: 'meter_id', type: 'meter_type', consumerData: 'consumer', consumerId: 'coid', userData: 'user',
  status: 'status', name: 'file_name', uploadDate: 'upload_date',
  usageDate: 'usage_date', documentsData: 'documents', startUsingDate: 'start_using_date', endUsingDate: 'end_using_date',
  cumulativeUsageData: 'cumulative_usage_data', hasAdjustedData: 'has_adjusted_data', customerData: 'customer', ids: 'ids'
};

export class ConsumerMeter extends BaseModel {

  meterId: string = null;
  name: string = null;
  status: MeterActiveStatus = null;
  documents: Attachment[] = null;
  uploadDate = new DateMoment();
  usageDate = new DateMoment();
  startUsingDate = new DateMoment();
  endUsingDate = new DateMoment();
  type: ConsumerMeterType = null;
  consumer: Consumer = null;
  user: User = null;
  customer: Customer = null;

  get typeDisplay() {
    return CONSUMER_METER_TYPE_OPTIONS[this.type] || null;
  }

  get statusDisplay() {
    return METER_ACTIVE_STATUS_OPTIONS[this.status] || null;
  }

  set userData(data: object) {
    if (!_.isEmpty(data)) {
      this.user = new User().fromData(data);
    }
  }
  set customerData(data: object) {
    if (!_.isEmpty(data)) {
      this.customer = new Customer().fromData(data);
    }
  }


  set documentsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.documents = _.map(dataArray, data => new Attachment().fromData(data));
    }
  }

  set consumerData(data: object) {
    if (!_.isEmpty(data)) {
      this.consumer = new Consumer().fromData(data);
    }
  }
  get consumerId() {
    return _.get(this.consumer, 'id');
  }

  protected getFieldMap() {
    return super.getFieldMap(CONSUMER_METER_FIELD_MAP);
  }

}

function newConsumerMeter(data: object): ConsumerMeter {
  return new ConsumerMeter().fromData(data);
}



@Injectable()
export class ConsumerMeterService extends BaseService<ConsumerMeter> {

  protected baseUrl = 'meter_service';

  protected newModel = (data: object) => newConsumerMeter(data);

  protected getFieldMap() {
    return super.getFieldMap(CONSUMER_METER_FIELD_MAP);
  }

  protected getSortFieldMap() {
    return super.getSortFieldMap({
      'consumer': CONSUMER_FIELD_MAP,
      'customer': CUSTOMER_FIELD_MAP,
    });
  }

}
