import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, DateMoment } from './base.service';
import { Attachment } from './attachment.service';

const SIGNUP_REPORT_FIELD_MAP = {
  documentData: 'attachment',
  name: 'display_name', description: 'description', fileType: 'file_type', status: 'status',
  fromDate: 'date_from', toDate: 'date_to', isStored: 'is_store', isForced: 'is_force'
};

export class SignupReport extends BaseModel {

  document: Attachment = null;
  name: string = null;
  server: string = null;
  fileType: string = null;
  status: string = null;
  fromDate = new DateMoment();
  toDate = new DateMoment();
  isStored = true;
  isForced = false;

  set documentData(data: object) {
    if (!_.isEmpty(data)) {
      this.document = new Attachment().fromData(data);
    }
  }

  get displayStatus() {
    return _.upperFirst(this.status);
  }

  protected getFieldMap() {
    return super.getFieldMap(SIGNUP_REPORT_FIELD_MAP);
  }
}

function newSignupReport(data: object) {
  return new SignupReport().fromData(data);
}

@Injectable()
export class SignupReportService extends BaseService<SignupReport> {
  protected baseUrl = 'signup_report';

  protected newModel = (data: object) => newSignupReport(data);

  protected getFieldMap() {
    return super.getFieldMap(SIGNUP_REPORT_FIELD_MAP);
  }
}
