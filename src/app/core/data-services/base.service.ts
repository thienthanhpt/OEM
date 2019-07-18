import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AdminConfig } from '../../admin/shared/configs/admin.config';
import { NGXLogger } from 'ngx-logger';

const BASE_FIELD_MAP = { id: 'id', createdTime: 'created_date', updatedTime: 'last_modified_date' };
const BASE_IGNORE_FIELDS = [ 'id', 'createdTime', 'updatedTime' ];

export abstract class BaseModel {

  public id: number = null;
  public createdTime = new TimeMoment();
  public updatedTime = new TimeMoment();

  protected getFieldMap(extendedFieldMap: object = {}): object {
    return _.assign({}, BASE_FIELD_MAP, extendedFieldMap);
  }

  protected getFromDataFieldMap() {
    return _.chain(this.getFieldMap()).mapValues(field => _.isArray(field) ? field[0] : field).value();
  }

  protected getToDataIgnoredFields(extendedIgnoreFields: Array<string> = []): Array<string> {
    return _.concat([], BASE_IGNORE_FIELDS, extendedIgnoreFields);
  }

  fromData(data: object) {
    const fieldMap = _.invert(this.getFromDataFieldMap());

    _.forEach(data, (value: any, key: string) => {
      if (_.has(fieldMap, key)) {
        const modelField = fieldMap[key];
        if (_.endsWith(modelField, 'Date')) {
          value = new DateMoment().fromData(value);
        } else if (_.endsWith(modelField, 'Time')) {
          value = new TimeMoment().fromData(value);
        }
        if (typeof value === 'string') {
          value = _.trim(value, '\t');
        }
        _.set(this, modelField, value);
      }
    });

    return this;
  }

  toData(options?: string[]) {
    let fieldMap = _.omit(this.getFieldMap(), this.getToDataIgnoredFields());
    if (options) {
      fieldMap = _.pick(fieldMap, options);
    }

    const data: { [name: string]: any} = {};
    _.forEach(fieldMap, (dataField, modelField) => {

      let dataType: string;

      if (_.isArray(dataField)) {
        dataType = dataField[1];
        dataField = dataField[0];
      }

      let value = _.get(this, modelField);

      if (_.endsWith(modelField, 'Date') || _.endsWith(modelField, 'Time')) {
        if (value !== null) {
          value = value.toData();
        }
      } else if (_.isArray(value)) {
        if (_.isEmpty(value)) {
          if (dataType === 'string') {
            value = '';
          } else if (dataType === 'number' || dataType === 'object') {
            value = null;
          }
        }
      } else if (!_.isArray(value)) {
       if (value === null) {
          value = '';
        }
      }
      if (typeof value === 'string') {
        value = _.trim(value, '\t');
      }
      _.set(data, dataField,  value);
    });

    const validatedData = {};
    _.forIn(data, (value, key) => {
      if (value !== '' && value !== null) {
        _.assign(validatedData, _.pick(data, key));
      }
    });
    return validatedData;
  }
}

export class Collection<Model> {
  items: Model[] = [];
  meta?: {
    count: number,
    page: number,
    [name: string]: any,
    next: string,
    previous: string
  };
}

export class SuccessResponse {
  status: number;
  code?: string;
  message?: string;
  data?: any;
  meta?: any;
}

export class ErrorResponse {
  status: number;
  errors?: { [name: string]: string[] };
  code?: string;
  message: string;
  debugMessage?: string;
}

export abstract class BaseMoment {
  moment: moment.Moment = null;

  abstract isTimeDifferenceHandle: boolean;
  abstract shortFormat: string;
  abstract apiFormat: string;

  get short(): string {
    return !_.isEmpty(this.moment) ? this.moment.format(this.shortFormat) : null;
  }
  set short(value) {
    this.moment = (value) ? moment(value) : null;
  }

  get dayMonth(): string {
    return !_.isEmpty(this.moment) ? this.moment.format(AdminConfig.format.dayMonth) : null;
  }

  get dayMonthYear(): string {
    return !_.isEmpty(this.moment) ? this.moment.format(AdminConfig.format.apiDateMonthYear) : null;
  }

