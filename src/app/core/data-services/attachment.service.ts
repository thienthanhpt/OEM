import { Injectable } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
import { HttpEvent } from '@angular/common/http/src/response';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { BaseModel, BaseService, SuccessResponse } from './base.service';

const ATTACHMENT_REQUEST_FIELD_MAP = {
  fileName: 'file_name', fileContent: 'file_content', resourceModel: 'resource_model', resourceId: 'resource_id',
  isStored: 'is_stored',
};

class AttachmentRequest extends BaseModel {

  fileName: string = null;
  fileContent: string = null;
  resourceModel: string = null;
  resourceId: number = null;
  isStored: boolean = null;

  protected getFieldMap() {
    return super.getFieldMap(ATTACHMENT_REQUEST_FIELD_MAP);
  }
}

export enum ResourceModel {
  Consumer = 'consumer', Contract = 'contract', Customer = 'customer', Invoice = 'invoice', Order = 'sseorder'
}

export const RESOURCE_MODEL_OPTIONS: { [key: string]: string } = {
  [ResourceModel.Consumer]: 'Consumer',
  [ResourceModel.Contract]: 'Contract',
  [ResourceModel.Customer]: 'Customer',
  [ResourceModel.Invoice]: 'Invoice',
  [ResourceModel.Order]: 'Order',
};

export const ATTACHMENT_FIELD_MAP = {
  name: 'name', displayName: 'display_name', server: 'server', filePath: 'file_path', fileType: 'file_type',
  isStored: 'is_stored', previewImages: 'preview_images', resourceModel: 'resource_model', resourceId: 'resource_id'
};

const ATTACHMENT_IGNORE_FIELDS = [ 'name', 'displayName', 'server', 'fileType', 'previewImages' ];

export class Attachment extends BaseModel {

  name = '';
  displayName = '';
  server = '';
  filePath = '';
  fileType = '';
  isStored: boolean = null;
  previewImages: string[];
  resourceModel = '';
  resourceId: number = null;

  get fullFilePath() {
    return 'http://' + this.filePath;
  }

  get resourceModelDisplay() {
    return RESOURCE_MODEL_OPTIONS[this.resourceModel] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(ATTACHMENT_FIELD_MAP);
  }

  protected getToDataIgnoredFields() {
    return super.getToDataIgnoredFields(ATTACHMENT_IGNORE_FIELDS);
  }
}

function newAttachment(data: object): Attachment {
  return new Attachment().fromData(data);
}

@Injectable()
export class AttachmentService extends BaseService<Attachment> {

  protected baseUrl = 'attach';

  protected newModel = (data: object) => newAttachment(data);

  fetchImages(attachmentId: number): Observable<Attachment> {
    return this.http.get(`${this.baseUrl}/${attachmentId}/?preview=True`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new Attachment().fromData(rs.data)));
  }

  upload(content: string, fileName: string, resourceModel: string, resourceId: number): Observable<HttpEvent<SuccessResponse>> {
    const attachmentRequest = new AttachmentRequest();
    attachmentRequest.resourceModel = resourceModel;
    attachmentRequest.resourceId = resourceId;
    attachmentRequest.fileName = fileName;
    attachmentRequest.fileContent = content;
    attachmentRequest.isStored = true;

    return this.http.request(new HttpRequest('POST', `${this.baseUrl}/`, attachmentRequest.toData(),
      _.assign({ reportProgress: true }, this.getHttpConfigs())
    ));
  }

  uploadToReplace(
    content: string, fileName: string, resourceModel: string, resourceId: number, originAssetId: number
    ): Observable<HttpEvent<SuccessResponse>> {
    const attachmentRequest = new AttachmentRequest();
    attachmentRequest.resourceModel = resourceModel;
    attachmentRequest.resourceId = resourceId;
    attachmentRequest.fileName = fileName;
    attachmentRequest.fileContent = content;
    attachmentRequest.isStored = true;

    return this.http.request(new HttpRequest('PUT', `${this.baseUrl}/${originAssetId}/`, attachmentRequest.toData(),
      _.assign({ reportProgress: true }, this.getHttpConfigs())
    ));
  }

  uploadComplete(rs: SuccessResponse): Attachment {
    return this.newModel(rs.data);
  }

  removeAttachment(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/delete/`, this.getHttpConfigs());
  }
}
