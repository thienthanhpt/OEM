import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, Attachment } from './index';

const CDR_FIELD_MAP = {
  name: 'name', billingCycle: 'billing_cycle', numberOfRecord: 'number_of_record', cdrDocumentData: 'document'
};

export class StarhubCDR extends BaseModel {

  name: string = null;
  billingCycle: string = null;
  numberOfRecord: number = null;
  cdrDocument: Attachment = null;

  protected getFieldMap() {
    return super.getFieldMap(CDR_FIELD_MAP);
  }

  set cdrDocumentData(data: object) {
    if (!_.isEmpty(data)) {
      this.cdrDocument = new Attachment().fromData(data);
    }
  }
}

function newStarhubCDR(data: object) {
  return new StarhubCDR().fromData(data);
}

@Injectable()
export class StarhubCDRService extends BaseService<StarhubCDR> {

  protected baseUrl = 'cdr';

  protected newModel = (data: object) => newStarhubCDR(data);

  protected getFieldMap() {
    return super.getFieldMap(CDR_FIELD_MAP);
  }
}
