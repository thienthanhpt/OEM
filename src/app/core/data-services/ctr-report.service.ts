import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, DateMoment } from './base.service';
import { Attachment } from './attachment.service';
const CTR_REPORT_FIELD_MAP = {
  documentData: 'document',
  name: 'display_name', description: 'description', fileType: 'file_type', status: 'status',
  fromDate: 'date_from', toDate: 'date_to', isStored: 'is_store', isForced: 'is_force'
};


export class CtrReport extends BaseModel {
  name: string = null;
  server: string = null;
  fileType: string = null;
  document: Attachment = null;
  fromDate = new DateMoment();
  toDate = new DateMoment();
  isStored = true;
  isForced = false;

  set documentData(data: object) {
    if (!_.isEmpty(data)) {
      this.document = new Attachment().fromData(data);
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(CTR_REPORT_FIELD_MAP);
  }
}

function newCtrReport(data: object) {
  return new CtrReport().fromData(data);
}

@Injectable()
export class CtrReportService extends BaseService<CtrReport> {
  protected baseUrl = 'ctr-report';

  protected newModel = (data: object) => newCtrReport(data);

  protected getFieldMap() {
    return super.getFieldMap(CTR_REPORT_FIELD_MAP);
  }
}
