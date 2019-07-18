import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { BaseModel, BaseService, DateMoment } from './base.service';
import { Transaction } from './transaction.service';
import { Attachment } from './attachment.service';
import { AccountType, VoltageType, ACCOUNT_TYPE_OPTIONS, VOLTAGE_TYPE_OPTIONS } from './consumer.service';
import { CustomerType, CUSTOMER_TYPE_OPTIONS } from './customer.service';

export const ORDER_ITEM_ATTRIBUTE_FIELD_MAP = {
  attributeId: 'attrid', actionCode: 'actioncode', name: 'name', value: 'value', previousValue: 'prevvalue',
};

export class OrderItemAttribute extends BaseModel {

  attributeId: string = null;
  actionCode: string = null;
  name: string = null;
  value: string = null;
  previousValue: string = null;

  protected getFieldMap() {
    return super.getFieldMap(ORDER_ITEM_ATTRIBUTE_FIELD_MAP);
  }
}

export const ORDER_ITEM_FIELD_MAP = {
  itemId: 'itemid', parentItemId: 'parentitemid', rootItemId: 'rootitemid', actionCode: 'actioncode', amount: 'amount',
  period: 'period', billingAccount: 'billingaccount', billingCycle: 'billingcycle', attributesData: 'orderattributes',
  partNumber: 'partnumber', productName: 'productname', productType: 'producttype', serviceId: 'serviceid',
  serviceAddress: 'serviceaddress', previousServiceId: 'prevserviceid', mergedDocumentData: 'merged_doc',
  productRate: 'productrate', contractRef: 'productref', contractSignedDate: 'product_signed_date'
};

export class OrderItem extends BaseModel {

  itemId: string = null;
  parentItemId: string = null;
  rootItemId: string = null;
  actionCode: string = null;
  amount: number = null;
  period: number = null;
  billingAccount: number = null;
  billingCycle: string = null;
  attributes: OrderItemAttribute[] = [];
  partNumber: string = null;
  productName: string = null;
  productType: string = null;
  serviceId: string = null;
  serviceAddress: string = null;
  previousServiceId: string = null;
  mergedDocument: Attachment = null;
  productRate: string = null;
  contractRef: string = null;
  contractSignedDate = new DateMoment();

  set attributesData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.attributes = _.map(dataArray, data => new OrderItemAttribute().fromData(data));
    }
  }

  set mergedDocumentData(data: object) {
    if (!_.isEmpty(data)) {
      this.mergedDocument = new Attachment().fromData(data);
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(ORDER_ITEM_FIELD_MAP);
  }
}

export enum OrderTransactionType {
  Subscription = 'subscription',
  Termination = 'termination',
  Relocation = 'relocation',
}

export const ORDER_PROMOTION_AMOUNT_FIELD_MAP = {
  fixed: 'fixed', percent: 'percent'
};

export class PromotionAmount extends BaseModel {
  fixed: number = null;
  percent: number = null;

  protected getFieldMap() {
    return super.getFieldMap(ORDER_PROMOTION_AMOUNT_FIELD_MAP);
  }
}

export const ORDER_FIELD_MAP = {
  no: 'ordernumber', type: 'ordertype', orderId: 'orderid', orderDate: 'orderdate', itemsData: 'orderitems', documentId: 'docid',
  documentIdType: 'docidtype', customerName: 'fullname', customerEmail: 'emailaddress', customerPhoneNumber: 'mobileno',
  terminationReason: 'reason', revision: 'revision', transactionType: 'transactiontype',
  customerType: 'customertype', customerAddress: 'address', consumerAccountType: 'consumertype', consumerVoltageType: 'voltagetype',
  promotionCode: 'promotion_code', promotionAmountData: 'promotion_amount', customerId: 'customer_id',
};

export class Order extends BaseModel {

  no: string = null;
  type: string = null;
  orderId: string = null;
  orderDate = new DateMoment();
  items: OrderItem[] = null;
  documentId: string = null;
  documentIdType: string = null;
  customerName: string = null;
  customerEmail: string = null;
  customerPhoneNumber: string = null;
  terminationReason: string = null;
  revision: string = null;
  transaction: Transaction = null;
  transactionType: OrderTransactionType = null;
  customerId: number = null;
  customerType: CustomerType = null;
  customerAddress: string = null;
  consumerAccountType: AccountType = null;
  consumerVoltageType: VoltageType = null;
  promotionCode: string = null;
  promotionAmount: PromotionAmount = null;

  rootItem: OrderItem = null;

  get consumerAccountTypeDisplay() {
    return ACCOUNT_TYPE_OPTIONS[this.consumerAccountType] || null;
  }
  get consumerVoltageTypeDisplay() {
    return VOLTAGE_TYPE_OPTIONS[this.consumerVoltageType] || null;
  }

  get customerTypeDisplay() {
    return CUSTOMER_TYPE_OPTIONS[this.customerType] || null;
  }

  get promotionAmountDisplay() {
    return Math.abs(this.promotionAmount.fixed) || 0;
  }

  set itemsData(dataArray: object[]) {
    if (!_.isEmpty(dataArray)) {
      this.items = _.map(dataArray, data => new OrderItem().fromData(data));
      this.rootItem = _.find(this.items, { productType: 'Root Product' });
    }
  }

  set promotionAmountData(data: object) {
    if (!_.isEmpty(data)) {
      this.promotionAmount = new PromotionAmount().fromData(data);
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(ORDER_FIELD_MAP);
  }
}

function newOrder(data: object) {
  return new Order().fromData(data);
}

@Injectable()
export class OrderService extends BaseService<Order> {

  protected baseUrl = '';

  protected newModel = (data: object) => newOrder(data);

  protected getFieldMap() {
    return super.getFieldMap(ORDER_FIELD_MAP);
  }
}
