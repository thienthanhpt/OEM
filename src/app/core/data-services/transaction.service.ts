import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { Observable } from 'rxjs';

import {
  Attachment, BaseModel, BaseService, DateMoment, Order, ContractOrigin,
  ORDER_FIELD_MAP, CONTRACT_ORIGIN_OPTIONS
} from './index';


export enum TransactionStatus {
  Pending = 'pending', Submitted = 'submitted', Approved = 'done', Rejected = 'reject', Cancellation = 'cancel'
}

export const TRANSACTION_STATUS_OPTIONS: { [key: string]: string } = {
  [TransactionStatus.Pending]: 'Pending',
  [TransactionStatus.Submitted]: 'Submitted',
  [TransactionStatus.Approved]: 'Approved',
  [TransactionStatus.Rejected]: 'Rejected',
  [TransactionStatus.Cancellation]: 'Cancelled',
};

export enum OrderOrigin {
  B2B = 'b2b', B2C = 'b2c'
}

export enum OrderPlatform {
  ConsumerPortal = 'consumer-portal',
  MobileApp = 'mobile-app', AndroidApp = 'android' // This is only the difference of Mobile platform, we display Mobile App only
}

export const ORDER_PALTFORM_OPTIONS: { [key: string]: string }  = {
  [OrderPlatform.ConsumerPortal]: 'Sign Up Portal',
  [OrderPlatform.MobileApp]: 'Mobile App',
  [OrderPlatform.AndroidApp]: 'Mobile App'
};

// In release 1.5.1, we temporarily use Consent.Satified only
// export enum Consent {
//   VeryUnSatified = 0,
//   Unsatisfied = 1,
//   Normal = 2,
//   Satified = 3,
//   VerySatified = 4
// }

// export const CONSENT_OPTIONS: { [key: string]: string } = {
  // [Consent.VeryUnSatified]: 'Very unsatisfied',
  // [Consent.Unsatisfied]: 'Unsatisfied',
  // [Consent.Normal]: 'Normal',
  // [Consent.Satified]: 'Satisfied',
  // [Consent.VerySatified]: 'Very Satisfied',
// }

const TRANSACTION_FIELD_MAP = {
  type: 'transaction_type', transactionId: 'transactionid', previousTransactionId: 'previoustransactionid', orderData: 'order',
  msslNo: 'mssl_no', postalCode: 'postalcode', expiredDate: 'expiry_date', approvedDate: 'approved_date',
  rejectedDate: 'rejected_date', cancelledDate: 'cancelled_date', status: 'status', rejectedReason: 'rejected_reason',
  contractCommissionedDate: 'commission_date', meterId: 'meter_id',
  contractEffectiveDate: 'effectivedate', contractTermEndDate: 'termenddate', contractTerm: 'term', orderOrigin: 'origin',
  serviceAddress: 'serviceaddress', documentsData: 'documents', orderPlatform: 'platform', consent: 'consent',
  billingOption: 'billing_option', contractOrigin: 'contract_origin',
  // TODO: These fields is being used for search only
  orderId: 'order_id', customerName: 'customer__customer', customerIdentification: 'customer__uen',
  consumerServiceAddress: 'consumer__service_address', consumerPostal: 'consumer__postal', consumerServiceId: 'consumer__serviceid',
  contractExpectedStartDate: 'contract__contract_expected_start_date', promotionCode: 'referral_code', customerMobile: 'customer__mobileno',
  customerEmail: 'customer__email_address', consumerBillingAccount: 'order__orderitem__billingaccount',
  customerPhoneNumber: 'customer__mobileno', productName: 'contract__pricing_name',
  productRate: 'order_orderitem__product_rate', productPromotion: 'order_orderitem__product_promotion', contractTerms: 'contract__term',
  contractSignedDate: 'contract__signed_date', contractAutoDeduct: 'contract__is_auto_deduct', isSentPDDA: 'is_sent_pDDA',
  billingOptions: '',
};

export class Transaction extends BaseModel {

  type: string = null;
  transactionId: string = null;
  previousTransactionId: string = null;
  order: Order = null;
  msslNo: string = null;
  postalCode: string = null;
  status: TransactionStatus = null;
  rejectedReason: string = null;
  expiredDate = new DateMoment();
  approvedDate = new DateMoment();
  rejectedDate = new DateMoment();
  cancelledDate = new DateMoment();
  contractCommissionedDate = new DateMoment();
  contractEffectiveDate = new DateMoment();
  contractExpectedStartDate = new DateMoment();
  meterId: string = null;
  contractTermEndDate = new DateMoment();
  contractTerm: number = null;
  orderOrigin = '';
  serviceAddress: string = null;
  orderDocuments: Attachment[] = null;
  consent = false;
  orderPlatform: OrderPlatform = null;
  contractOrigin: ContractOrigin = null;
  billingOption = '';

  // Use for validation
  isValidating = false;
  warning = false;
  error = false;
  reasonMessage = '';
  isMsslNumberValidating = false;
  isMsslNumberValid = false;
  isMsslNumberDuplicated = false;
  isMeterIdValidating = false;
  isMeterIdValid = false;
  isPromoCodeValidating = false;
  isPromoCodeValid = false;
  isMeterIdDuplicated = false;
  billingBC = '';

  set documentsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.orderDocuments = _.map(dataArray, data => new Attachment().fromData(data));
    }
  }

  set orderData(data: object) {
    if (!_.isEmpty(data)) {
      this.order = new Order().fromData(data);
      this.order.transaction = this;
    }
  }

  get orderPlatformDisplay() {
    return ORDER_PALTFORM_OPTIONS[this.orderPlatform] || null;
  }

  // get consentDisplay() {
  //   return CONSENT_OPTIONS[this.consent] || null;
  // }

  get contractOriginDisplay() {
    return CONTRACT_ORIGIN_OPTIONS[this.contractOrigin] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(TRANSACTION_FIELD_MAP);
  }
}

function newTransaction(data: object) {
  return new Transaction().fromData(data);
}

@Injectable()
export class TransactionService extends BaseService<Transaction> {

  protected baseUrl = 'transactions';

  protected httpConfigs = {
    isStarhubUrl: true
  };

  protected newModel = (data: object) => newTransaction(data);

  validate(id: number, data = {}): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/validate/`, data, this.getHttpConfigs());
  }

  verifyPromotionCode(code: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/referral-code/verify/`, { referral_code: code }, this.getHttpConfigs());
  }

  updatePricingPlan(planName: string, orderIdList: number[]): Observable<any> {
    const data = {
      order_ids: orderIdList,
      pricing_name: planName
    };
    return this.http.post(`${this.baseUrl}/change_price_plan/`, data, this.getHttpConfigs());
  }

  delete(id: number): Observable<any> {
    const data = { origin: 'b2c' };
    return this.http.post(`${this.baseUrl}/${id}/delete/`, data, this.getHttpConfigs());
  }

  protected getFieldMap() {
    return super.getFieldMap(TRANSACTION_FIELD_MAP);
  }

  protected getSortFieldMap() {
    return super.getSortFieldMap({
      order: ORDER_FIELD_MAP,
    });
  }
}
