import { DataTableParams } from '../components/types';
import * as _ from 'lodash';

export class DataTableResource<T> {

  constructor(private items: T[]) {}

  query(params: DataTableParams, filter?: object | ((item: T) => boolean)): Promise<T[]> {

    let result: T[] = [];
    if (filter) {
      result = _.filter(this.items, filter);
    } else {
      result = this.items.slice(); // shallow copy to use for sorting instead of changing the original
    }

    if (params.sortBy) {
      if (_.endsWith(params.sortBy, '.short')) {
        params.sortBy = params.sortBy.split('.')[0] + '.moment';
      }
      result = _.sortBy(result, params.sortBy);
      if (params.sortAsc === false) {
        result.reverse();
      }
    }
    if (params.offset !== undefined) {
      if (params.limit === undefined) {
        result = result.slice(params.offset, result.length);
      } else {
        result = result.slice(params.offset, params.offset + params.limit);
      }
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(result));
    });
  }

  count(): Promise<number> {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(this.items.length));
    });

  }
}
