import { Injectable } from '@angular/core';

import { BaseModel, BaseService, DateMoment } from './base.service';
import { Customer } from './customer.service';

export const PAYMENT_MODE_FIELD_MAP = {
  customerName: 'customer', paymentTag: 'payment_tag', paymentMode: 'payment_mode', giroBankName: 'giro_bank_name',
  giroAccountBankName: 'giro_acc_bank_name', giroAccountBankNo: 'giro_acc_bank_no', giroSwiftCode: 'giro_swift_code',
  giroBankCode: 'giro_bank_code', giroBranchCode: 'giro_branch_code', giroDdaIdCode: 'giro_dda_id_code',
  giroContractNo: 'giro_contract_no', isGiro: 'is_giro_mode', expiryDate: 'card_expiry_date', customerId: 'customer_id',
  isAutoDeduct: 'is_auto_deduct',
};

export class PaymentMode extends BaseModel {

  customer: Customer = null;
  paymentTag: string = null;
  paymentMode: string = null;
  giroBankName: string = null;
  giroAccountBankName: string = null;
  giroAccountBankNo: string = null;
  giroSwiftCode: string = null;
  giroBankCode: string = null;
  giroBranchCode: string = null;
  giroDdaIdCode: string = null;
  giroContractNo: string = null;
  isGiro: boolean = null;
  isAutoDeduct: boolean = null;
  expiryDate = new DateMoment();

  set customerName(name: string) {
    if (name) {
      if (!this.customer) {
        this.customer = new Customer();
      }
      this.customer.name = name;
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(PAYMENT_MODE_FIELD_MAP);
  }
}

function newPaymentMode(data: object): PaymentMode {
  return new PaymentMode().fromData(data);
}

@Injectable()
export class PaymentModeService extends BaseService<PaymentMode> {

  protected baseUrl = 'payment';

  protected newModel = (data: object) => newPaymentMode(data);

  protected getFieldMap() {
    return super.getFieldMap(PAYMENT_MODE_FIELD_MAP);
  }
}
