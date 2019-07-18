import { Component, Injector, ViewChild } from '@angular/core';

import { DataTableParams } from '@app/libs/data-table/components/types';
import { TabsetComponent } from 'ngx-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';

import { arrayReplace } from '@app/shared';
import {
  Consumer, ConsumerMeter, Customer, Contract, Invoice, Retailer, Attachment, ConsumerStatus,
  ConsumerChargeType, CustomerType, ErrorResponse, ConsumerService, ConsumerMeterService, CustomerService, InvoiceService,
  ContractService, RetailerService, ContractStatus, Model, UsageDataMeter, UsageDataMeterService,
  VOLTAGE_TYPE_OPTIONS, ACCOUNT_TYPE_OPTIONS, CONSUMER_DEACTIVATE_REASONS, CONSUMER_METER_TYPE_OPTIONS, MODEL_OPTIONS,
} from '@app/core';
import { FormComponent } from '../shared/index';
import { ConsumerChargeTableComponent } from './components/consumer-charge-table.component';


export type ModalAction = 'create' | 'update';

@Component({
  selector: 'admin-consumer-form',
  templateUrl: 'consumer-form.component.html',
})
export class ConsumerFormComponent extends FormComponent<Consumer, ConsumerService> {

  modelName = 'Consumer';

  @ViewChild(TabsetComponent) tabsRef: TabsetComponent;
  @ViewChild(ConsumerChargeTableComponent) consumerChargeTable: ConsumerChargeTableComponent;

  meterServicesPagination: DataTableParams = {
    limit: 1000,
    sortBy: 'created_date',
    sortAsc: false,
    offset: 0,
  };

  invoicePagination: DataTableParams = {
    limit: 10,
    sortBy: 'period',
    sortAsc: false,
    offset: 0,
  };

  contractPagination: DataTableParams = {
    limit: 10,
    sortBy: 'plannedEndDate.moment',
    sortAsc: false,
    offset: 0,
  };

  usageDataMeterPagination: DataTableParams = {
    limit: 10,
    sortBy: 'created_date',
    sortAsc: false,
    offset: 0,
  };

  meterPagination: DataTableParams = {
    limit: 10,
    sortBy: 'created_date',
    sortAsc: false,
    offset: 0,
  };

  voltageTypeOptions = VOLTAGE_TYPE_OPTIONS;
  accountTypeOptions = ACCOUNT_TYPE_OPTIONS;
  consumerMeterTypeOptions = CONSUMER_METER_TYPE_OPTIONS;

  customerList: Customer[] = [];

  meters: ConsumerMeter[] = [];
  meterCount = 0;

  usageDataMeters: UsageDataMeter[] = [];
  usageDataMeterCount = 0;

  invoices: Invoice[] = [];
  invoiceCount = 0;

  contracts: Contract[] = [];
  contractCount = 0;

  // this is the competitors of Sunseap used when we deactivate consumer
  retailerList: Retailer[] = [];
  selectedRetailer: Retailer = null;

  documentsToDownload: Attachment[];

  consumerMeterToProcess: ConsumerMeter;

  modalAction: ModalAction;

  consumerDeactivateReasons = CONSUMER_DEACTIVATE_REASONS;

  ContractStatus = ContractStatus;
  ConsumerStatus = ConsumerStatus;
  ConsumerChargeType = ConsumerChargeType;

  CustomerType = CustomerType;

  listFilter: { [name: string]: string | number} = {
    contractId: null,
  };

  listContractIds: number[] = null;

  redirectToCreateContract = false;

  customer: Customer = null;
  isCustomerLoading = false;

  constructor(
    injector: Injector,
    protected dataService: ConsumerService,
    protected customerService: CustomerService,
    protected consumerMeterService: ConsumerMeterService,
    protected contractService: ContractService,
    protected invoiceService: InvoiceService,
    protected retailerService: RetailerService,
    protected usageDataMeterService: UsageDataMeterService,
  ) {
    super(injector);
    this.model = new Consumer();
    this.selectedRetailer = new Retailer();
    this.consumerMeterToProcess = new ConsumerMeter();
  }

