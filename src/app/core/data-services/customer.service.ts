import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, Attachment, SaleTeam, Consumer } from './index';

export enum IdentificationType {
  NricPink = 'nric - pink',
  NricBlue = 'nric - blue',
  EmploymentPass = 'employment pass',
  WorkPermit = 'work permit',
}

export const IDENTIFICATION_TYPE_OPTIONS: { [key: string]: string } = {
  [IdentificationType.NricPink]: 'NRIC – Pink',
  [IdentificationType.NricBlue]: 'NRIC – Blue',
  [IdentificationType.EmploymentPass]: 'Employment pass',
  [IdentificationType.WorkPermit]: 'Work permit',
};

export enum CustomerType {
  Residential = 'r', Commercial = 'c', Industrial = 'i',
  Governmental = 'g', NotAvailable = 'n',
}

export const CUSTOMER_TYPE_OPTIONS: { [key: string]: string } = {
  [CustomerType.Residential]: 'Residential',
  [CustomerType.Commercial]: 'Commercial',
  [CustomerType.Industrial]: 'Industrial',
  [CustomerType.Governmental]: 'Governmental',
  [CustomerType.NotAvailable]: 'N/A',
};

export enum Country {
  Singapore = 1, Malaysia = 2, Indonesia = 3, Australia = 4,
  Vietnam = 5, Cambodia = 6, Thailand = 7, Philippines = 8,
}

export const COUNTRY_OPTIONS: { [key: number]: string } = {
  [Country.Singapore]: 'Singapore',
  [Country.Malaysia]: 'Malaysia',
  [Country.Indonesia]: 'Indonesia',
  [Country.Australia]: 'Australia',
  [Country.Vietnam]: 'Vietnam',
  [Country.Cambodia]: 'Cambodia',
  [Country.Thailand]: 'Thailand',
  [Country.Philippines]: 'Philippines',
};

export const CUSTOMER_FIELD_MAP = {
  id: 'cuid', spAccountNo: 'ss_acc', type: 'c_type', name: 'customer', gstRegisteredNo: 'gst',
  identificationNo: 'uen', documentsData: 'documents',
  identificationDocumentData: 'nric_acra_doc', identificationDocumentId: 'nric_acra_docid',
  postalCode: 'postal', address: 'address', country: 'country', saleTeamId: 'sale_id',
  emailAddress: 'emailaddress', mobilePhone: 'mobileno', saleTeamData: 'sale', identificationType: 'id_type',
  consumersData: 'consumers'
};

const CUSTOMER_IGNORE_FIELDS = [ 'spAccountNo' ];

export class Customer extends BaseModel {

  spAccountNo: string = null;
  type: CustomerType = null;
  name: string = null;
  gstRegisteredNo: string = null;
  identificationNo: string = null;
  documents: Attachment[] = null;
  identificationDocument: Attachment = null;
  postalCode: string = null;
  address: string = null;
  country: Country = null;
  saleTeam: SaleTeam = null;
  emailAddress: string = null;
  mobilePhone: string = null;
  identificationType: string = null;
  consumers: Consumer[] = null;

  set saleTeamData(data: object) {
    if (!_.isEmpty(data)) {
      this.saleTeam = new SaleTeam().fromData(data);
    }
  }
  get saleTeamId() {
    return _.get(this.saleTeam, 'id');
  }

  set documentsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.documents = _.map(dataArray, data => new Attachment().fromData(data));
    }
  }

  set consumersData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.consumers = _.map(dataArray, data => new Consumer().fromData(data));
    }
  }

  get identificationTypeDisplay() {
    return IDENTIFICATION_TYPE_OPTIONS[this.identificationType] || null;
  }

  get identificationDocumentId() {
    return _.get(this.identificationDocument, 'id');
  }

  set identificationDocumentData(data: object) {
    if (!_.isEmpty(data)) {
      this.identificationDocument = new Attachment().fromData(data);
    }
  }

  get typeDisplay() {
    return CUSTOMER_TYPE_OPTIONS[this.type] || null;
  }

  get countryDisplay() {
    return COUNTRY_OPTIONS[this.country] || null;
  }

  protected getFieldMap() {
    return super.getFieldMap(CUSTOMER_FIELD_MAP);
  }

  protected getToDataIgnoredFields() {
    return super.getToDataIgnoredFields(CUSTOMER_IGNORE_FIELDS);
  }
}

function newCustomer(data: object): Customer {
  return new Customer().fromData(data);
}

@Injectable()
export class CustomerService extends BaseService<Customer> {

  protected baseUrl = 'customer';

  protected newModel = (data: object) => newCustomer(data);

  protected getFieldMap() {
    return super.getFieldMap(CUSTOMER_FIELD_MAP);
  }
}
