import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as _ from 'lodash';

import { SuccessResponse } from '../data-services/base.service';

export enum PageAccess {
  Create = 'create', Edit = 'edit', View = 'view',
}
export enum Model {
  PricePlan = 'priceplan', PlanRate = 'planrate', User = 'user', BillingReport = 'billingreport',
  EMAReport = 'emareport', SignUpReport = 'signupreport', CTRReport = 'ctrreport', Consumer = 'consumer', Contract = 'contract',
  Customer = 'customer', Payment = 'payment', PaymentFile = 'paymentfile',
}

export const MODEL_OPTIONS: { [key: string]: string } = {
  [Model.PricePlan]: 'Price Plan',
  [Model.PlanRate]: 'Plan Rate',
  [Model.User]: 'User',
  [Model.BillingReport]: 'Billing Report',
  [Model.EMAReport]: 'EMA Report',
  [Model.SignUpReport]: 'Sign Up Report',
  [Model.CTRReport]: 'CTR Report',
  [Model.Consumer]: 'Consumer',
  [Model.Contract]: 'Contract',
  [Model.Customer]: 'Customer',
  [Model.Payment]: 'Payment',
  [Model.PaymentFile]: 'PaymentFile',
};

export const MODEL_PERMISSION_FIELD_MAP = {
  model: 'model', create: 'create', edit: 'edit', view: 'view'
}

export class ModelPermission {
  model = '';
  create = false;
  edit = false;
  view = false;

  fromData(data: object) {
    const fieldMap = _.invert(MODEL_PERMISSION_FIELD_MAP);

    _.forEach(data, (value, key) => {
      if (_.has(fieldMap, key)) {
        const modelField = fieldMap[key];
        _.set(this, modelField, value);
      }
    });

    return this;
  }
}


@Injectable()
export class AuthorizationService {

  constructor(
    private http: HttpClient
  ) { }

  getAllPermissions(): Observable<any> {
    return this.http.get('permission/')
      .pipe(map((rs: SuccessResponse) => (_.map(rs.data, row =>  new ModelPermission().fromData(row)))));
  }

  getOnePermission = (permissionCollection: ModelPermission, modelName: string) => {
    return _.find(permissionCollection, { model: modelName });
  }

  checkPermission(action: PageAccess, modelToCheckPermission: ModelPermission): boolean {
    switch (action) {
      case PageAccess.View:
        return modelToCheckPermission.view;
      case PageAccess.Edit:
        return modelToCheckPermission.edit;
      case PageAccess.Create:
        return modelToCheckPermission.create;
      default:
        return false;
    }
  }
}