  fromData(value?: string, format?: string) {
    if (!_.isEmpty(value)) {
      if (_.isEmpty(format)) {
        format = this.apiFormat;
      }

      this.moment = moment(value, format);
      if (this.isTimeDifferenceHandle) {
        this.moment.utc(true).local();
      }
    }

    return this;
  }

  toData(format?: string): string {
    if (_.isEmpty(this.moment)) {
      return null;
    }

    if (_.isEmpty(format)) {
      format = this.apiFormat;
    }

    if (this.isTimeDifferenceHandle) {
      this.moment.utc();
    }
    return this.moment.format(format);
  }

  isEmpty = () => _.isEmpty(this.moment);

  setEmpty = () => { this.moment = null; };
}

export class DateMoment extends BaseMoment {
  isTimeDifferenceHandle = false;
  shortFormat = AdminConfig.format.date;
  apiFormat = AdminConfig.format.apiDate;
}

export class TimeMoment extends BaseMoment {
  isTimeDifferenceHandle = true;
  shortFormat = AdminConfig.format.dateTime;
  apiFormat = AdminConfig.format.apiDateTime;

  get shortDate() {
    return !_.isEmpty(this.moment) ? this.moment.format(AdminConfig.format.date) : null;
  }
}

export class AppOptions {
  isStarhubUrl?: boolean;
  context?: { [ name: string]: string };
}

@Injectable()
export abstract class BaseService<Model extends BaseModel> {

  protected abstract baseUrl: string;

  protected httpConfigs: AppOptions = {};

  protected abstract newModel: (data: object) => Model;

  constructor(
    protected http: HttpClient,
    protected logger: NGXLogger
  ) { }

  clone = (model: Model): Model => _.cloneDeep(model);

  fetchAll(criteria?: any, meta?: { limit?: number, offset?: number, sortAsc?: boolean, sortBy?: string },
           alternativeUrl?: string): Observable<Collection<Model>> {
    const query: any = {};
    const queryContext: { [name: string]: string[] } = {
      keys: [],
      values: []
    };

    if (criteria) {
      _.forEach(criteria, (value: string | number | string[] | number[], key: string) => {
        // to search for a list of options, concat them to string which separated by ","
        if (_.isArray(value)) {
          value[0] = '[' + value.toString() + ']';
        }

        // key search and, or
        if (key[0] === '~') {
          key = key.substr(1);
          value = '~' + String(value);
        }

        const searchQuery = this.getFieldNameFormMap(key.split('.'), this.getFromDataFieldMap(), this.getSortFieldMap());
        if (!_.isEmpty(searchQuery)) {
          queryContext.keys.push(searchQuery);
          queryContext.values.push(String(value));
          _.set(query, searchQuery, value);
        }
      });

      if (_.isEmpty(meta)) {
        meta = { limit: 1000, offset: 0 };
      }
    }

    if (!_.isEmpty(meta)) {
      const { limit, offset, sortAsc, sortBy } = meta;

      if (limit) {
        _.set(query, 'page_size', limit);
        if (offset) {
          _.set(query, 'page', Math.floor(offset / limit) + 1);
        }
      }

      if (!_.isEmpty(sortBy)) {
        const sortQuery = this.getFieldNameFormMap(sortBy.split('.'), this.getFromDataFieldMap(), this.getSortFieldMap());
        if (!_.isEmpty(sortQuery)) {
          _.set(query, 'sort_by', `${ (_.isUndefined(sortAsc) || sortAsc) ? '' : '-' }${sortQuery}`);
        }
      }
    }

    const queryString = (_.isEmpty(query)) ? ''
      : '?' +  _.chain(query).map((value: string|number, key: string) => `${key}=${value}`).join('&').value();

    const appOptions: AppOptions = {};
    if (queryContext.keys.length > 0 && queryContext.values.length > 0) {
      appOptions.context = {
        'search_key': queryContext.keys.join(','),
        'search_value': queryContext.values.join(',')
      };
    }

    return this.http.get(`${!_.isEmpty(alternativeUrl) ? alternativeUrl : this.baseUrl}${!_.isEmpty(meta) ? '/search' : ''}/${queryString}`,
      this.getHttpConfigs(appOptions))
      .pipe(map((rs: SuccessResponse) => this.newCollection(rs)));
  }

