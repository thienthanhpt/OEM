import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as _ from 'lodash';

import {
  Attachment, BaseModel, BaseService, ConsumerMeter, Contract, ContractStatus, Customer, DateMoment, DiscountType, Invoice, Retailer,
  SuccessResponse, UsageDataMeter,
  CUSTOMER_FIELD_MAP, DISCOUNT_TYPE_OPTIONS
} from './index';


export enum ConsumerChargeType {
  Additional = 'additional_charge', Waive = 'waive', USave = 'u_save',
}

export const CONSUMER_CHARGE_TYPE_OPTIONS: { [key: string]: string } = {
  [ConsumerChargeType.Additional]: 'Additional Charge',
  [ConsumerChargeType.Waive]: 'Waive Charge',
  [ConsumerChargeType.USave]: 'U-save Charge',
};

export const CONSUMER_CHARGE_TEMPLATE_FIELD_MAP = {
  name: 'name', displayName: 'display_name', chargeType: 'charge_template_type'
};

export class ConsumerChargeTemplate extends BaseModel {

  name: string = null;
  displayName: string = null;
  chargeType: ConsumerChargeType = null;

  get chargeTypeDisplay() {
    return CONSUMER_CHARGE_TYPE_OPTIONS[this.chargeType] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(CONSUMER_CHARGE_TEMPLATE_FIELD_MAP);
  }
}

export const CONSUMER_CHARGE_FIELD_MAP = {
  amount: 'amount', templateData: 'template', templateId: 'template_id', expectedBillingDate: 'expected_billing_date',
  consumerId: 'consumer_id', calculationType: 'calculation_type'
};

const CONSUMER_CHARGE_IGNORE_FIELDS = [ 'expectedBillingDate' ];

export class ConsumerCharge extends BaseModel {

  amount: number = null;
  template: ConsumerChargeTemplate = null;
  calculationType: DiscountType = DiscountType.Fixed;
  consumer: Consumer = null;
  invoice: Invoice = null;
  expectedBillingDate = new DateMoment();

  get templateId() {
    return _.get(this.template, 'id');
  }

  get calculationTypeDisplay() {
    return DISCOUNT_TYPE_OPTIONS[this.calculationType] || null;
  }

  set consumerId(id: number) {
    if (id) {
      if (!this.consumer) {
        this.consumer = new Consumer();
      }
      this.consumer.id = id;
    }
  }

  set invoiceId(id: number) {
    if (id) {
      if (!this.consumer) {
        this.invoice = new Invoice();
      }
      this.invoice.id = id;
    }
  }

  set templateData(data: object) {
    if (!_.isEmpty(data)) {
      this.template = new ConsumerChargeTemplate().fromData(data);
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(CONSUMER_CHARGE_FIELD_MAP);
  }

  protected getToDataIgnoredFields() {
    return super.getToDataIgnoredFields(CONSUMER_CHARGE_IGNORE_FIELDS);
  }
}

export enum VoltageType {
  LowTension = 1, HighTensionSmall = 2, HighTensionLarge = 3, ExtraHighTension = 4,
}

export const VOLTAGE_TYPE_OPTIONS: { [key: number]: string } = {
  [VoltageType.LowTension]: 'Low Tension (LT)',
  [VoltageType.HighTensionSmall]: 'High Tension Small (HTS)',
  [VoltageType.HighTensionLarge]: 'High Tension Large (HTL)',
  [VoltageType.ExtraHighTension]: 'Extra High Tension (EHT)',
};

export enum AccountType {
  Standard = 'standard', Landlord = 'landlord', Tenant = 'tenant',
}

export const ACCOUNT_TYPE_OPTIONS: { [key: string]: string } = {
  [AccountType.Standard]: 'Standard',
  [AccountType.Landlord]: 'Landlord',
  [AccountType.Tenant]: 'Tenant',
};

export enum ConsumerStatus {
  Inactive = 'inactive', Pending = 'pending', TransferredIn = 'transferred in', Deactivated = 'deactivated',
  Terminated = 'terminated', Relocated = 'relocated', New = 'new'
}

export const CONSUMER_STATUS_OPTIONS: { [key: string]: string } = {
  [ConsumerStatus.Inactive]: 'Inactive',
  [ConsumerStatus.Pending]: 'Pending',
  [ConsumerStatus.TransferredIn]: 'Transferred In',
  [ConsumerStatus.Deactivated]: 'Deactivated',
  [ConsumerStatus.Terminated]: 'Terminated',
  [ConsumerStatus.Relocated]: 'Relocated',
  [ConsumerStatus.New]: 'New',
};

export const CONSUMER_DEACTIVATE_REASONS = [
  'Switch to Competitor',
];

export const CONSUMER_FIELD_MAP = {
  id: 'coid', name: 'consumer', customerData: 'customer', customerId: 'cuid', voltageType: 'v_type',
  consumerMetersData: 'meters', invoicesData: 'invoices', contractData: 'contract',
  lastRetailerBillDocumentsData: 'retailer_bill_docs', lastRetailerBillDocumentIds: 'retailer_bill_doc_ids',
  premiseAddress: 'address', premisePostalCode: 'postal', accountType: 'a_type', msslNo: 'mssl_no',
  ebsNo: 'ebs_no', landlordAccount: 'land_acc', temporaryDisconnected: 'temp_dis', remarks: 'remark',
  status: 'status', reason: 'reason', effectiveDate: 'effectivedate',
  shBillingAccount: 'sh_billing_acc', retailerData: 'retailer', retailerId: 'retailer_id', isUnAssigned: 'unassigned',
  contractAssignedStatus: 'assigned_contract_status', meterId: 'meter_id', documentsData: 'documents',
    meterReadingsData: 'meter_readings', referralCode: 'referral_code', contractId: 'crid', dwellingType: 'dwelling_type'
};

export class Consumer extends BaseModel {

