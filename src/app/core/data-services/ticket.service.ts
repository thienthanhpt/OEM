import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import {
  BaseModel, BaseService, Customer, User, TicketTag, DateMoment, Attachment, SuccessResponse,
  SupportTransaction,
  CUSTOMER_FIELD_MAP, USER_FIELD_MAP,
} from './index';

export enum TicketDataTemplateType {
  Starhub = 'sh', Customer = 'customer', InternalUser = 'internal_user'
}

export const TICKET_DATA_TEMPLATE_OPTIONS: { [key: string]: string } = {
  [TicketDataTemplateType.Starhub]: 'Starhub',
  [TicketDataTemplateType.Customer]: 'Customer',
  [TicketDataTemplateType.InternalUser]: 'Internal User'
};

export const TICKET_CONTENT_FIELD_MAP = {
  name: ['name', 'string'], shortDescription: ['short_description', 'string'], fullContext: ['full_context', 'string'],
  specialRequest: ['special_request', 'string'], ticketData: ['ticket', 'object'], supportTransactionData: ['support', 'object'],
  reporterType: ['reporter', 'string'], userData: ['user', 'object'],
};

const TICKET_CONTENT_IGNORE_FIELDS = [ 'reporterType' ];

export class TicketContent extends BaseModel {
  name = '';
  fullContext = '';
  ticket: Ticket = null;
  supportTransaction: SupportTransaction = null;
  shortDescription = '';
  specialRequest = '';
  user: User = null;
  reporterType: TicketDataTemplateType = null;

  set ticketData(data: object) {
    if (!_.isEmpty) {
      this.ticket = new Ticket().fromData(data);
    }
  }

  set userData(data: object) {
    if (!_.isEmpty(data)) {
      this.user = new User().fromData(data);
    }
  }

  set supportTransactionData(data: object) {
    if (!_.isEmpty(data)) {
      this.supportTransaction = new SupportTransaction().fromData(data);
    }
  }

  get reporterTypeDisplay() {
    return TICKET_DATA_TEMPLATE_OPTIONS[this.reporterType] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(TICKET_CONTENT_FIELD_MAP);
  }

  protected getToDataIgnoredFields() {
    return super.getToDataIgnoredFields(TICKET_CONTENT_IGNORE_FIELDS);
  }
}


export enum TicketStepStatus {
  New = 'new', NotAvailable = 'na', Done = 'done'
}

export const TICKET_STEP_STATUS_OPTIONS: { [key: string]: string } = {
  [TicketStepStatus.New]: 'New',
  [TicketStepStatus.NotAvailable]: 'Not Available',
  [TicketStepStatus.Done]: 'Done'
};

export const TICKET_STEP_FIELD_MAP = {
  name: ['name', 'string'], previousStepData: ['previous_step', 'object'], nextStepData: ['next_step', 'object'],
  supervisorData: ['supervisor', 'object'], ticketData: ['ticket', 'object'], description: ['description', 'string'],
  content: ['content', 'string'], stepStatus: ['status', 'string'], previousStepId: ['previous_step_id', 'number'],
  nextStepId: ['next_step_id', 'number'], assigneeId: ['assignee_id', 'number'], supervisorId: ['supervisor_id', 'number'],
  workLog: ['work_log', 'number'], assigneeData: ['assignee', 'object'], isNotified: 'is_notified'
};

const TICKET_STEP_IGNORE_FIELDS = [ 'previousStepData', 'nextStepData', 'ticketData', 'assigneeData', 'supervisorData' ];

export class TicketStep extends BaseModel {
  name = '';
  previousStep: TicketStep = null;
  nextStep: TicketStep = null;
  assignee: User = null;
  supervisor: User = null;
  ticket: Ticket = null;
  description = '';
  isNotified = false;
  content = '';
  stepStatus: TicketStepStatus = null;
  workLog: number = null;

  set ticketData(data: object) {
    if (!_.isEmpty) {
      this.ticket = new Ticket().fromData(data);
    }
  }

  set assigneeData(data: object) {
    if (!_.isEmpty(data)) {
      this.assignee = new User().fromData(data);
    }
  }

  get assigneeId() {
    return _.get(this.assignee, 'id');
  }

