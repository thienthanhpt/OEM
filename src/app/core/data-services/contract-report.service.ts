import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, DateMoment } from './base.service';
import { Attachment } from './attachment.service';

const CONTRACT_REPORT_FIELD_MAP = {
  documentData: 'attachment',
  name: 'file_name', isForFinance: 'is_for_finance', note: 'note', contractIds: 'contract_ids', isGetAll: 'is_get_all',
  commissionedFromDate: 'date_from', commissionedToDate: 'date_to'
};

export class ContractReport extends BaseModel {
  name: string = null;
  document: Attachment = null;
  contractIds: number[] = [];
  isForFinance = false;
  note: string = null;
  isGetAll = false;
  commissionedFromDate = new DateMoment();
  commissionedToDate = new DateMoment();

  set documentData(data: object) {
    if (!_.isEmpty(data)) {
      this.document = new Attachment().fromData(data);
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(CONTRACT_REPORT_FIELD_MAP);
  }
}

function newContractReport(data: object) {
  return new ContractReport().fromData(data);
}

@Injectable()
export class ContractReportService extends BaseService<ContractReport> {
  protected baseUrl = 'contract-report';

  protected newModel = (data: object) => newContractReport(data);

  protected getFieldMap() {
    return super.getFieldMap(CONTRACT_REPORT_FIELD_MAP);
  }
}
