import { Component, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';

import { NGXLogger } from 'ngx-logger';
import * as _ from 'lodash';

import {
  Consumer, ConsumerCharge, ConsumerChargeType, ConsumerChargeTemplate, Invoice, ErrorResponse,
  ConsumerService, InvoiceService, DiscountType, DISCOUNT_TYPE_OPTIONS
} from '@app/core/index';
import { AlertService, ModalService } from '../../shared/index';
import { ModalAction } from '../consumer-form.component';
import { arrayReplace } from '../../../shared/index';
import { AdminConfig } from '../../shared/configs/admin.config';


@Component({
  selector: 'admin-consumer-charge-table',
  templateUrl: 'consumer-charge-table.component.html',
})
export class ConsumerChargeTableComponent implements OnChanges {

  @Input() consumer: Consumer;
  @Input() items: ConsumerCharge[] = null;
  @Input() hideAction = false;

  @ViewChild('consumerChargeModal') consumerChargeModal: TemplateRef<any>;

  ConsumerChargeType = ConsumerChargeType;

  modalAction: ModalAction;
  modalChargeType: ConsumerChargeType;

  isChargeTemplateLoading = false;

  consumerChargeToProcess: ConsumerCharge;
  lastInvoice: Invoice = null;
  chargeTemplateList: { [name: string]: ConsumerChargeTemplate[] } = {};
  adminConfig = AdminConfig;
  DiscountType = DiscountType;
  discountTypeOptions = DISCOUNT_TYPE_OPTIONS;

  constructor(
    protected dataService: ConsumerService,
    protected invoiceService: InvoiceService,
    protected logger: NGXLogger,
    public modal: ModalService,
    protected alertService: AlertService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    const { consumer } = changes;
    if (consumer && ((_.get(consumer.currentValue, 'id')) && (!_.get(consumer.previousValue, 'id')))) {
      this.dataService.fetchAllCharges(consumer.currentValue.id).subscribe(collection => this.items = collection.items);
    }
  }

  openCreateConsumerChargeModal(chargeType: ConsumerChargeType) {
    this.initConsumerCharge(chargeType);
    this.modal.open(this.consumerChargeModal, 'md');
  }

  initConsumerCharge(chargeType: ConsumerChargeType, additionalCharge?: ConsumerCharge) {
    if (!this.chargeTemplateList[chargeType]) {
      this.isChargeTemplateLoading = true;
      this.dataService.fetchTemplatesByChargeType(chargeType).subscribe(
        collection => (this.chargeTemplateList[chargeType] = collection.items) && (this.isChargeTemplateLoading = false),
        this.onError
      );
    }

    if ((chargeType === ConsumerChargeType.USave) && (this.lastInvoice === null)) {
      this.isChargeTemplateLoading = true;
      this.invoiceService.fetchAll({ 'consumer.id': this.consumer.id }, { limit: 1, sortBy: 'id', sortAsc: false })
        .subscribe(collection => (this.lastInvoice = collection.items[0]) && (this.isChargeTemplateLoading = false));
    }

    this.modalChargeType = chargeType;
    if (additionalCharge) {
      this.consumerChargeToProcess = _.cloneDeep(additionalCharge);
      this.modalAction = 'update';
    } else {
      this.consumerChargeToProcess = new ConsumerCharge();
      this.consumerChargeToProcess.consumerId = this.consumer.id;
      this.modalAction = 'create';
    }
  }

  onConsumerChargeSubmit() {
    if (this.modalAction === 'create') {
      // The UI of U-save charge does not need to select template, so assign the only template of U-save to it
      // This template is for display purpose only
      if (this.modalChargeType === ConsumerChargeType.USave) {
        this.consumerChargeToProcess.template = this.chargeTemplateList[ConsumerChargeType.USave][0];
      }
      this.dataService.createCharge(this.consumerChargeToProcess)
        .subscribe(charge => this.onConsumerChargeSubmitSuccess(charge));
    } else {
      this.dataService.updateCharge(this.consumerChargeToProcess)
        .subscribe(charge => this.onConsumerChargeSubmitSuccess(charge));
    }
  }

  onRemoveConsumerCharge() {
    this.dataService.removeCharge(this.consumerChargeToProcess).subscribe(
      () => _.remove(this.items, { id: this.consumerChargeToProcess.id }) && this.modal.hide(),
      (error) => {
        this.onError(error);
        this.modal.hide();
      }
    );
  }

  selectConsumerChargeTemplateById(id: any) {
    this.consumerChargeToProcess.template = _.find(this.chargeTemplateList[this.modalChargeType], { id: Number(id) });
  }

  protected onConsumerChargeSubmitSuccess(charge: ConsumerCharge) {
    if (this.modalAction === 'create') {
      this.items.push(charge);
    } else {
      arrayReplace(this.items, { id: charge.id }, charge);
    }

    this.logger.debug(this.modalAction === 'create' ? 'Created' : 'Updated', charge);
    this.alertService.success(`Charge is ${(this.modalAction === 'create') ? 'created' : 'updated'} successfully.`, true);

    this.modal.hide();
  }

  protected onError = (error: ErrorResponse) => {
    this.alertService.clear();
    this.alertService.error(error.message, true);
  }
}