  set supervisorData(data: object) {
    if (!_.isEmpty(data)) {
      this.supervisor = new User().fromData(data);
    }
  }

  get supervisorId() {
    return _.get(this.supervisor, 'id');
  }

  set previousStepData(data: object) {
    if (!_.isEmpty(data)) {
      this.previousStep = new TicketStep().fromData(data);
    }
  }

  get previousStepId() {
    return _.get(this.previousStep, 'id');
  }

  set nextStepData(data: object) {
    if (!_.isEmpty(data)) {
      this.nextStep = new TicketStep().fromData(data);
    }
  }

  get nextStepId() {
    return _.get(this.nextStep, 'id');
  }

  get stepStatusDisplay() {
    return TICKET_STEP_STATUS_OPTIONS[this.stepStatus] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(TICKET_STEP_FIELD_MAP);
  }

  protected getToDataIgnoredFields() {
    return super.getToDataIgnoredFields(TICKET_STEP_IGNORE_FIELDS);
  }

  validateRequestFields(options?: string[]) {
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

      _.set(data, dataField,  value);
    });

    const validatedData = {};
    _.forIn(data, (value, key) => {
      if (value !== '') {
        _.assign(validatedData, _.pick(data, key));
      }
    });
    return validatedData;
  }
}

export enum TicketStatus {
  New = 'new', Assigned = 'assigned', Doing = 'doing', Incomplete = 'incompleted', Done = 'done', Cancel = 'cancel'
}

export const TICKET_STATUS_OPTIONS: { [key: string]: string } = {
  [TicketStatus.New]: 'New',
  [TicketStatus.Assigned]: 'Assigned',
  [TicketStatus.Doing]: 'Doing',
  [TicketStatus.Incomplete]: 'Incomplete',
  [TicketStatus.Done]: 'Done',
  [TicketStatus.Cancel]: 'Rejected'
};

export const TICKET_FIELD_MAP = {
  name: ['ref', 'string'], reporterData: ['reporter', 'object'], customerData: ['customer', 'object'], assigneeData: ['assignee', 'object'],
  expectedStartDate: 'expected_start_date', expectedEndDate: 'expected_end_date', actualEndDate: 'actual_end_date',
  assignedDate: ['assigned_date', 'object'], note: ['notes', 'string'], referencedContractNo: ['contract_ref', 'string'],
  referencedInvoiceNo: ['invoice_ref', 'string'], ticketDataTemplateType: ['data_template', 'string'],
  timeConsumed: 'time_consuming', timeAge: 'time_age', vote: ['vote', 'number'], evaluationComment: ['evaluation_comment', 'string'],
  parentTicket: ['parent_ticket', 'string'], tagsData: ['tags', 'object'], currentStepName: ['current_step', 'string'],
  lastMessageFromSystem: ['last_message_from_system', 'string'], ticketStatus: ['status', 'string'], contractNo: ['contract_no', 'string'],
  invoiceNo: ['invoice_no', 'string'], ticketContentData: ['ticket_content', 'object'],
  customerId: ['customer_id', 'number'], supervisorId: ['supervisor_id', 'number'], shortDescription: ['short_description', 'string'],
  supervisorData: ['supervisor', 'object'], ticketDocumentsData: ['documents', 'object'], assigneeId: ['assignee_id', 'number'],
  keywords: ['keywords', 'string'], relatedTickets: ['ref_ticket', 'string'],
};

const TICKET_IGNORE_FIELDS = [
  'referencedTicketData', 'timeAge', 'timeConsumed', 'invoiceNo', 'contractNo', 'ticketDocumentsData',
  'lastMessageFromSystem', 'name', 'shortDescription', 'currentStepName', 'tagsData', 'ticketContentData',
  'reporterData', 'customerData', 'assigneeData', 'supervisorData'
];

