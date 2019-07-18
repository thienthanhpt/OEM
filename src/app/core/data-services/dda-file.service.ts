import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest } from '@angular/common/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { BaseModel, BaseService, DateMoment, SuccessResponse } from './base.service';
import { Attachment } from './attachment.service';

export const DDA_FILE_UPLOAD_FIELD_MAP = {
  name: 'file_name', content: 'file_content',
};

export class DdaFileUpload extends BaseModel {

  name: string = null;
  content: string = null;

  protected getFieldMap() {
    return super.getFieldMap(DDA_FILE_UPLOAD_FIELD_MAP);
  }
}

export const DDA_RECORD_FIELD_MAP = {
  customerName: 'customer_name', ref: 'dda_reference', msslNo: 'mssl_no', orderId: 'order_id', reasonMsg: 'other_reason',
  reasonCode: 'reason_code', isSuccessful: 'success_indicator',
};

export class DdaRecord extends BaseModel {

  customerName: string = null;
  ref: string = null;
  msslNo: string = null;
  orderId: string = null;
  reasonMsg: string = null;
  reasonCode: string = null;
  isSuccessful: boolean = null;

  protected getFieldMap() {
    return super.getFieldMap(DDA_RECORD_FIELD_MAP);
  }
}

export enum DdaFileType {
  FROM_BANK = 'from_bank', TO_BANK = 'to_bank',
}

export enum DdaFileStatus {
  SUCCESSFUL = 'successful', FAILED = 'failed', NEW = 'new',
}

export const DDA_FILE_FIELD_MAP = {
  name: 'name', numberOfRecord: 'number_of_record', createdTime: 'created_date', lastModified: 'last_modified_date',
  documentData: 'document', type: 'dda_type', status: 'status', note: 'note', ddaRecordsData: 'dda_records',
};

export class DdaFile extends BaseModel {

  id: number = null;
  name: string = null;
  numberOfRecord: number = null;
  lastModified = new DateMoment();
  status: DdaFileStatus = null;
  note: string = null;
  document: Attachment = null;
  ddaRecords: DdaRecord[] = [];

  summarize(): string {
    let str = '<span class="font-weight-bold">None</span>';
    if (this.status === DdaFileStatus.SUCCESSFUL) {
      const numberOfApprovedRecord = _.filter(this.ddaRecords, record => record.isSuccessful === true).length || 0;
      const numberOfRejectedRecord = this.ddaRecords.length - numberOfApprovedRecord;
      str = `<span class="font-weight-bold">${numberOfApprovedRecord} approved</span>`
            + '<br>'
            + `<span class="font-weight-bold text-danger">${numberOfRejectedRecord} rejected</span>`;
    }
    return str;
  }

  set ddaRecordsData(data: any) {
    if (!_.isEmpty(data)) {
      _.map(data, obj => this.ddaRecords.push(new DdaRecord().fromData(obj)));
    }
  }

  set documentData(data: object) {
    if (!_.isEmpty(data)) {
      this.document = new Attachment().fromData(data);
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(DDA_FILE_FIELD_MAP);
  }
}

function newDdaFile(data: object): DdaFile {
  return new DdaFile().fromData(data);
}

@Injectable()
export class DdaFileService extends BaseService<DdaFile> {

  protected baseUrl = 'pdda';

  generate(idList: number[]) {
    return this.http.post(`${this.baseUrl}/generate/`, { 'order_ids': idList }, this.getHttpConfigs());
  }

  upload(fileContent: string, fileName: string): Observable<HttpEvent<SuccessResponse>> {
    const uploadFile = new DdaFileUpload();
    uploadFile.name = fileName;
    uploadFile.content = fileContent;

    return this.http.request(new HttpRequest('POST', `${this.baseUrl}/`, uploadFile.toData(),
      _.assign({ reportProgress: true }, this.getHttpConfigs())
    ));
  }

  uploadComplete(rs: SuccessResponse): DdaFileUpload {
    return new DdaFileUpload().fromData(rs.data);
  }

  delete(id: number) {
    return this.http.post(`${this.baseUrl}/${id}/delete/`, this.getHttpConfigs());
  }

  protected newModel = (data: object) => newDdaFile(data);

  protected getFieldMap() {
    return super.getFieldMap(DDA_FILE_FIELD_MAP);
  }
}
