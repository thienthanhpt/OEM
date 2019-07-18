import { BaseModel, BaseService, Collection, SuccessResponse } from './base.service';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DataTableParams } from '@libs/data-table/components/types';

const DESCRIPTION_HISTORIES_FIELD_MAP = {
  actionDescription: 'description', field: 'field', oldValue: 'old_value', newValue: 'new_value'
}

export class DescriptionHistories extends BaseModel {
  actionDescription: string = null;
  field: string = null;
  oldValue: string = null;
  newValue: string = null;

  protected getFieldMap() {
    return super.getFieldMap(DESCRIPTION_HISTORIES_FIELD_MAP);
  }
}

const HISTORY_FIELD_MAP = {
  historyId: 'history_id', model: 'model', user: 'user', field: 'field', description: 'description',
  descriptionData: 'history_action', action: 'action', actionBy: 'action_by'
}

export class Histories extends BaseModel {
  historyId: number = null;
  model: string = null;
  user: string = null;
  field: string = null;
  descriptionList: DescriptionHistories[] = [];
  action: string = null;
  actionBy: string = null;

  set descriptionData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.descriptionList = _.map(dataArray, row => new DescriptionHistories().fromData(row));
    }
  }

  get descriptionListDisplay() {
    const descriptions: string[] = [];

    _.forEach(this.descriptionList, (modification: DescriptionHistories) => {
      descriptions.push('The field \'' + modification.field + '\' is changed from \''
        + modification.oldValue + '\' to \'' + modification.newValue + '\'.');
    });

    return descriptions;
  }

  protected getFieldMap() {
    return super.getFieldMap(HISTORY_FIELD_MAP);
  }
}

@Injectable()
export class HistoriesService extends BaseService<Histories> {
  protected baseUrl = 'history';

  protected newModel = (data: object) => new Histories().fromData(data);

  protected getFieldMap() {
    return super.getFieldMap(HISTORY_FIELD_MAP);
  }

  fetchAllHistories(params: DataTableParams, modal: string, id?: number): Observable<Collection<Histories>> {
    if (id) {
      this.baseUrl = modal + '/' + id + '/history';
    } else {
      this.baseUrl = modal + '/history';
    }

    return this.fetchAll({}, params);
  }
}
