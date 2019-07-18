import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, DateMoment } from './base.service';
import { Attachment } from './attachment.service';

const EMA_REPORT_FIELD_MAP = {
  documentData: 'attachment',
  name: 'display_name', description: 'description', fileType: 'file_type', status: 'status',
  fromDate: 'date_from', toDate: 'date_to', isStored: 'is_store', isForced: 'is_force'
};


export class EmaReport extends BaseModel {

  document: Attachment = null;
  name: string = null;
  server: string = null;
  fileType: string = null;

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
    return super.getFieldMap(EMA_REPORT_FIELD_MAP);
  }
}

function newEmaReport(data: object) {
  return new EmaReport().fromData(data);
}

@Injectable()
export class EmaReportService extends BaseService<EmaReport> {
  protected baseUrl = 'ema_report';

  protected newModel = (data: object) => newEmaReport(data);

  protected getFieldMap() {
    return super.getFieldMap(EMA_REPORT_FIELD_MAP);
  }
}
