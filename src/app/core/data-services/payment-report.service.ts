import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, DateMoment, SuccessResponse } from './base.service';
import { Attachment } from './attachment.service';
import { map } from 'rxjs/operators';

const PAYMENT_REPORT_FIELD_MAP = {
  documentData: 'attachment',
  name: 'display_name', description: 'description', fileType: 'file_type', status: 'status',
  fromDate: 'date_from', toDate: 'date_to', isStored: 'is_store', isForced: 'is_force', getAll: 'get_all', paymentOrigin: 'origin'
};

export class PaymentReport extends BaseModel {
  document: Attachment = null;
  name: string = null;
  server: string = null;
  fileType: string = null;

  fromDate = new DateMoment();
  toDate = new DateMoment();
  isStored = true;
  isForced = false;
  getAll = false;

  paymentOrigins: string[] = [];

  set documentData(data: object) {
    if (!_.isEmpty(data)) {
      this.document = new Attachment().fromData(data);
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(PAYMENT_REPORT_FIELD_MAP);
  }
}

function newPaymentReport(data: object) {
  return new PaymentReport().fromData(data);
}

@Injectable()
export class PaymentReportService extends BaseService<PaymentReport> {
  protected baseUrl = 'payment/report';

  protected newModel = (data: object) => newPaymentReport(data);

  protected getFieldMap() {
    return super.getFieldMap(PAYMENT_REPORT_FIELD_MAP);
  }

  fetchAllPaymentOrigin() {
    return this.http.get('payments/origin/', this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => rs.data));
  }

  create(model: PaymentReport) {
    const data = model.toData();
    data['origin'] = model.paymentOrigins;
    return this.http.post(`${this.baseUrl}/`, data, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => this.newModel(rs.data)));
  }
}
