import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { BaseModel, BaseService, DateMoment, SuccessResponse } from './base.service';
import {
  Attachment, BillingPeriod, Consumer, Invoice, PaymentMode, Customer, Promotion, PricingPlanRate,
  Retailer, BillingOption,
  BILLING_PERIOD_FIELD_MAP, CONSUMER_FIELD_MAP, CUSTOMER_FIELD_MAP, PAYMENT_MODE_FIELD_MAP, SALE_TEAM_FIELD_MAP, SaleTeam,
  PRICING_PLAN_RATE_FIELD_MAP
} from './index';

export const DUNNING_PROCESS_FIELD_MAP = {
  contractId: 'contract_id', dunningStatus: 'is_active', startDate: 'start_date',
  nextRemindDate: 'next_reminder_date', actionOnStep: 'action'
};

export class DunningProcess extends BaseModel {

  contractId: number = null;
  dunningStatus = false;
  startDate = new DateMoment();
  nextRemindDate = new DateMoment();
  actionOnStep = '';

  protected getFieldMap() {
    return super.getFieldMap(DUNNING_PROCESS_FIELD_MAP);
  }
}

export enum ContractStatus {
  Submitted = 'submitted', Terminated = 'terminated', Deactivated = 'deactivated', Inactive = 'inactive', Active = 'active'
}

export const CONTRACT_STATUS_OPTIONS: { [key: string]: string } = {
  [ContractStatus.Submitted]: 'Submitted',
  [ContractStatus.Terminated]: 'Terminated',
  [ContractStatus.Deactivated]: 'Deactivated',
  [ContractStatus.Inactive]: 'Inactive',
  [ContractStatus.Active]: 'Active'
};

export enum ContractType {
  Dot = 'dot', Fix = 'fix', PoolPrice = 'pool price', LandlordTenant = 'landlord & tenant'
}

export const CONTRACT_TYPE_OPTIONS: { [key: string]: string } = {
  [ContractType.Dot]: 'DOT',
  [ContractType.Fix]: 'FIX',
  [ContractType.PoolPrice]: 'POOL PRICE',
  [ContractType.LandlordTenant]: 'LANDLORD & TENANT',
};

export enum ContractOrigin {
  Starhub = 'starhub',
  ConsumerPortal = 'consumer-portal',
  ChannelPartner = 'channel partner',
  SalesTeam = 'sales team',
  MobileApps = 'mobile-app',
  DBS = 'dbs',
  DbsMarket = 'dbs-market',
}

export const CONTRACT_ORIGIN_OPTIONS: { [key: string]: string } = {
  [ContractOrigin.Starhub]: 'STARHUB',
  [ContractOrigin.ConsumerPortal]: 'CONSUMER PORTAL',
  [ContractOrigin.MobileApps]: 'MOBILE APPS',
  [ContractOrigin.ChannelPartner]: 'CHANNEL PARTNER',
  [ContractOrigin.SalesTeam]: 'SALE TEAM',
  [ContractOrigin.DbsMarket]: 'DBS MARKET',
};

export const CONTRACT_FIELD_MAP = {
  id: 'crid', consumerData: 'consumer', consumerId: 'coid', customerId: 'cuid', pricingPlanName: 'pricing_name',
  pricingMarker: 'pricing_marker', discountPercentage: 'discount', latePaymentRate: 'late_payment_rate', offPeakRate: 'off_peak_rate',
  billingPeriodData: 'billing_period', billingPeriodId: 'idperiod', paymentModeData: 'payment_mode', paymentModeId: 'pmid',
  invoicesData: 'invoices', documentsData: 'documents', isHardCopyRequested: 'hardcopy_requested', termNumber: 'contract_term',
  contractDocumentData: 'contract_doc', contractDocumentId: 'contract_doc_id', paymentTermNumber: 'payment_term',
  threeMonthAverageConsumption: 'avg_cons', specialRequest: 'special_request', loadProfile: 'load_profile',
  isTlfIncluded: 'tlf_include', billingAddress: 'billing_address', billingPostalCode: 'billing_postal_code', status: 'contract_status',
  cleanEnergyPercentage: 'clean_energy', signedDate: 'contract_signed_date', commissionedDate: 'contract_commissioned_date',
  actualEndDate: 'actual_end_date', customerData: 'customer', depositAmount: 'deposit_amount', dwellingType: 'dwelling_type',
  promotionData: 'promotions', contractType: 'contract_type', orderDate: 'contract_order_date', plannedEndDate: 'contract_term_end_date',
  expectedStartDate: 'contract_expected_start_date', capacity: 'capacity', signUpRate: 'signup_rate', fromRetailer: 'retailer_from',
  toRetailer: 'retailer_to', isAfpIncluded: 'afp_include', isEmcIncluded: 'emc_include', isHeucIncluded: 'heuc_include',
  isMeucIncluded: 'meuc_include', isMssIncluded: 'mmc_include', isMssMdscIncluded: 'mss_mdsc_include',
  isMssOthersIncluded: 'mss_others_include', isPsoIncluded: 'pso_include', isUosIncluded: 'uos_include', billingOption: 'billing_option',
  contractOrigin: 'contract_origin', pricingPlanId: 'price_plan_id', legacyContract: 'legacy_contract_id', retailerData: 'retailer',
  retailerId: 'retailer_id', reason: 'reason', contractRef: 'contract_ref', dunningProcessData: 'dunning_information',
  serviceAgreementDocumentData: 'service_agreement', saleId: 'sale_id', serviceAgreementDocumentId: 'service_agreement_id',
  saleTeamData: 'sale_team', commissionedDateFrom: 'commissioned_date_from', commissionedDateTo: 'commissioned_date_to',
  isForFinance: 'is_for_finance', promotionCode: 'promo_code', newContract: 'new_contract', pricingPlanRateData: 'price_plan',
};

