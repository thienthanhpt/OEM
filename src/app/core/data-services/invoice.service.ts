import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as _ from 'lodash';

import {
  BaseModel, BaseService, DateMoment, Consumer, Attachment, ConsumerCharge, Contract, Customer,
  CONSUMER_FIELD_MAP, CONTRACT_FIELD_MAP, CUSTOMER_FIELD_MAP, SuccessResponse,
} from './index';

const INVOICE_STATISTIC_FIELD_MAP = {
  invoiceDate: 'inv_date', dueDate: 'due_date', customerCount: 'customer_count', invoiceCount: 'invoice_count',
  billingTotalAmount: 'billing_total_amount', invoiceTotalCount: 'total_invoice_count', customerTotalCount: 'total_customer_count'
};

export class InvoiceStatistic extends BaseModel {
  invoiceDate = new DateMoment();
  dueDate = new DateMoment();
  customerCount: number = null;
  invoiceCount: number = null;
  billingTotalAmount: number = null;
  invoiceTotalCount: number = null;
  customerTotalCount: number = null;

  get billingTotalAmountDisplay() {
    return 'S$ ' + this.billingTotalAmount;
  }

  protected getFieldMap() {
    return super.getFieldMap(INVOICE_STATISTIC_FIELD_MAP);
  }
}

const INVOICE_CHARGE_FIELD_MAP = {
  billingPeriod: 'remark2', rate: 'remark4', usageKWH: 'uom_value', taxAbleAmount: 'taxableamount',
  chargeableAmount: 'chargeableamount',
};

export class InvoiceCharge extends BaseModel {
  billingPeriod: string = null;
  rate: number = null;
  usageKWH: number = null;
  taxAbleAmount: number = null;
  chargeableAmount: number = null;

  protected getFieldMap() {
    return super.getFieldMap(INVOICE_CHARGE_FIELD_MAP);
  }
}

export enum InvoiceStatus {
  Pending = 'pending', Approved = 'approved', Cancelled = 'canceled', UnPaid = 'unpaid', Failed = 'failed', Paid = 'paid',
  Overdue = 'overdue', Partial = 'partial', New = 'new'
}

export const INVOICE_STATUS_OPTION: { [key: string]: string } = {
  [InvoiceStatus.New]: 'NEW',
  [InvoiceStatus.Pending]: 'PENDING',
  [InvoiceStatus.Approved]: 'APPROVED',
  [InvoiceStatus.Cancelled]: 'CANCELLED',
  [InvoiceStatus.UnPaid]: 'UNPAID',
  [InvoiceStatus.Failed]: 'FAILED',
  [InvoiceStatus.Paid]: 'PAID',
  [InvoiceStatus.Overdue]: 'OVERDUE',
  [InvoiceStatus.Partial]: 'PARTIAL'
};

const INVOICE_IMPORT_FIELD_MAP = {
  line: 'line', customerName: 'customer_name', billingOption: 'billing_option', invoiceNo: 'invoice_no', msslNo: 'mssl_no',
  billingPeriod: 'billing_period', balanceFromPreviousBill: 'balance_from_previous_bill', usageAmount: 'usage_amount', rate: 'rate',
  currentCharges: 'current_charges', taxGST: 'tax_gst', rebate: 'rebate', amountPayable: 'amount_payable',
  paymentReceived: 'payment_received', paymentDateReceived: 'payment_received_date', paymentMode: 'payment_mode',
  outstandingBalance: 'outstanding_balance', dateInvoice: 'invoice_date', additionCharge: 'addition_charge', isInserted: 'is_inserted',
  reason: 'remark'

};

const INVOICE_IMPORT_IGNORE_FIELDS = [ 'id', 'createdTime', 'updatedTime' ];

export class InvoiceImportModel extends BaseModel {
  line: number = null;
  customerName: string = null;
  billingOption: string = null;
  invoiceNo: string = null;
  msslNo: string = null;
  billingPeriod: string = null;
  balanceFromPreviousBill: number = null;
  usageAmount: number = null;
  rate: number = null;
  currentCharges: number = null;
  taxGST: number = null;
  rebate: number = null;
  amountPayable: number = null;
  paymentReceived: number = null;
  paymentDateReceived: string = null;
  paymentMode: string = null;
  outstandingBalance: string = null;
  dateInvoice: string = null;
  additionCharge: string = null;
  isInserted: boolean = null;
  reason: string = null;

  protected getFieldMap() {
    return super.getFieldMap(INVOICE_IMPORT_FIELD_MAP);
  }

  protected getToDataIgnoredFields() {
    return super.getToDataIgnoredFields(INVOICE_IMPORT_IGNORE_FIELDS);
  }

