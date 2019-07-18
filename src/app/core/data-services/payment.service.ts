import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest } from '@angular/common/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { BaseModel, BaseService, DateMoment, ErrorResponse, SuccessResponse } from './base.service';
import { Attachment } from './attachment.service';


export enum PaymentStatus {
  Pending = 'pending', Success = 'success', Failed = 'failed', New = 'new', Unvalidated = 'nvalidated', Valid = 'valid',
  Invalid = 'invalid', Validated = 'validated'
}


export const PAYMENT_STATUS_OPTIONS: { [key: string]: string } = {
  [PaymentStatus.Pending]: 'Pending',
  [PaymentStatus.Success]: 'Success',
  [PaymentStatus.Failed]: 'Failed',
  [PaymentStatus.New]: 'New',
  [PaymentStatus.Unvalidated]: 'Unvalidated',
  [PaymentStatus.Valid]: 'Valid',
  [PaymentStatus.Invalid]: 'Invalid',
  [PaymentStatus.Validated]: 'Validated',
};

export const PAYMENT_UPLOAD_FIELD_MAP = {
  fileName: 'file_name', fileContent: 'file_content', receivedDate: 'received_date', isStored: 'is_stored', fileFormat: 'file_format'
};

export class PaymentDataRequest extends BaseModel {
  fileName: string = null;
  fileContent: string = null;
  receivedDate = new DateMoment();
  isStored: boolean = null;
  fileFormat: string = null;

  protected getFieldMap() {
    return super.getFieldMap(PAYMENT_UPLOAD_FIELD_MAP);
  }
}

export const PAYMENT_FIELD_MAP = {
  id: 'id', contractId: 'contract', depositAmount: 'deposit_amount', amount: 'payment_amount', paymentDate: 'payment_date',
  ref: 'payment_ref', type: 'payment_type', mode: 'paymentmode', statementRecord: 'statement_record', status: 'status',
  createdDate: 'created_date', lastModifiedDate: 'last_modified_date', transactionId: 'axs_payment_ref', msslNo: 'axs_payment_mssl',
  invoiceNo: 'invoice_no', paymentReceived: 'payment_received', paymentMode: 'payment_mode', origin: 'origin', customerId: 'customer_id',
};

export class Payment extends BaseModel {

  id: number = null;
  contractId: number = null;
  depositAmount: number = null;
  amount: number = null;
  paymentDate = new DateMoment();
  ref: string = null;
  type: string = null;
  mode: string = null;
  statementRecord: string = null;
  transactionId: string = null;
  msslNo: string = null;
  status: PaymentStatus = null;
  lastModifiedDate = new DateMoment();

  invoiceNo: number = null;
  paymentReceived: number = null;
  receivedDate = new DateMoment();
  paymentMode: string = null;
  origin: string = null;

  protected getFieldMap() {
    return super.getFieldMap(PAYMENT_FIELD_MAP);
  }

  get statusDisplay() {
    return PAYMENT_STATUS_OPTIONS[this.status] || null;
  }
}

function newPayment(data: object): Payment {
  return new Payment().fromData(data);
}

@Injectable()
export class PaymentService extends BaseService<Payment> {

  protected baseUrl = 'payments';

  protected newModel = (data: object) => newPayment(data);

  protected getFieldMap() {
    return super.getFieldMap(PAYMENT_FIELD_MAP);
  }

  uploadSuccess(rs: SuccessResponse): Payment {
    return new Payment().fromData(rs.data);
  }

  uploadAndCreate(paymentDataRequest: PaymentDataRequest): Observable<HttpEvent<SuccessResponse>> {
    return this.http.request(new HttpRequest('POST', `${this.baseUrl}/usage_data/`, paymentDataRequest.toData(),
      _.assign({ reportProgress: true }, this.getHttpConfigs())
    ));
  }

  uploadAndUpdate(id: number, paymentDataRequest: PaymentDataRequest): Observable<HttpEvent<SuccessResponse>> {
    return this.http.request(new HttpRequest('PUT', `${this.baseUrl}/usage_data/${id}/`, paymentDataRequest.toData(),
      _.assign({ reportProgress: true }, this.getHttpConfigs())
    ));
  }

  approvePaymentStatus = (documentId: number): Observable<SuccessResponse | ErrorResponse> => {
    return this.http.put<SuccessResponse | ErrorResponse>(`${this.baseUrl}/usage_data/${documentId}/force/`, {});
  }
}

export const PAYMENT_FILES_FIELD_MAP = {
  id: 'id', fileDate: 'date', filePath: 'file_path', fileName: 'filename', reason: 'reason', status: 'status', createdDate: 'created_date',
  lastModifiedDate: 'last_modified_date', documentData: 'document'
};

export class PaymentFile extends BaseModel {

  id: number = null;
  filePath: string = null;
  fileName: string = null;
  reason: string = null;
  status: string = null;
  fileDate = new DateMoment();
  lastModifiedDate = new DateMoment();
  document: Attachment = null;

  set documentData(data: object) {
    if (!_.isEmpty(data)) {
      this.document = new Attachment().fromData(data);
    }
  }

  get statusDisplay() {
    return PAYMENT_STATUS_OPTIONS[this.status] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(PAYMENT_FILES_FIELD_MAP);
  }
}

function newPaymentFile(data: object): PaymentFile {
  return new PaymentFile().fromData(data);
}

@Injectable()
export class PaymentFileService extends BaseService<PaymentFile> {

  protected baseUrl = 'payment_reading';

  protected newModel = (data: object) => newPaymentFile(data);

  protected getFieldMap() {
    return super.getFieldMap(PAYMENT_FILES_FIELD_MAP);
  }
}