const CONTRACT_IGNORE_FIELDS = [ 'consumerData', 'billingPeriodData', 'paymentModeData', 'contractDocumentData' ];

export class Contract extends BaseModel {
  promotionCode: string = null;
  consumer: Consumer = null;
  customer: Customer = null;
  pricingPlanRate: PricingPlanRate = null;
  contractRef: string = null;
  pricingPlanId: number = null;
  pricingPlanName: string = null;
  pricingMarker: string = null;
  discountPercentage: number = null;
  latePaymentRate: number = null;
  offPeakRate: number = null;
  billingPeriod: BillingPeriod = null;
  paymentMode: PaymentMode = null;
  invoices: Invoice[] = null;
  documents: Attachment[] = null;
  contractDocument: Attachment = null;
  paymentTermNumber: number = null;
  termNumber: number = null;
  threeMonthAverageConsumption: number = null;
  specialRequest: string = null;
  loadProfile: number = null;
  isHardCopyRequested = false;
  isTlfIncluded = false;
  billingAddress: string = null;
  billingPostalCode: string = null;
  cleanEnergyPercentage: number = null;
  depositAmount: number = null;
  status: ContractStatus = null;
  signedDate = new DateMoment();
  commissionedDate = new DateMoment();
  plannedEndDate = new DateMoment();
  actualEndDate = new DateMoment();
  dwellingType: string = null;
  promotions: Promotion[] = null;
  signUpRate: number = null;
  contractType: ContractType = null;
  billingOption: BillingOption = null;
  contractOrigin: ContractOrigin = null;
  orderDate = new DateMoment();
  expectedStartDate = new DateMoment();
  capacity: number = null;
  fromRetailer: string = null;
  toRetailer: string = null;
  isAfpIncluded = false;
  isEmcIncluded = false;
  isHeucIncluded = false;
  isMeucIncluded = false;
  isMssIncluded = false;
  isMssMdscIncluded = false;
  isMssOthersIncluded = false;
  isPsoIncluded = false;
  isUosIncluded = false;
  legacyContract: string = null;
  retailer: Retailer = null;
  reason: string = null;
  dunningProcess: DunningProcess = null;
  serviceAgreement: Attachment = null;
  saleTeam: SaleTeam = null;
  consumerId: number = null;
  customerId: number = null;
  saleId: number = null;
  commissionedDateFrom = new DateMoment();
  commissionedDateTo = new DateMoment();
  isForFinance = false;
  newContract: string = null;

  set saleTeamData(data: object) {
    if (!_.isEmpty(data)) {
      this.saleTeam = new SaleTeam().fromData(data);
    }
  }

  set serviceAgreementDocumentData(data: object) {
    if (!_.isEmpty(data)) {
      this.serviceAgreement = new Attachment().fromData(data);
    }
  }

  get serviceAgreementDocumentId() {
    return _.get(this.serviceAgreement, 'id');
  }

  set dunningProcessData(data: object) {
    if (!_.isEmpty(data)) {
      this.dunningProcess = new DunningProcess().fromData(data);
    }
  }

