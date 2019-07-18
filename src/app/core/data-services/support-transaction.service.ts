import { Injectable } from '@angular/core';

import { BaseModel, BaseService } from './index';


const SUPPORT_TRANSACTION_FIELD_MAP = {
  transactionId: 'transactionid', requestId: 'requestId', requestType: 'requestType',
  problemClassification: 'problemclassification', severity: 'Severity', type: 'Type', subType1: 'subtype1',
  subType2: 'subtype2', customerCategory: 'customercategory', customerSubCategory: 'customersubcategory',
  documentId: 'docid', documentIdType: 'docidtype', newEmailAddress: 'newemailaddress', newMobileNumber: 'newmobileno',
  newDocumentId: 'newdocid', newDocumentIdType: 'newdocidtype', newDepositAmount: 'newdepositamount',
  newCustomerCategory: 'newcustomercategory', newCustomerSubCategory: 'newcustomersubcategory',
  newBillingAccount: 'newbillingaccount', newBillingCycle: 'newbillcycle', productName: 'productname',
  productType: 'producttype', partNumber: 'partnumber', serviceId: 'serviceid', serviceAssetId: 'serviceassetid',
  note: 'note', noteType: 'notetype', remarks: 'remarks',
};

export class SupportTransaction extends BaseModel {

  transactionId: string = null;
  requestId: string = null;
  requestType: string = null;
  problemClassification: string = null;
  severity: string = null;
  type: string = null;
  subType1: string = null;
  subType2: string = null;
  customerCategory: string = null;
  customerSubCategory: string = null;
  documentId: string = null;
  documentIdType: string = null;
  newEmailAddress: string = null;
  newMobileNumber: string = null;
  newDocumentId: string = null;
  newDocumentIdType: string = null;
  newDepositAmount: string = null;
  newCustomerCategory: string = null;
  newCustomerSubCategory: string = null;
  newBillingAccount: string = null;
  newBillingCycle: string = null;
  productName: string = null;
  productType: string = null;
  partNumber: string = null;
  serviceId: string = null;
  serviceAssetId: string = null;
  note: string = null;
  noteType: string = null;
  remarks: string = null;

  protected getFieldMap() {
    return super.getFieldMap(SUPPORT_TRANSACTION_FIELD_MAP);
  }
}

function newSupportTransaction(data: object) {
  return new SupportTransaction().fromData(data);
}

@Injectable()
export class SupportTransactionService extends BaseService<SupportTransaction> {

  protected baseUrl = 'support';

  protected httpConfigs = {
    isStarhubUrl: true
  };

  protected newModel = (data: object) => newSupportTransaction(data);

  protected getFieldMap() {
    return super.getFieldMap(SUPPORT_TRANSACTION_FIELD_MAP);
  }
}