export class Ticket extends BaseModel {
  actualEndDate = new DateMoment();
  assignedDate = new DateMoment();
  assignee: User = null;
  contractNo = '';
  referencedContractNo = '';
  customer: Customer = null;
  expectedEndDate = new DateMoment();
  expectedStartDate = new DateMoment();
  evaluationComment = '';
  invoiceNo = '';
  referencedInvoiceNo = '';
  lastMessageFromSystem = '';
  name = '';
  note = '';
  parentTicket = '';
  relatedTickets = '';
  reporter: Customer = null;
  supervisor: User = null;
  tags: TicketTag[] = [];
  ticketDataTemplateType: TicketDataTemplateType = null;
  ticketStatus: TicketStatus = null;
  timeAge: number = null;
  timeConsumed: number = null;
  vote: number = null;
  keywords = '';
  ticketContent: TicketContent = null;
  ticketDocuments: Attachment[] = [];
  shortDescription = '';
  currentStepName = '';

  set customerData(data: object) {
    if (!_.isEmpty(data)) {
      this.customer = new Customer().fromData(data);
    }
  }

  get customerId() {
    return _.get(this.customer, 'id');
  }

  set reporterData(data: object) {
    if (!_.isEmpty(data)) {
      this.reporter = new Customer().fromData(data);
    }
  }

  set assigneeData(data: object) {
    if (!_.isEmpty(data)) {
      this.assignee = new User().fromData(data);
    }
  }

  get assigneeId() {
    return _.get(this.assignee, 'id');
  }

  set supervisorData(data: object) {
    if (!_.isEmpty(data)) {
      this.supervisor = new User().fromData(data);
    }
  }

  get supervisorId() {
    return _.get(this.supervisor, 'id');
  }

  get relatedTicketArray() {
    if (!_.isEmpty(this.relatedTickets)) {
      return this.relatedTickets.replace(/\s/g, '').split(',');
    } else {
      return [];
    }
  }

  set ticketContentData(data: object) {
    if (!_.isEmpty(data)) {
      this.ticketContent = new TicketContent().fromData(data);
    }
  }

  set ticketDocumentsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.ticketDocuments = _.map(dataArray, data => new Attachment().fromData(data));
    }
  }

  set tagsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.tags = _.map(dataArray, data => new TicketTag().fromData(data));
    }
  }

  get ticketDataTemplateTypeDisplay() {
    return TICKET_DATA_TEMPLATE_OPTIONS[this.ticketDataTemplateType] || null;
  }

  get ticketStatusDisplay() {
    return TICKET_STATUS_OPTIONS[this.ticketStatus] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(TICKET_FIELD_MAP);
  }

  protected getToDataIgnoredFields() {
    return super.getToDataIgnoredFields(TICKET_IGNORE_FIELDS);
  }
}

function newTicket(data: object): Ticket {
  return new Ticket().fromData(data);
}

@Injectable()
export class TicketService extends BaseService<Ticket> {

  protected baseUrl = 'ticket';

  protected newModel = (data: object) => newTicket(data);

  updatePartialTicketContent(ticketContent: TicketContent, updateFields: string[]): Observable<TicketContent> {
    return this.http.patch(`${this.baseUrl}/${ticketContent.ticket.id}/content/${ticketContent.id}/`,
                                  ticketContent.toData(updateFields), this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new TicketContent().fromData(rs.data)));
  }

  fetchAllSteps(ticketId: number): Observable<{ items: TicketStep[] }> {
    return this.http.get(`${this.baseUrl}/${ticketId}/step/`, this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => ({ items: _.map(rs.data, row => new TicketStep().fromData(row)) })));
  }

  createStep(step: TicketStep): Observable<TicketStep> {
    return this.http.post( `${this.baseUrl}/${step.ticket.id}/step/`, step.validateRequestFields(), this.getHttpConfigs())
      .pipe(map( (rs: SuccessResponse) => new TicketStep().fromData(rs.data)));
  }

  updatePartialStep(step: TicketStep, updateFields: string[]): Observable<TicketStep> {
    return this.http.patch(`${this.baseUrl}/${step.ticket.id}/step/${step.id}/`, step.toData(updateFields), this.getHttpConfigs())
      .pipe(map((rs: SuccessResponse) => new TicketStep().fromData(rs.data)));
  }

  protected getFieldMap() {
    return super.getFieldMap(TICKET_FIELD_MAP);
  }

  protected getSortFieldMap() {
    return super.getSortFieldMap({
      reporter: CUSTOMER_FIELD_MAP,
      customer: CUSTOMER_FIELD_MAP,
      assignee: USER_FIELD_MAP,
      supervisor: USER_FIELD_MAP
    });
  }
}