  get status() {
    if (this.isInserted) {
      return 'Checked';
    } else if (this.isInserted === false) {
      return 'Can not import';
    } else {
      return 'Unchecked';
    }
  }
}

const INVOICE_CHARGE_EVENT_FIELD_MAP = {
  chargeType: 'charge_type', chargeName: 'charge_name', chargeValue: 'charge_value',
};

export class InvoiceChargeEvent extends BaseModel {
  chargeType: string = null;
  chargeName: string = null;
  chargeValue: number = null;

  protected getFieldMap() {
    return super.getFieldMap(INVOICE_CHARGE_EVENT_FIELD_MAP);
  }
}

const INVOICE_FIELD_MAP = {
  id: 'inid', consumerData: 'consumer', contractData: 'contract', contractId: 'crid', pricingPlanName: 'price_plan',
  rate: 'rate', discountPercentage: 'discount', cleanEnergyPercentage: 'clean', offPeakRate: 'offpeak', no: 'inv_no',
  period: 'inv_period', invoiceDate: 'inv_date', dueDate: 'due_date', oldBalance: 'old_bal', newBalance: 'new_bal',
  latePaymentCharge: 'late_charge', netAmount: 'net_amt', gstAmount: 'gst_amt', totalAmount: 'tot_amt',
  paidChargesData: 'paid_charges', documentsData: 'documents', invoiceDocumentData: 'invoice_doc',
  invoiceDocumentId: 'invoice_doc_id', rebate: 'rebate', peakConsumption: 'peak', offPeakConsumption: 'off_peak',
  remarks: 'remarks', url: 'url', status: 'status', usageFromDate: 'usage_date_from', usageToDate: 'usage_date_to',
  usageAmount: 'usage_amount', customerData: 'customer', isSent: 'is_send', isGenerated: 'is_generate',
  outstandingBalance: 'outstanding_balance', totalAmountPayable: 'total_amount_payable', customerName: 'customer_name',
  serviceAddress: 'service_address', signUpRate: 'signup_rate', invoiceDocumentUrl: 'filepath',
  invoiceFromDate: 'invoice_date_from', invoiceToDate: 'invoice_date_to', paymentReceived: 'payment_received',
  breakDownOfChargesData: 'breakdown_of_charges', currentCharge: 'current_charge', chargingEvents: 'charging_events',
  gstExemptedAmount: 'GST_exempted_amount', adjustUsageAmount: 'adjusted_usage_amount',
  currentOutstandingBalance: 'current_outstanding_balance', remarksCharges: 'remarks_charges',
  invoiceBillDateMonth: 'invoice_bill_date', charge: 'charge', origin: 'origin'
};

const INVOICE_IGNORE_FIELDS = [ 'consumerData', 'customerName', 'contractData' ];

export class  Invoice extends BaseModel {

  consumer: Consumer = null;
  contract: Contract = null;
  // Declare customer for only search, support backend
  customer: Customer = null;
  pricingPlanName: string = null;
  rate: number = null;
  discountPercentage: number = null;
  cleanEnergyPercentage: number = null;
  offPeakRate: number = null;
  no: string = null;
  period: number = null;
  invoiceDate = new DateMoment();
  dueDate = new DateMoment();
  oldBalance: number = null;
  newBalance: number = null;
  latePaymentCharge: number = null;
  netAmount: number = null;
  gstAmount: number = null;
  totalAmount: number = null;
  paidCharges: ConsumerCharge[] = [];
  documents: Attachment[] = null;
  invoiceDocument: Attachment = null;
  rebate: number = null;
  peakConsumption: number = null;
  offPeakConsumption: number = null;
  status: string = null;
  remarks: number = null;
  url: string = null;
  usageAmount: number = null;
  usageFromDate = new DateMoment();
  usageToDate = new DateMoment();
  isSent = false;
  isGenerated = false;
  outstandingBalance: number = null;
  totalAmountPayable: number = null;
  customerName = '';
  serviceAddress = '';
  signUpRate: number = null;
  invoiceDocumentUrl = '';
  invoiceFromDate = new DateMoment();
  invoiceToDate = new DateMoment();
  paymentReceived: number = null;
  currentCharge: number = null;
  breakDownOfCharges: InvoiceCharge[] = [];
  chargingEvents: InvoiceCharge[] = [];
  gstExemptedAmount: number = null;
  adjustUsageAmount: number = null;
  currentOutstandingBalance: number = null;
  remarksCharges: number = null;
  invoiceBillDateMonth: string = null;
  invoiceBillDate = new DateMoment();
  charge: InvoiceChargeEvent[] = [];
  origin: string = null;

  get invoiceStatusDisplay() {
    return INVOICE_STATUS_OPTION[this.status] || null;
  }

  get fullInvoiceDocumentPath() {
    return 'http://' + this.invoiceDocumentUrl || '';
  }

