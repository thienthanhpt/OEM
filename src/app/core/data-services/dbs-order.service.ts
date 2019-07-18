import { Injectable } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
import { HttpEvent } from '@angular/common/http/src/response';

import { Observable } from 'rxjs';
import * as _ from 'lodash';

import {
  Attachment, BaseModel, BaseService, ErrorResponse, SuccessResponse,
  UsageDataStatus, USAGE_DATA_STATUS_OPTIONS, User, TimeMoment, USER_FIELD_MAP
} from './index';

const DBS_ORDER_UPLOAD_FIELD_MAP = {
  fileName: 'file_name', fileContent: 'file_content',
};

class DbsOrderUpload extends BaseModel {

  fileName: string = null;
  fileContent: string = null;

  protected getFieldMap() {
    return super.getFieldMap(DBS_ORDER_UPLOAD_FIELD_MAP);
  }
}

const DBS_ORDER_FIELD_MAP = {
  fileName: 'file_name', fileType: 'file_type', numberOrder: 'number_orders',
  reason: 'reason', status: 'status', createdTime: 'created_date', updatedTime: 'last_modified_date',
  documentData: 'document', userData: 'user',
};

export class DbsOrder extends BaseModel {

  fileName: string = null;
  fileType: string = null;
  numberOrder: number = null;
  reason: string = null;

  document: Attachment = null;
  user: User = null;
  status: UsageDataStatus = null;

  createdTime = new TimeMoment();
  updatedTime = new TimeMoment();

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

  protected getFieldMap() {
    return super.getFieldMap(DBS_ORDER_FIELD_MAP);
  }
}

function newDbsOrder(data: object) {
  return new DbsOrder().fromData(data);
}

@Injectable()
export class DbsOrderService extends BaseService<DbsOrder> {
  protected baseUrl = 'dbsorderfile';

  protected newModel = (data: object) => newDbsOrder(data);

  protected getFieldMap() {
    return super.getFieldMap(DBS_ORDER_FIELD_MAP);
  }

  protected getSortFieldMap() {
    return super.getSortFieldMap({
      user: USER_FIELD_MAP
    });
  }

  upload(content: string, fileName: string): Observable<HttpEvent<SuccessResponse>> {
    const dbsOderUpload = new DbsOrderUpload();
    dbsOderUpload.fileContent = content;
    dbsOderUpload.fileName = fileName;

    return this.http.request(new HttpRequest('POST', `${this.baseUrl}/`, dbsOderUpload.toData(),
      _.assign({ reportProgress: true }, this.getHttpConfigs())
    ));
  }

  force(listID: number[]): Observable<SuccessResponse | ErrorResponse> {
    return this.http.post<SuccessResponse | ErrorResponse>(`${this.baseUrl}/force-validate/`, {
      list_ids: listID
    });
  }

  uploadSuccess(rs: SuccessResponse): DbsOrder {
    return this.newModel(rs.data);
  }
}