  set consumerData(data: object) {
    if (!_.isEmpty(data)) {
      this.consumer = new Consumer().fromData(data);
    }
  }

  set customerData(data: object) {
    if (!_.isEmpty(data)) {
      this.customer = new Customer().fromData(data);
    }
  }

  set pricingPlanRateData(data: object) {
    if (!_.isEmpty(data)) {
      this.pricingPlanRate = new PricingPlanRate().fromData(data);
    }
  }
  get pricingPlanRateId() {
    return _.get(this.pricingPlanRate, 'id');
  }

  set retailerData(data: object) {
    if (!_.isEmpty(data)) {
      this.retailer = new Retailer().fromData(data);
    }
  }
  get retailerId() {
    return _.get(this.retailer, 'id');
  }

  set promotionData(dataArray: object[]) {
    this.promotions = _.map(dataArray, data => new Promotion().fromData(data));
  }

  set invoicesData(dataArray: object[]) {
    this.invoices = _.map(dataArray, data => new Invoice().fromData(data));
  }

  get contractTypeDisplay() {
    return CONTRACT_TYPE_OPTIONS[this.contractType] || null;
  }

  get contractOriginDisplay() {
    return CONTRACT_ORIGIN_OPTIONS[this.contractOrigin] || null;
  }

  get statusDisplay() {
    return CONTRACT_STATUS_OPTIONS[this.status] || null;
  }

  set documentsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.documents = _.map(dataArray, data => new Attachment().fromData(data));
    }
  }

  get contractDocumentId() {
    return _.get(this.contractDocument, 'id');
  }

  set contractDocumentData(data: object) {
    if (!_.isEmpty(data)) {
      this.contractDocument = new Attachment().fromData(data);
    }
  }

  get documentNamesDisplay() {
    return _.chain(this.documents).map(doc => doc.displayName).join(', ').value();
  }

  set billingPeriodData(data: object) {
    if (!_.isEmpty(data)) {
      this.billingPeriod = new BillingPeriod().fromData(data);
    }
  }
  get billingPeriodId() {
    return _.get(this.billingPeriod, 'id');
  }

  set paymentModeData(data: object) {
    if (!_.isEmpty(data)) {
      this.paymentMode = new PaymentMode().fromData(data);
    }
  }
  get paymentModeId() {
    return _.get(this.paymentMode, 'id');
  }

  protected getFieldMap() {
    return super.getFieldMap(CONTRACT_FIELD_MAP);
  }

  protected getToDataIgnoredFields() {
    return super.getToDataIgnoredFields(CONTRACT_IGNORE_FIELDS);
  }
}

function newContract(data: object): Contract {
  return new Contract().fromData(data);
}

@Injectable()
export class ContractService extends BaseService<Contract> {

  protected baseUrl = 'contract';

  protected newModel = (data: object) => newContract(data);

  updateDunningProcess(contractId: number, action: string): Observable<DunningProcess> {
    return this.http.get(`${this.baseUrl}/dunning/${action}/?contract_id=${contractId}`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new DunningProcess().fromData(rs.data)));
  }

  saveContractRenewal(id: number, contract: Contract, isExtend: boolean) {
    let data;
    if (contract) {
      data = {
        billing_address: _.get(contract, 'billingAddress'),
        pricing_name: contract.pricingPlanName,
        promo_code: contract.promotionCode,
        is_extend: isExtend
      };
    }

    return this.http.post(`${this.baseUrl}/${id}/prepare_renewal/`, data, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new Contract().fromData(rs.data)));
  }

  getContractRenewalBeReviewed(id: number) {
    return this.http.get(`${this.baseUrl}/${id}/prepare_renewal/`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new Contract().fromData(rs.data)));
  }

  submitContractRenewal(id: number) {
    return this.http.post(`${this.baseUrl}/${id}/renewal/`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new Contract().fromData(rs.data)));
  }

  protected getFieldMap() {
    return super.getFieldMap(CONTRACT_FIELD_MAP);
  }

  protected getSortFieldMap() {
    return super.getSortFieldMap({
      consumer: CONSUMER_FIELD_MAP,
      customer: CUSTOMER_FIELD_MAP,
      billingPeriod: BILLING_PERIOD_FIELD_MAP,
      paymentMode: PAYMENT_MODE_FIELD_MAP,
      saleTeam: SALE_TEAM_FIELD_MAP,
      pricingPlanRate: PRICING_PLAN_RATE_FIELD_MAP
    });
  }
}
