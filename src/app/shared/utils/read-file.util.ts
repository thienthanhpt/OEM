import { Observable, Subscriber } from 'rxjs';
import * as _ from 'lodash';

/**
 * Read the text contents of a File or Blob using the FileReader interface.
 * This is an async interface so it makes sense to handle it with Rx.
 * @param blob
 * @param isUploadFile use to discerm the function is readAsDataURL or readAsText.
 * @return Observable<string>
 */
export const readFile = (blob: File | Blob, isUploadFile?: boolean) => Observable.create((observer: Subscriber<string>) => {
  if (!(blob instanceof Blob)) {
    observer.error(new Error('`blob` must be an instance of File or Blob.'));
    return;
  }

  const reader = new FileReader();

  reader.onerror = err => observer.error(err);
  reader.onabort = err => observer.error(err);
  if (isUploadFile) {
    reader.onload = () => {
      if (_.isString(reader.result)) {
        observer.next(reader.result.split(',')[ 1 ]);
      }
    };

    reader.onloadend = () => observer.complete();
    return reader.readAsDataURL(blob);
  } else {

    reader.onload = () => {
      if (_.isString(reader.result)) {
        observer.next(reader.result);
      }
    };
    reader.onloadend = () => observer.complete();
    return reader.readAsText(blob);

  }
});
