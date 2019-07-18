import { Injectable } from '@angular/core';

import { BaseModel, BaseService } from './base.service';

const RETAILER_FIELD_MAP = {
  name: 'retailer', isCompetitor: 'is_competitor'
};

export class Retailer extends BaseModel {

  name: string = null;
  isCompetitor = false;

  protected getFieldMap() {
    return super.getFieldMap(RETAILER_FIELD_MAP);
  }
}

function newRetailer(data: object): Retailer {
  return new Retailer().fromData(data);
}

@Injectable()
export class RetailerService extends BaseService<Retailer> {

  protected baseUrl = 'retailer';

  protected newModel = (data: object) => newRetailer(data);

  protected getFieldMap() {
    return super.getFieldMap(RETAILER_FIELD_MAP);
  }
}