  protected onFetchModelFinished = () => {

    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.Consumer]));

    if (this.is(['new', 'edit'])) {
      this.isCustomerLoading = true;
      this.customerService
        .fetchAll()
        .subscribe(collection => {
          this.customerList = collection.items;
          if (this.route.snapshot.queryParams[ 'customerId' ]) {
            this.selectById(this.route.snapshot.queryParams[ 'customerId' ], 'model.customer', 'customerList');
          }
          this.isCustomerLoading = false;
        });
    } else {
      this.isCustomerLoading = true;
      this.customerService.fetchOne(this.model.customerId).subscribe((customer) => {
        this.customer = customer;
        this.isCustomerLoading = false;
      });
    }

    if (this.model.id) {
      this.reloadMeterServices(this.meterServicesPagination);
      this.reloadContracts(this.contractPagination);
      this.reloadMeterReadings(this.usageDataMeterPagination);
      this.reloadMeters(this.meterPagination);

      this.retailerService.fetchAll( { 'isCompetitor': true } )
        .subscribe(collection => this.retailerList = collection.items);
    }
  }

  selectCustomerName(id: number) {
    this.selectById(id, 'model.customer', 'customerList');
    this.model.customerId = Number(id);
  }

  openCreateConsumerChargeModal(consumerChargeType: ConsumerChargeType) {
    this.consumerChargeTable.openCreateConsumerChargeModal(consumerChargeType);
  }

  setListFilter(key: string, item: Contract) {
    switch (key) {
      case 'contract':
        this.listFilter.contractId = item.id;
        this.reloadInvoices(this.invoicePagination);

        this.setActiveTab('invoices');
        break;
    }
  }

  removeListFilter(key: string) {
    switch (key) {
      case 'contract':
        this.listFilter.contractId = null;
        this.reloadInvoices(this.invoicePagination);
        break;
    }
  }

  setActiveTab(tabName: string) {
    _.find(this.tabsRef.tabs, { id: `${tabName}-tab` }).active = true;
  }

  reloadMeterServices(params: DataTableParams) {
    if (this.model.id) {
      this.consumerMeterService.fetchAll({ 'consumer.id': this.model.id }, params).subscribe(
        (collection) => (this.model.consumerMeters = collection.items),
        (error: ErrorResponse) => (this.alertService.error(error.message)));
    }
  }

  reloadMeterReadings(params: DataTableParams) {
    if (this.model.id) {
      this.usageDataMeterService.fetchAll( { 'consumerId': this.model.id }, params )
        .subscribe( (collection) => {
          this.usageDataMeters = collection.items;
          this.usageDataMeterCount = collection.meta.count;
        } );
    }
  }

  reloadMeters(params: DataTableParams) {
    if (this.model.id) {
      this.consumerMeterService.fetchAll( { 'consumer.id': this.model.id }, params )
        .subscribe( (collection) => {
          this.meters = collection.items;
          this.meterCount = collection.meta.count;
        } );
    }
  }

  reloadContracts(params: DataTableParams) {
    // check if model is loaded
    if (this.model.id) {
      this.contractService.fetchAll({ 'consumer.id': this.model.id }, params).subscribe(
        (collection) => {
          this.contracts = collection.items;
          this.contractCount = collection.meta.count;

          // contracts will be loaded once, so "listContractIds" will be not changed
          this.listContractIds = _.map(collection.items, 'id');
          if (!_.isEmpty(this.listContractIds)) {
            this.reloadInvoices(this.invoicePagination);
          }
        });
    }
  }

  reloadInvoices(params: DataTableParams) {
    // check if model is loaded
    if (this.model.id) {
      const contractId = this.listFilter.contractId || this.listContractIds;

      if (contractId) {
        this.invoiceService.fetchAll({ 'contract.id': contractId }, params)
          .subscribe(collection => (this.invoices = collection.items) && (this.invoiceCount = collection.meta.count));
      }
    }
  }

  reloadDocuments = (attachments?: Attachment[]) => {
    if (attachments) {
      this.model.documents = attachments;
    }
  }

  uploadSuccess(attachment: Attachment) {
    this.model.lastRetailerBillDocuments.push(attachment);
    this.modal.hide();
    this.isLoading = true;
    this.dataService.updatePartial(this.model, [ 'lastRetailerBillDocumentIds' ]).subscribe(
      (model: Consumer) => {
        this.isLoading = false;
        this.reloadDocuments(model.documents);
      }, (error) => this.onError(error));
  }

  initConsumerMeter(consumerMeter?: ConsumerMeter) {
    if (consumerMeter) {
      this.modalAction = 'update';
      this.consumerMeterToProcess = _.cloneDeep(consumerMeter);
    } else {
      this.modalAction = 'create';
      this.consumerMeterToProcess = new ConsumerMeter();
    }
  }

  initDeactivateConfirm() {
    this.model.effectiveDate.moment = moment();
    this.model.reason = '';
  }

  onDeactivateConfirm() {
    this.model.effectiveDate.moment.second(1);
    this.model.status = ConsumerStatus.Deactivated;
    if (this.selectedRetailer) {
      this.model.retailer = this.selectedRetailer;
    }
    this.dataService.updatePartial(this.model, ['effectiveDate', 'reason', 'status', 'retailerId'])
      .subscribe(
        () => {
          this.alertService.success(`Deactivate Consumer with Mssl no: ${this.model.msslNo} successfully`, true );
          this.modal.hide();
          this.goToList();
        },
        (error) => {
          this.alertService.error(error.message);
          this.modal.hide();
        }
      );
  }

  onConsumerMeterSubmit() {
    if (this.is('new')) {
      if (this.modalAction === 'create') {
        this.consumerMeterToProcess.id = _.size(this.consumerMeterToProcess) + 1;
        this.model.consumerMeters.push(this.consumerMeterToProcess);
      } else {
        arrayReplace(this.model.consumerMeters, { id: this.consumerMeterToProcess.id }, this.consumerMeterToProcess);
      }
      this.logger.debug(`${(this.modalAction === 'create') ? 'Created' : 'Updated'} consumer meter`, this.consumerMeterToProcess);
      this.alertService.success(`Meter ${(this.modalAction === 'create') ? 'created' : 'updated'} successfully.`, true);
      this.modal.hide();
      this.consumerMeterToProcess = new ConsumerMeter();
    } else {
      this.consumerMeterToProcess.consumer = this.model;
      if (this.modalAction === 'create') {
        this.consumerMeterService.create(this.consumerMeterToProcess)
          .subscribe(
          (consumerMeter: ConsumerMeter) => this.onConsumerMeterSubmitSuccess(consumerMeter),
          this.onConsumerMeterSubmitError
        );
      } else {
        this.consumerMeterService.update(this.consumerMeterToProcess)
          .subscribe(
          (consumerMeter: ConsumerMeter) => this.onConsumerMeterSubmitSuccess(consumerMeter),
          this.onConsumerMeterSubmitError
        );
      }
    }
  }

  protected onSubmitSuccess(model: Consumer): void {
    this.logger.debug(this.is('new') ? 'Created' : 'Updated', this.model, model);
    this.alertService.success(`${this.modelName} ${this.is('new') ? 'created' : 'updated'} successfully.`, true);

    if (this.is('new')) {
      if (_.size(this.model.consumerMeters) > 0) {
        _.forEach(this.model.consumerMeters, (consumerMeterToAdd, index) => {
          consumerMeterToAdd.consumer = model;
          this.consumerMeterService.create(consumerMeterToAdd).subscribe(
            (consumerMeter: ConsumerMeter) => {
              this.onConsumerMeterSubmitSuccess(consumerMeter);
              if (index === (_.size(this.model.consumerMeters) - 1)) {
                if (this.redirectToCreateContract) {
                  this.goToContractFromConsumer(model.id);
                } else {
                  this.goToList();
                }
              }
            },
            (error) => {
              this.onConsumerMeterSubmitError(error);
              if (index === (_.size(this.model.consumerMeters) - 1)) {
                if (this.redirectToCreateContract) {
                  this.goToContractFromConsumer(model.id);
                } else {
                  this.router.navigate(['..', model.id, 'edit']);
                }
              }
            }
          );
        });
      } else {
        if (this.redirectToCreateContract) {
          this.goToContractFromConsumer(model.id);
        } else {
          this.router.navigate(['..', model.id, 'edit']);
        }
      }
    }
  }

  goToContractFromConsumer = (id: number) => {
    this.goWithHistory(['/admin/management/contracts/new'], { consumerId: id }, ['/admin/management/consumers', id, 'detail']);
  }

  protected onConsumerMeterSubmitSuccess = (model: ConsumerMeter) => {
    if (this.modalAction === 'create') {
      this.model.consumerMeters.push(model);
    } else {
      const index = _.indexOf(this.model.consumerMeters, _.find(this.model.consumerMeters, { id: model.id }));
      this.model.consumerMeters.splice(index, 1, model);
    }
    this.logger.debug(`${(this.modalAction === 'create') ? 'Created' : 'Updated'} consumer meter`, this.model, model);
    this.alertService.success(`Meter ${(this.modalAction === 'create') ? 'created' : 'updated'} successfully.`, true);
    this.modal.hide();
    this.consumerMeterToProcess = new ConsumerMeter();
  }

  protected onConsumerMeterSubmitError = (error: ErrorResponse) => {
    this.alertService.clear();
    _.chain(error.errors).values().flatten().forEach((msg) => this.alertService.error(msg, true)).value();
    this.modal.hide();
  }

  protected checkCustomerType(): boolean {
    if (this.model.customer === null || this.model.customer.type === null) {
      return false;
    }

    return _.includes([CustomerType.Commercial, CustomerType.Industrial, CustomerType.Governmental], this.model.customer.type);
  }
}
