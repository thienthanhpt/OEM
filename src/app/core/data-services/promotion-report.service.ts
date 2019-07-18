import { BaseModel, BaseService, DateMoment } from './base.service';
import { Injectable } from '@angular/core';
import { Attachment } from '@app/core';
import * as _ from 'lodash';

export const PROMOTION_REPORT_FIELD_MAP = {
  documentData: 'document', name: 'display_name', description: 'description', fileType: 'file_type', status: 'status',
  fromDate: 'date_from', toDate: 'date_to', isStored: 'is_store', isForced: 'is_force',
};

export class PromotionReport extends BaseModel {
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
    return super.getFieldMap(PROMOTION_REPORT_FIELD_MAP);
  }
}

function newPromotionReport(data: object) {
  return new PromotionReport().fromData(data);
}

@Injectable()
export class PromotionReportService extends BaseService<PromotionReport> {
  protected baseUrl = 'promo-count-report';

  protected newModel = (data: object) => newPromotionReport(data);

  protected getFieldMap() {
    return super.getFieldMap(PROMOTION_REPORT_FIELD_MAP);
  }
}
