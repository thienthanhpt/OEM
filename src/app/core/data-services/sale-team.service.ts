import { Injectable } from '@angular/core';

import { BaseModel, BaseService } from './base.service';

export const SALE_TEAM_FIELD_MAP = {
  id: 'sale_id', name: 'name', email: 'email', phoneNumber: 'mobile_no', companyName: 'company', position: 'position',
};

export class SaleTeam extends BaseModel {

  name: string = null;
  email: string = null;
  phoneNumber: string = null;
  companyName: string = null;
  position: string = null;

  protected getFieldMap() {
    return super.getFieldMap(SALE_TEAM_FIELD_MAP);
  }
}

function newSaleTeam(data: object): SaleTeam {
  return new SaleTeam().fromData(data);
}

@Injectable()
export class SaleTeamService extends BaseService<SaleTeam> {

  protected baseUrl = 'saleteam';

  protected newModel = (data: object) => newSaleTeam(data);

  protected getFieldMap() {
    return super.getFieldMap(SALE_TEAM_FIELD_MAP);
  }
}