  fetchOne(id: number): Observable<Model>  {
    return this.http.get(`${this.baseUrl}/${id}/`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => this.newModel(rs.data)));
  }

  create(model: Model): Observable<Model> {
    return this.createFromData(model.toData());
  }

  createFromData(data: object): Observable<Model> {
    return this.http.post(`${this.baseUrl}/`, data, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => this.newModel(rs.data)));
  }

  update(model: Model, updateFields?: string[]): Observable<Model> {
    return this.updateFromData(model.id, model.toData(updateFields));
  }

  updateFromData(id: number, data: object): Observable<Model> {
    const validatedData = {};
    _.forIn(data, (value, key) => {
      if (value !== '' && value !== null) {
        if (typeof value === 'string') {
          _.set(data, key, _.trim(value, '\t'));
        }
        _.assign(validatedData, _.pick(data, key));
      } else {
        _.assign(validatedData, _.pick(data, key));
      }
    });
    return this.http.put(`${this.baseUrl}/${id}/`, validatedData, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => this.newModel(rs.data)));
  }

  updatePartial(model: Model, updateFields: string[]): Observable<Model> {
    return this.updatePartialFromData(model.id, model.toData(updateFields));
  }

  updatePartialFromData(id: number, data: object): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/`, data, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => this.newModel(rs.data)));
  }

  protected getSortFieldMap(extendedFieldMap: object = {}): object {
    return extendedFieldMap;
  }

  protected getFieldMap(extendedFieldMap: object = {}): object {
    return _.assign({}, BASE_FIELD_MAP, extendedFieldMap);
  }

  protected getFromDataFieldMap() {
    return _.chain(this.getFieldMap()).mapValues(field => _.isArray(field) ? field[0] : field).value();
  }

  protected getFieldNameFormMap(option: string[], map: { [name: string]: any }, listChildMap: { [name: string]: any }): string {
    let query = map[option[0]];

    // if find value = undefined, try search + value, ex: typeValue
    if (_.isEmpty(query)) {
      query = map[option[0] + 'Value'];
      if (!_.isEmpty(query)) {
        return query;
      }
    }

    // if field map is countryValue mean this is BaseType, return value
    if (_.endsWith(query, 'Value')) {
      query = option[0];
      return query;
    }

    // if field map is consumerData mean this is consumer and get child field map
    if (_.isEmpty(query)) {
      query = map[option[0] + 'Data'];

      if (!_.isEmpty(query) && option.length > 1) {
        // query = listOptions[0];
        // if short is query datetime, not action
        // if !short to get child field map
        if (option[1] === 'short')
          return query;

        // get child exactly query
        const childMap: { [name: string]: string } = listChildMap[option[0]];

        if (_.isEmpty(childMap)) {
          this.logger.error(`In ListChildMap is missing Map: ` + option[0]);
        }

        // field map is Object Map
        const childQuery = this.getFieldNameFormMap(_.drop(option), childMap, listChildMap);

        if (_.isEmpty(childQuery))
          return query;

        query = query + '__' + childQuery;
      }
    }

    return query;
  }

  protected getHttpConfigs = (httpConfigs: AppOptions = {}) => {
    const headerValues: { [name: string]: string } = {};
    _.assign(httpConfigs, this.httpConfigs);

    if (!_.isEmpty(httpConfigs)) {
      headerValues['App-Options'] = JSON.stringify(httpConfigs);
    }

    if (!_.isEmpty(headerValues))
      return { headers: headerValues };
    else
      return { };
  }

  protected newCollection(collectionData: object): Collection<Model> {
    const collection = new Collection<Model>();

    collection.items = _.chain(collectionData).get('data', []).map(row => this.newModel(row)).value();
    if ((_.has(collectionData, 'meta'))) {
      collection.meta = _.get(collectionData, 'meta');
    }

    return collection;
  }
}
