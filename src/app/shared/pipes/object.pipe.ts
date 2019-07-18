import { Pipe, PipeTransform } from '@angular/core';

import * as _ from 'lodash';

@Pipe({ name: 'values' })
export class ValuesPipe implements PipeTransform {
  transform = (obj: { [name: string]: any}): any[] => _.values(obj);
}


@Pipe({ name: 'toArray' })
export class ToArrayPipe implements PipeTransform {
  transform = (obj: any): { key: string| number, value: any }[] => (
    _.map(obj, (value, key: any) => ({ key: (!isNaN(key)) ? Number(key) : key, value }))
  )
}

@Pipe({ name: 'search' })
export class SearchPipe implements PipeTransform {
  transform = (listObject: any[], keys: string[], term: string): any[] => {
    if (listObject.length > 0  && keys && term) {
      return (listObject || [])
        .filter((item) => keys
          .some(key => item.hasOwnProperty(key) && new RegExp(term, 'gi')
            .test(item[key])));
    } else {
      return listObject;
    }
  }
}
