import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, DateMoment, Attachment } from './index';


export enum MailStatus {
  Send = 'sent',
  Draft = 'draft',
  Queued = 'queued',
  Failed = 'failed',
  Cancel = 'cancel',
  Received = 'received',
}

export const MAIL_STATUS_OPTIONS: { [key: string]: string } = {
  [MailStatus.Send]: 'Sent',
  [MailStatus.Draft]: 'Draft',
  [MailStatus.Queued]: 'Queued',
  [MailStatus.Failed]: 'Failed',
  [MailStatus.Cancel]: 'Cancel',
  [MailStatus.Received]: 'Received',
};

export enum MailContentType {
  Html = 'html',
  Plan = 'plan',
}

export const MAIL_CONTENT_TYPE_OPTIONS: { [key: string]: string } = {
  [MailContentType.Html]: 'Html',
  [MailContentType.Plan]: 'Plan',
};

export const MAIL_FIELD_MAP = {
  subject: 'subject', emailTo: 'to_emails', emailCC: 'cc_emails', status: 'status', content: 'content',
  reasonFail: 'fail_reason', scheduleSendingTime: 'schedule_time_sending', contentType: 'mail_content_type',
  documentsData: 'attachments',
  createdTime: 'created_date', updatedTime: 'last_modified_date',
};

export class Mail extends BaseModel {
  subject: string = null;
  emailTo: string = null;
  emailCC: string = null;
  status: MailStatus = null;
  content: string = null;
  contentType: MailContentType = null;
  reasonFail: string = null;
  scheduleSendingTime = new DateMoment();
  documents: Attachment[] = null;


  set documentsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.documents = _.map(dataArray, data => new Attachment().fromData(data));
    }
  }

  get statusDisplay() {
    return MAIL_STATUS_OPTIONS[this.status] || null;
  }

  get contentTypeDisplay() {
    return MAIL_CONTENT_TYPE_OPTIONS[this.contentType] || null;
  }

  get contentIframeDisplay() {
    return `data:text/html;charset=utf-8,${escape(this.content)}`;
  }

  protected getFieldMap() {
    return super.getFieldMap(MAIL_FIELD_MAP);
  }
}

function newMail(data: object): Mail {
  return new Mail().fromData(data);
}

@Injectable()
export class MailService extends BaseService<Mail> {

  protected baseUrl = 'mail';

  protected newModel = (data: object) => newMail(data);

  protected getFieldMap() {
    return super.getFieldMap(MAIL_FIELD_MAP);
  }
}
