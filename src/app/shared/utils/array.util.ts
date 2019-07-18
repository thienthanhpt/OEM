import * as _ from 'lodash';

/**
 * Replace a object in array by identify
 * @param collection is array contains the replace object
 * @param identity is key to find old object, to identify object will be replaced
 * @param replacement is object will replace old object in array
 */
export function arrayReplace(collection: object[], identity: any, replacement: object) {
  const index = _.indexOf(collection, _.find(collection, identity));
  collection.splice(index, 1, replacement);
}