  name: string = null;
  customer: Customer = null;
  voltageType: VoltageType = null;
  consumerMeters: ConsumerMeter[] = [];
  meterReadings: UsageDataMeter[] = [];
  invoices: Invoice[] = [];
  activeContract: Contract = null;
  unpaidCharges: ConsumerCharge[] = [];
  lastRetailerBillDocuments: Attachment[] = [];
  premiseAddress: string = null;
  premisePostalCode: string = null;
  accountType: AccountType = null;
  msslNo: string = null;
  ebsNo: string = null;
  landlordAccount: string = null;
  temporaryDisconnected = false;
  remarks: string = null;
  status: ConsumerStatus = null;
  reason: string = null;
  effectiveDate = new DateMoment();
  shBillingAccount: string = null;
  retailer: Retailer = null;
  meterId: string = null; //Todo: this meter id is used temporarily for release 1.4, need to remove in next release
  isUnAssigned = false;
  contractAssignedStatus: ContractStatus = null;
  referralCode: string = null;
  documents: Attachment[] = null;
  contract: Contract = null;
  contractId: number = null;
  dwellingType = '';
  customerId: number = null;

  set contractData(data: object) {
    if (!_.isEmpty(data)) {
      this.contract = new Contract().fromData(data);
    }
  }

  set documentsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.documents = _.map(dataArray, data => new Attachment().fromData(data));
    }
  }

  set customerData(data: object) {
    if (!_.isEmpty(data)) {
      this.customer = new Customer().fromData(data);
    }
  }

  set retailerData(data: object) {
    if (!_.isEmpty(data)) {
      this.retailer = new Retailer().fromData(data);
    }
  }
  get retailerId() {
    return _.get(this.retailer, 'id');
  }

  set consumerMetersData(dataArray: object[]) {
    this.consumerMeters = _.map(dataArray, data => {
      const consumerMeter = new ConsumerMeter().fromData(data);
      consumerMeter.consumer = this;
      return consumerMeter;
    });
  }

  // set meterReadingsData(dataArray: object[]) {
  //   this.usageDataMeters = _.map(dataArray, data => new usageDataMeters().fromData(data));
  // }

  set invoicesData(dataArray: object[]) {
    this.invoices = _.map(dataArray, data => {
      const invoice = new Invoice().fromData(data);
      invoice.consumer = this;
      return invoice;
    });
  }

  get lastRetailerBillDocumentIds() {
    return _.map(this.lastRetailerBillDocuments, 'id');
  }
  set lastRetailerBillDocumentsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.lastRetailerBillDocuments = _.map(dataArray, data => new Attachment().fromData(data));
    }
  }

  get voltageTypeDisplay() {
    return VOLTAGE_TYPE_OPTIONS[this.voltageType] || null;
  }

  get accountTypeDisplay() {
    return ACCOUNT_TYPE_OPTIONS[this.accountType] || null;
  }

  get statusDisplay() {
    return CONSUMER_STATUS_OPTIONS[this.status] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(CONSUMER_FIELD_MAP);
  }
}

function newConsumer(data: object) {
  return new Consumer().fromData(data);
}

@Injectable()
export class ConsumerService extends BaseService<Consumer> {

  protected baseUrl = 'consumer';

  protected newModel = (data: object) => newConsumer(data);

  fetchTemplatesByChargeType(type: ConsumerChargeType): Observable<{ items: ConsumerChargeTemplate[] }> {
    return this.http.get(`${this.baseUrl}/charge/template/info/${type}/`)
      .pipe(map((rs: SuccessResponse) => ({ items: _.map(rs.data, row => new ConsumerChargeTemplate().fromData(row)) })));
  }

  fetchAllCharges(consumerId: number): Observable<{ items: ConsumerCharge[] }> {
    return this.http.get(`${this.baseUrl}/${consumerId}/charge/`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => ({ items: _.map(rs.data, row => new ConsumerCharge().fromData(row)) })));
  }

  createCharge(charge: ConsumerCharge): Observable<ConsumerCharge> {
    return this.http.post(`${this.baseUrl}/${charge.consumer.id}/charge/`, charge.toData(), this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new ConsumerCharge().fromData(rs.data)));
  }

  updateCharge(charge: ConsumerCharge): Observable<ConsumerCharge> {
    return this.http.put(`${this.baseUrl}/${charge.consumer.id}/charge/${charge.id}/`, charge.toData(), this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new ConsumerCharge().fromData(rs.data)));
  }

  removeCharge(charge: ConsumerCharge): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(`${this.baseUrl}/${charge.consumer.id}/charge/${charge.id}/delete/`, this.getHttpConfigs());
  }

  searchConsumer(charge: ConsumerCharge): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(`${this.baseUrl}/${charge.consumer.id}/charge/${charge.id}/delete/`, this.getHttpConfigs());
  }

  protected getFieldMap() {
    return super.getFieldMap(CONSUMER_FIELD_MAP);
  }

  protected getSortFieldMap() {
    return super.getSortFieldMap({
      customer: CUSTOMER_FIELD_MAP,
    });
  }
}
