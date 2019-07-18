import { Injectable } from '@angular/core';
import { HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import * as _ from 'lodash';

import {
  BaseModel, BaseService, DateMoment, SuccessResponse, ErrorResponse, Attachment, User, ConsumerMeter,
  CONSUMER_METER_FIELD_MAP, ATTACHMENT_FIELD_MAP, USER_FIELD_MAP
} from './index';
import { HttpEvent } from '@angular/common/http/src/response';


const USAGE_DATA_REQUEST_FIELD_MAP = {
  fileName: 'file_name', fileContent: 'file_content', billingDate: 'billing_date', isStored: 'is_stored',
};

class UsageDataRequest extends BaseModel {

  fileName: string = null;
  fileContent: string = null;
  billingDate = new DateMoment();
  isStored: boolean = null;

  protected getFieldMap() {
    return super.getFieldMap(USAGE_DATA_REQUEST_FIELD_MAP);
  }
}

export enum UsageDataStatus {
  Pending = 'pending', Success = 'success', Failed = 'failed', New = 'new', Unvalidated = 'nvalidated', Valid = 'valid',
  Invalid = 'invalid', Validated = 'validated'
}

export const USAGE_DATA_STATUS_OPTIONS: { [key: string]: string } = {
  [UsageDataStatus.Pending]: 'Pending',
  [UsageDataStatus.Success]: 'Success',
  [UsageDataStatus.Failed]: 'Failed',
  [UsageDataStatus.New]: 'New',
  [UsageDataStatus.Unvalidated]: 'Unvalidated',
  [UsageDataStatus.Valid]: 'Valid',
  [UsageDataStatus.Invalid]: 'Invalid',
  [UsageDataStatus.Validated]: 'Validated',
};

const USAGE_DATA_FIELD_MAP = {
  documentData: 'document', userData: 'user', status: 'status', billingDate: 'billing_date',
  metersData: 'meters', validateFailReason: 'reason'
};

export class UsageData extends BaseModel {

  document: Attachment = null;
  user: User = null;
  status: UsageDataStatus = null;
  billingDate = new DateMoment();
  meters: ConsumerMeter[] = [];
  validateFailReason = '';

  set metersData(dataArray: object[]) {
    this.meters = _.map(dataArray, data => new ConsumerMeter().fromData(data));
  }

  set documentData(data: object) {
    if (!_.isEmpty(data)) {
      this.document = new Attachment().fromData(data);
    }
  }

  set userData(data: object) {
    if (!_.isEmpty(data)) {
      this.user = new User().fromData(data);
    }
  }

  get statusDisplay() {
    return USAGE_DATA_STATUS_OPTIONS[this.status] || null;
  }

  get validateFailReasonArray() {
    return this.validateFailReason.split(',');
  }

  protected getFieldMap() {
    return super.getFieldMap(USAGE_DATA_FIELD_MAP);
  }

}

function newUsageData(data: object): UsageData {
  return new UsageData().fromData(data);
}

@Injectable()
export class UsageDataService extends BaseService<UsageData> {

  protected baseUrl = 'usage_data';

  protected newModel = (data: object) => newUsageData(data);

  protected getFieldMap() {
    return super.getFieldMap(USAGE_DATA_FIELD_MAP);
  }

  protected getSortFieldMap() {
    return super.getSortFieldMap({
      'meters': CONSUMER_METER_FIELD_MAP,
      'document': ATTACHMENT_FIELD_MAP,
      'user' : USER_FIELD_MAP
    });
  }

  uploadAndCreate(content: string, fileName: string, model: UsageData): Observable<HttpEvent<SuccessResponse>> {
    const usageDataRequest = new UsageDataRequest();
    usageDataRequest.fileContent = content;
    usageDataRequest.fileName = fileName;
    usageDataRequest.isStored = true;
    usageDataRequest.billingDate = model.billingDate;

    return this.http.request(new HttpRequest('POST', `${this.baseUrl}/`, usageDataRequest.toData(),
      _.assign({ reportProgress: true }, this.getHttpConfigs())
    ));
  }

  uploadAndUpdate(content: string, fileName: string, model: UsageData): Observable<HttpEvent<SuccessResponse>> {
    const usageDataRequest = new UsageDataRequest();
    usageDataRequest.fileContent = content;
    usageDataRequest.fileName = fileName;
    usageDataRequest.isStored = true;
    usageDataRequest.billingDate = model.billingDate;

    return this.http.request(new HttpRequest('PUT', `${this.baseUrl}/${model.id}/`, usageDataRequest.toData(),
      _.assign({ reportProgress: true }, this.getHttpConfigs())
    ));
  }

  uploadSuccess(rs: SuccessResponse): UsageData {
    return this.newModel(rs.data);
  }

  approveUsageDataStatus = (documentId: number): Observable<SuccessResponse | ErrorResponse> => {
    return this.http.put<SuccessResponse | ErrorResponse>(`${this.baseUrl}/${documentId}/force/`, {});
  }

}