  set breakDownOfChargesData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.breakDownOfCharges = _.map(dataArray, data => new InvoiceCharge().fromData(data));
    }
  }

  set chargingEventsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.chargingEvents = _.map(dataArray, data => new InvoiceCharge().fromData(data));
    }
  }

  set customerData(data: object) {
    if (!_.isEmpty(data)) {
      this.customer = new Customer().fromData(data);
    }
  }

  set consumerData(data: object) {
    if (!_.isEmpty(data)) {
      this.consumer = new Consumer().fromData(data);
    }
  }

  set contractData(data: object) {
    if (!_.isEmpty(data)) {
      this.contract = new Contract().fromData(data);
    }
  }
  set contractId(value) {
    if (value) {
      if (!this.contract) {
        this.contract = new Contract();
      }
      this.contract.id = value;
    }
  }
  get contractId() {
    return _.get(this.contract, 'id');
  }

  set paidChargesData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.paidCharges = _.map(dataArray, data => new ConsumerCharge().fromData(data));
    }
  }

  set documentsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.documents = _.map(dataArray, data => new Attachment().fromData(data));
    }
  }

  get invoiceDocumentId() {
    return _.get(this.invoiceDocument, 'id');
  }
  set invoiceDocumentData(data: object) {
    if (!_.isEmpty(data)) {
      this.invoiceDocument = new Attachment().fromData(data);
    }
  }

  get documentNamesDisplay() {
    return _.chain(this.documents).map(doc => doc.displayName).join(', ').value();
  }

  protected getFieldMap() {
    return super.getFieldMap(INVOICE_FIELD_MAP);
  }

  protected getToDataIgnoredFields() {
    return super.getToDataIgnoredFields(INVOICE_IGNORE_FIELDS);
  }
}

function newInvoice(data: object) {
  return new Invoice().fromData(data);
}

const INVOICE_CRITERIA_EXTRA_FIELD_MAP = {
  consumerName: 'consumer', consumerPremiseAddress: 'address', consumerPremisePostalCode: 'postal', consumerMsslNo: 'mssl_no',
  customerName: 'customer', customerSunseapAccountNo: 'ss_acc_no', customerId: 'customer_id', contractId: 'contract_id',
};

@Injectable()
export class InvoiceService extends BaseService<Invoice> {

  protected baseUrl = 'invoice';

  protected newModel = (data: object) => newInvoice(data);

  importInvoices(invoiceList: InvoiceImportModel[], isDryRun?: boolean): Observable<{ items: InvoiceImportModel[] }> {
    const requestObj = {
      'data': invoiceList.map((invoice: InvoiceImportModel) => invoice.toData()),
      'dry_run': isDryRun
    };

    return this.http.post( `${this.baseUrl}/import/`, requestObj, this.getHttpConfigs())
      .pipe(map( (rs: SuccessResponse) => ({ items: _.map(rs.data, row => new InvoiceImportModel().fromData(row)) })));
  }

  sendInvoiceViaEmail(invoiceId: number): Observable<any> {
    return this.http.post( `${this.baseUrl}/${invoiceId}/send_mail/`, this.getHttpConfigs());
  }

  fetchInvoiceStatistics(): Observable<{ items: InvoiceStatistic[] }> {
    return this.http.get(`${this.baseUrl}/statistic/`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => ({ items: _.map(rs.data, row => new InvoiceStatistic().fromData(row)) })));

  }

  forceGenerate(id: number): Observable<Attachment> {
    return this.http.get(`${this.baseUrl}/${id}/generate/?force_generate=true`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new Attachment().fromData(rs.data.document)));
  }

  createInvoice (invoice: Invoice): Observable<any> {
    const data = invoice.toData();
    data['charging_events'] = _.map(invoice.chargingEvents, (invoiceCharge: InvoiceCharge) => invoiceCharge.toData());
    data['charge'] = _.map(invoice.charge, (invoiceChargeEvent: InvoiceChargeEvent) => invoiceChargeEvent.toData());
    data['contract'] = invoice.contract.id;
    return this.http.post((`${this.baseUrl}/`), data, this.getHttpConfigs());
  }

  fetchInvoice(invoiceId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${invoiceId}/`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new Invoice().fromData(rs.data)));
  }

  protected getFieldMap() {
    return super.getFieldMap(_.assign({}, INVOICE_FIELD_MAP, INVOICE_CRITERIA_EXTRA_FIELD_MAP));
  }

  protected getSortFieldMap() {
    return super.getSortFieldMap({
      consumer: CONSUMER_FIELD_MAP,
      customer: CUSTOMER_FIELD_MAP,
      contract: CONTRACT_FIELD_MAP,
    });
  }
}
