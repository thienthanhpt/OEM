import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, Attachment, BillingOption } from './index';

export const BILLING_REPORT_OPTIONS: { [key: string]: string } = {
  [BillingOption.BC71]: 'BC71',
  [BillingOption.BC72]: 'BC72',
  [BillingOption.BC73]: 'BC73',
  [BillingOption.BC74]: 'BC74',
  [BillingOption.BC75]: 'BC75',
  [BillingOption.BC76]: 'BC76',
  [BillingOption.BC77]: 'BC77',
};

const BILLING_REPORT_FIELD_MAP = {
  documentData: 'attachment',
  name: 'display_name', description: 'description', fileType: 'file_type', status: 'status',
  billingOption: 'billing_option',
};


export class BillingReport extends BaseModel {

  document: Attachment = null;
  name: string = null;
  server: string = null;
  fileType: string = null;

  billingOption: BillingOption = null;

  set documentData(data: object) {
    if (!_.isEmpty(data)) {
      this.document = new Attachment().fromData(data);
    }
  }

  get billingOptionDisplay() {
    return BILLING_REPORT_OPTIONS[this.billingOption] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(BILLING_REPORT_FIELD_MAP);
  }
}

function newBillingReport(data: object) {
  return new BillingReport().fromData(data);
}

@Injectable()
export class BillingReportService extends BaseService<BillingReport> {
  protected baseUrl = 'billing_report';

  protected newModel = (data: object) => newBillingReport(data);

  protected getFieldMap() {
    return super.getFieldMap(BILLING_REPORT_FIELD_MAP);
  }
}
