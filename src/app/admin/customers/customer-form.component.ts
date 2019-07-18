import { Component, Injector, OnDestroy, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { TabsetComponent } from 'ngx-bootstrap';
import { DataTableParams } from '@app/libs/data-table/components/types';
import { DataTableComponent } from '@app/libs/data-table/data-table.module';
import * as _ from 'lodash';
import * as moment from 'moment';

import {
  Attachment, Consumer, Contract, Customer, Invoice,
  AttachmentService, ConsumerService, ContractService, CustomerService, InvoiceService, SaleTeamService,
  CustomerType, Model, ResourceModel,
  COUNTRY_OPTIONS, CUSTOMER_TYPE_OPTIONS, MODEL_OPTIONS,
  ContractStatus, ConsumerChargeType, ConsumerStatus,
  ProductType, ContractType, PricingPlanService, PromotionService, PricingPlan,
  Promotion, PromotionTemplate, DunningProcess,
  ErrorResponse, Retailer, PaymentMode, BillingPeriod,
  CONSUMER_DEACTIVATE_REASONS, CONTRACT_TYPE_OPTIONS, CONTRACT_ORIGIN_OPTIONS,
  BillingOptionContent, BILLING_OPTIONS,
  PromotionTemplateService, BillingPeriodService,
  ISSUER_OPTIONS, UsageDataMeterService, UsageDataMeter,
  IDENTIFICATION_TYPE_OPTIONS, ConsumerMeter,
  CONSUMER_METER_TYPE_OPTIONS, ConsumerMeterService, ACCOUNT_TYPE_OPTIONS, Payment, PaymentService,
  Mail, MailService, MailContentType, PaymentModeService, BILLING_BC_OPTIONS, PricingPlanRate, TransactionService,
} from '@app/core';
import { ConsumerChargeTableComponent } from '../consumers';
import { arrayReplace } from '@app/shared';
import { FormComponent, InputFieldType } from '../shared';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'admin-customer-form',
  templateUrl: 'customer-form.component.html'
})
export class CustomerFormComponent extends FormComponent<Customer, CustomerService> implements OnDestroy {

  modelName = 'Customer';

  @ViewChild(ConsumerChargeTableComponent) consumerChargeTable: ConsumerChargeTableComponent;
  @ViewChild(DataTableComponent) dataPromotionTable: DataTableComponent;
  @ViewChild('promotionForm') promotionForm: any;
  @ViewChild(TabsetComponent) tabsRef: TabsetComponent;
  @ViewChild('uploadFilesModal') uploadFilesModal: any;
  @ViewChild('contractRenewalModal') contractRenewalModal: any;
  @ViewChild('optionContractRenewalModal') optionContractRenewalModal: any;
  @ViewChild('editPromotionModal') editPromotionModal: any;

  CustomerType = CustomerType;
  ResourceModel = ResourceModel;

  // Customer
  customer: Customer = null;
  customerTypeOptions = CUSTOMER_TYPE_OPTIONS;

  // Consumer
  isConsumerSectionLoading = false;
  consumers: Consumer[] = [];
  redirectToCreateConsumer = false;
  currentConsumer: Consumer = null;
  ConsumerChargeType = ConsumerChargeType;
  consumerLastSelect: Consumer = null;
  consumerMetersMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };
  consumerDeactivateReasons = CONSUMER_DEACTIVATE_REASONS;
  consumerMeterToProcess: ConsumerMeter;
  consumerMeterTypeOptions = CONSUMER_METER_TYPE_OPTIONS;
  consumerMetersList: ConsumerMeter[] = null;
  usageDataMeterMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };
  usageDataMeterPagination: DataTableParams = {
    limit: 10,
    sortBy: 'created_date',
    sortAsc: false,
    offset: 0,
  };
  expiredContractMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };
  expiredContractPagination: DataTableParams = {
    limit: 10,
    sortBy: 'created_date',
    sortAsc: false,
    offset: 0,
  };
  usageDataMeters: UsageDataMeter[] = null;
  metersPagination: DataTableParams = {
    limit: 10,
    offset: 0,
    sortAsc: false,
  };

  // Contract
  isContractSectionLoading = false;
  contractToUploadDocument = new Contract();
  currentContract: Contract = null;
  contractTypeOptions = CONTRACT_TYPE_OPTIONS;
  contractOriginOptions = CONTRACT_ORIGIN_OPTIONS;
  ContractStatus = ContractStatus;
  ContractType = ContractType;
  modalContractStatus: ContractStatus;

  currentPricingPlan: PricingPlan = null;

  payments: Payment[] = [];
  paymentMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1
  };
  paymentPagination: DataTableParams = {
    limit: 10,
    offset: 0,
    sortBy: 'createdTime',
    sortAsc: false
  };

  // Payment Mode
  paymentModeMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1
  };
  paymentModePagination: DataTableParams = {
    limit: 10,
    offset: 0,
    sortBy: 'createdTime',
    sortAsc: false
  };

  // Documents
  attachments: Attachment[] = null;
  attachmentPagination: DataTableParams = {
    limit: 10,
    offset: 0,
    sortBy: 'createdTime',
    sortAsc: false
  };
  attachmentMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1
  };
  invoicesMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1
  };
  attachmentToUpdate: Attachment = null;
  invoicePagination: DataTableParams = {
    limit: 10, sortBy: 'period', sortAsc: false, offset: 0,
  };
  countryOptions = COUNTRY_OPTIONS;
  saleTeamList = {};
  invoices: Invoice[] = null;
  documentsToDownload: Attachment[];
  fieldMapInput: { [ name: string ]: boolean } = {};
  fieldMapUpdating: { [ name: string ]: boolean } = {};

  // Flag check open/close tab.
  tabStatus = {
    customer: true,
    consumer: false,
    contract: false,
    documents: false,
    meterReading: false,
    unpaidCharges: false,
    invoices: false,
    payments: false,
    paymentMode: false,
    mails: false,
  };

  // Flag check display or hide tab based on data which exists or not.
  visibleTab = {
    customer: true,
    consumer: true,
    contract: true,
    documents: true,
    meterReading: true,
    unpaidCharges: true,
    invoices: true,
    payments: true,
    paymentMode: true,
    mails: true,
  };

  // Flag display spinner loading while calling api
  loadingDataTabs = {
    customer: true,
    consumer: false,
    meter: false,
    contract: false,
    promotion: false,
    documents: false,
    meterReading: false,
    unpaidCharges: false,
    invoices: false,
    payments: false,
    paymentMode: false,
    mails: false,
    expiredContract: false
  };

  tempValueAfterEditField: string = null;
  clickedModelFieldName: string = null;

  promotionPagination: DataTableParams = {
    limit: 10,
    offset: 0,
  };

  promotionTemplate: DataTableParams = {
    limit: 10,
    offset: 0,
  };
  paymentModeList: PaymentMode[] = [];
  selectedBillingPeriod: BillingPeriod = null;
  promotions: Promotion[] = [];
  promotionToAction: Promotion = null;
  promotionTemplateList: PromotionTemplate[] = null;
  promotionTemplateMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };
  promotionsMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };
  promotionTemplateCriteriaAllInOne = '';

  // Mails
  mailPagination: DataTableParams = {
    limit: 10,
    offset: 0,
  };
  mailMeta: { [name: string]: any } = {
    count: 0,
    page: 1,
  };
  mailList: Mail[] = null;
  mailSelected: Mail = null;
  mailContentType = MailContentType;

  // this is the competitors of Sunseap used when we deactivate contract
  retailerList: Retailer[] = [];
  selectedRetailer: Retailer = null;
  billingOptions: { [key: string]: BillingOptionContent } = BILLING_OPTIONS;
  billingBcOptions: { [key: string]: BillingOptionContent } = BILLING_BC_OPTIONS;

  isPromotionTemplateLoading = false;
  modalAction: string = null;
  ISSUER_OPTIONS = ISSUER_OPTIONS;
  accountTypeOptions = ACCOUNT_TYPE_OPTIONS;
  currentDwellingType = '';
  isLoading = true;
  IDENTIFICATION_TYPE_OPTIONS = IDENTIFICATION_TYPE_OPTIONS;
  InputFieldType = InputFieldType;
  optionYesNo: { [key: string]: string } = {
    true: 'Yes',
    false: 'No'
  };

  contractRenewal = new Contract();
  pricingPlanList: PricingPlan[] = [];

  isPromotionCodeValid = true;
  verifyingPromotionCode = false;
  promotionCodeKeyUpSubject: Subject<string> = new Subject();
  readonly inputDelayedTime = 1000;
  isExtendContract = false;
  promotionEdit = new Promotion();
  isRenewaledContract = false;
  isDoneReview = false;

  expiredContract: Contract[] = [];

  protected searchConsumerFields = [
    'name', 'premiseAddress', 'premisePostalCode',
    'msslNo', 'ebsNo', 'shBillingAccount'
  ];

  constructor(
    injector: Injector,
    protected dataService: CustomerService,
    protected consumerService: ConsumerService,
    protected contractService: ContractService,
    protected invoiceService: InvoiceService,
    protected saleTeamService: SaleTeamService,
    protected attachmentService: AttachmentService,
    protected consumerMeterService: ConsumerMeterService,
    protected pricingPlanService: PricingPlanService,
    protected promotionService: PromotionService,
    protected promotionTemplateService: PromotionTemplateService,
    protected billingPeriodService: BillingPeriodService,
    protected usageDataMeterService: UsageDataMeterService,
    protected paymentService: PaymentService,
    protected paymentModeService: PaymentModeService,
    protected mailService: MailService,
    protected transactionService: TransactionService,
    private sanitizer: DomSanitizer,
  ) {
    super(injector);
    this.model = new Customer();
    this.consumerMeterToProcess = new ConsumerMeter();
  }

  ngOnDestroy() {
    this.promotionCodeKeyUpSubject.next(null);
  }

  protected onFetchModelFinished = () => {
    this.promotionCodeKeyUpSubject.pipe(debounceTime(this.inputDelayedTime)).subscribe(code => this.verifyPromotionCode(code));

    this.loadingDataTabs.customer = false;
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.Customer]));
    if (this.is(['new', 'edit'])) {
      this.saleTeamService
        .fetchAll()
        .subscribe(collection => {
          this.isLoading = false;
          this.saleTeamList = _.chain(collection.items)
            .keyBy('id')
            .mapValues('name')
            .value();
        });
    }

    if (this.model.id) {
      this.customer = this.model;
      this.reloadAttachments(this.attachmentPagination);
      if (!_.isEmpty(this.customer.consumers)) {
        this.consumers = this.customer.consumers;
        this.loadConsumerSection(this.customer.consumers[0].id);
        this.loadContractSection(this.customer.consumers[0].contractId);
      } else {
        this.tabStatus.consumer = true;
        this.tabStatus.contract = true;
      }
    } else {
      this.visibleTab.customer = false;
    }
  }

  // Consumer
  loadConsumerSection(id: number) {
    if (id != null) {
      this.isConsumerSectionLoading = true;
      this.consumerService.fetchOne(id).subscribe(
        consumer => {
          this.isConsumerSectionLoading = false;
          this.tabStatus.consumer = true;

          if (_.isEmpty(consumer)) {
            this.visibleTab.consumer = false;
          } else {
            this.visibleTab.consumer = true;
            this.currentConsumer = consumer;
          }
        }, (error: ErrorResponse) => {
          this.isConsumerSectionLoading = false;
          this.tabStatus.consumer = true;
          this.visibleTab.consumer = false;
          this.alertService.error(error.message);
        });
    }
  }

  // Contract
  loadContractSection(id: number) {
    if (id != null) {
      this.isContractSectionLoading = true;
      this.contractService.fetchOne(id).subscribe(
        contract => {
          this.isContractSectionLoading = false;
          this.tabStatus.contract = true;

          if (_.isEmpty(contract)) {
            this.visibleTab.contract = false;
            this.currentContract = null;
          } else {
            this.currentContract = contract;
            this.currentDwellingType = contract.dwellingType;
            this.getDataForContractTab();
            this.reloadPromotions(this.promotionPagination);
            this.reloadExpiredContract(this.expiredContractPagination);
          }
        }, (error: ErrorResponse) => {
          this.isContractSectionLoading = false;
          this.tabStatus.contract = true;
          this.visibleTab.contract = false;
          this.currentContract = null;
          this.alertService.error(error.message);
        });
    }
  }

  reloadMeters(params: DataTableParams) {
    if (!_.isEmpty(this.currentConsumer)) {
      this.loadingDataTabs.meter = true;
      this.consumerMeterService.fetchAll({ 'consumer.id': this.currentConsumer.id }, params).subscribe(
        collection => {
          this.loadingDataTabs.meter = false;
          this.consumerMetersList = collection.items;
          this.consumerMetersMeta = collection.meta;
        }, (error: ErrorResponse) => {
          this.loadingDataTabs.meter = false;
          this.alertService.error(error.message);
        });
    }
  }

  reloadMeterReadings(params: DataTableParams) {
    if (!_.isEmpty(this.currentConsumer)) {
      this.usageDataMeterService.fetchAll( { 'consumerId': this.currentConsumer.id }, params)
        .subscribe( (collection) => {
          this.tabStatus.meterReading = true;
          this.usageDataMeters = collection.items;
          this.usageDataMeterMeta = collection.meta;
        });
    }
  }

  // Contract
  reloadPromotions(params: DataTableParams) {
    if (!_.isEmpty(this.currentContract)) {
      this.loadingDataTabs.promotion = true;
      this.promotionService
        .fetchAll({ 'contractId': this.currentContract.id }, params)
        .subscribe(collection => {
          this.loadingDataTabs.promotion = false;
          this.promotions = collection.items;
          this.promotionsMeta = collection.meta;
        }, () => {
          this.loadingDataTabs.promotion = false;
        });
    }
  }

  reloadInvoices(params: DataTableParams) {
    if (!_.isEmpty(this.customer)) {
      this.invoiceService
        .fetchAll({ 'customerId': this.customer.id }, params)
        .subscribe((collection) => {
          this.invoices = collection.items;
          this.invoicesMeta = collection.meta;
        });
    }
  }

  reloadPayments(params: DataTableParams) {
    if (!_.isEmpty(this.customer)) {
      this.paymentService.fetchAll({ 'customerId': this.customer.id }, params)
        .subscribe((collection) => {
          this.payments = collection.items;
          this.paymentMeta = collection.meta;
        });
    }
  }

  reloadPaymentMode(params: DataTableParams) {
    if (!_.isEmpty(this.customer)) {
      this.paymentModeService.fetchAll({ 'customerId': this.customer.id }, params)
        .subscribe((collection) => {
          this.paymentModeList = collection.items.filter(item => !!item.giroAccountBankNo);
          this.paymentModeMeta = collection.meta;
        });
    }
  }

  // Document
  reloadDocuments = (attachments?: Attachment[]) => {
    if (attachments) {
      this.model.documents = attachments;
      this.loadingDataTabs.documents = false;
      if (this.checkStatusLoadingData()) {
        this.isLoading = false;
      }
    }
  }

  reloadAttachments(params: DataTableParams) {
    if (this.model.id) {
      const urlToFetchAllDocuments = `attach/customer/${this.model.id}`;

      this.loadingDataTabs.documents = true;
      this.attachmentService.fetchAll({}, params, urlToFetchAllDocuments)
        .subscribe( collection => {
          this.loadingDataTabs.documents = false;
          this.visibleTab.documents = true;
          this.attachments = collection.items;
          this.attachmentMeta = collection.meta;
        }, (error: ErrorResponse) => {
          this.alertService.error(error.message);
          this.loadingDataTabs.documents = false;
        });
    }
  }

  // Promotion Template
  reloadPromotionTemplate(params: DataTableParams) {
    this.isPromotionTemplateLoading = true;
    this.promotionTemplateService.fetchAll(params)
      .subscribe( (collection) => {
        this.promotionTemplateList = collection.items;
        this.promotionTemplateMeta = collection.meta;
        this.isPromotionTemplateLoading = false;
      }, (error: ErrorResponse) => {
        this.alertService.error(error.message);
        this.isPromotionTemplateLoading = false;
      });
  }

  // Mail
  reloadMails(params: DataTableParams) {
    if (this.model.emailAddress.length > 0) {
      this.mailService.fetchAll({ 'emailTo': this.model.emailAddress }, params)
        .subscribe(collection => {
          this.mailList = collection.items;
          this.mailMeta = collection.meta;
        }, (error: ErrorResponse) => {
          this.alertService.error(error.message);
        });
    }
  }

  uploadSuccess(attachment: Attachment) {
    this.currentContract.contractDocument = attachment;
    this.contractToUploadDocument = _.cloneDeep(this.currentContract);
    this.contractToUploadDocument.contractDocument = attachment;
    this.modal.hide();
    this.loadingDataTabs.documents = true;
    this.contractService.updatePartial(this.contractToUploadDocument, [ 'contractDocumentId' ])
      .subscribe(() => {
        this.reloadAttachments(this.attachmentPagination);
      }, () => this.reloadAttachments(this.attachmentPagination));
  }

  updateAttachmentOnModel(attachment: Attachment) {
    this.modal.hide();
    switch (attachment.resourceModel) {
      case ResourceModel.Consumer: {
        let consumer: Consumer = null;
        this.consumerService.fetchOne(attachment.resourceId).subscribe(model => {
          consumer = model;
          consumer.lastRetailerBillDocuments.push(attachment);
          this.consumerService.updatePartial(consumer, [ 'lastRetailerBillDocumentIds' ])
            .subscribe(
              () => this.reloadAttachments(this.attachmentPagination),
              error => {
                this.onError(error.message);
              }
            );
        });
        break;
      }
      case ResourceModel.Contract: {
        let contract: Contract = null;
        this.contractService.fetchOne(attachment.resourceId).subscribe(model => {
          contract = model;
          contract.contractDocument = attachment;
          this.contractService.updatePartial(contract, [ 'contractDocumentId' ])
            .subscribe(
              () => this.reloadAttachments(this.attachmentPagination),
              () => this.reloadAttachments(this.attachmentPagination)
            );
        });
        break;
      }
      case ResourceModel.Customer: {
        let customer: Customer = null;
        this.dataService.fetchOne(attachment.resourceId).subscribe(model => {
          customer = model;
          customer.identificationDocument = attachment;
          this.dataService.updatePartial(customer, [ 'identificationDocumentId' ])
            .subscribe(
              () => this.reloadAttachments(this.attachmentPagination),
              error => {
                this.onError(error.message);
              }
            );
        });
        break;
      }
      case ResourceModel.Invoice: {
        let invoice: Invoice = null;
        this.invoiceService.fetchOne(attachment.resourceId).subscribe(model => {
          invoice = model;
          invoice.invoiceDocument = attachment;
          this.invoiceService.updatePartial(invoice, [ 'invoiceDocumentId' ])
            .subscribe(
              () => this.reloadAttachments(this.attachmentPagination),
              error => {
                  this.onError(error.message);
              }
            );
        });
        break;
      }
      case ResourceModel.Order: {
        this.reloadAttachments(this.attachmentPagination);
        break;
      }
      default: {
        this.alertService.error('Resource not found!');
        break;
      }
    }
  }

  removeAttachment = (attachment: Attachment) => {
    this.attachmentService.removeAttachment(attachment.id).subscribe(() => this.reloadAttachments(this.attachmentPagination)
      , error => {
        this.onError(error.message);
      });
  }

  protected onSubmitSuccess(model: Customer): void {
    this.logger.debug(this.is('new') ? 'Created' : 'Updated', this.model, model);
    this.alertService.success(`${this.modelName} ${this.is('new') ? 'created' : 'updated'} successfully.`, true);

    if (this.redirectToCreateConsumer) {
      this.goWithHistory('/admin/management/consumers/new',
        { 'customerId': model.id }, [ '/admin/management/customers', model.id, 'detail' ]);
    } else {
      this.goToList();
    }
  }

  /**
   * General function to handle some action when click edit input field in UI
   * Save old value before input or change value of this field
   * Reset all flag to check which field inputing through array fieldMapInput
   * @param formType to check type of input, to check model data
   * @param fieldName is field name to map data in model, different with field name display on UI
   * @param input
   */
  editField(formType: string, fieldName: string, input: any) {
    let listFieldsMap = {};
    switch (formType) {
      case ResourceModel.Consumer:
        listFieldsMap = _.cloneDeep(this.currentConsumer);
        break;
      case ResourceModel.Contract:
        listFieldsMap = _.cloneDeep(this.currentContract);
        break;
      default:
        listFieldsMap = _.cloneDeep(this.model);
    }
    this.tempValueAfterEditField = _.get(listFieldsMap, fieldName);
    this.fieldMapInput = _.mapValues(this.fieldMapInput, () => false);
    this.fieldMapInput[fieldName] = true;
    input.focus();
  }

  /**
   * This function is handle flow load data for every section when change service address on customer form UI
   * When change service address, all information of consumer, contract, ... and all value related to this consumer will be reloaded
   * @param event
   */
  selectAddress(event: any) {
    const consumerId = _.toNumber(event.target.value);
    this.loadConsumerSection(consumerId);
    const consumer = _.find(this.consumers, ['id', consumerId]);
    if (!_.isEmpty(consumer)) {
      const contractId = consumer.contractId;
      if (!_.isUndefined(contractId)) {
        this.loadContractSection(contractId);
      }

      this.reloadMeterReadings(this.usageDataMeterPagination);
    }
  }

  openCreateConsumerChargeModal(consumerChargeType: ConsumerChargeType) {
    this.consumerChargeTable.openCreateConsumerChargeModal(consumerChargeType);
  }

  initDeactivateConfirm() {
    this.currentConsumer.effectiveDate.moment = moment();
    this.currentConsumer.reason = '';
  }

  /**
   * Discard old value to input field
   * @param formType
   * @param fieldName
   * @param input
   */
  cancelUpdateField(formType: string, fieldName: string, input: any) {
    this.fieldMapInput[ fieldName ] = false;
    switch (formType) {
      case ResourceModel.Consumer:
        input.value = _.get(this.currentConsumer, fieldName);
        _.set(this.currentConsumer, fieldName, this.tempValueAfterEditField);
        break;
      case ResourceModel.Contract:
        input.value = _.get(this.currentContract, fieldName);
        _.set(this.currentContract, fieldName, this.tempValueAfterEditField);
        break;
      default:
        input.value = _.get(this.model, fieldName);
        _.set(this.model, fieldName, this.tempValueAfterEditField);
    }
    input.blur();
  }

  getDataForContractTab() {
    this.pricingPlanService.fetchOneByCustomerType(this.currentContract.pricingPlanId, _.toString(this.model.type))
      .subscribe((plan: PricingPlan) => {
        this.currentPricingPlan = plan;
        if (plan.productType === ProductType.DiscountOffTariff) {
          this.currentContract.contractType = ContractType.Dot;
        } else if (plan.productType === ProductType.FixedPrice) {
          this.currentContract.contractType = ContractType.Fix;
        }
      });

    this.saleTeamService.fetchAll()
      .subscribe(collection => this.saleTeamList =  _.chain(collection.items)
        .keyBy('id')
        .mapValues('name')
        .value()
      );
  }

  initPromotion = () => {
    this.promotionToAction = new Promotion();
    this.promotionToAction.contractId = this.currentContract.id;
  }

  onSelectPromotionTemplate(promotionTemplate: PromotionTemplate) {
    if (!_.isEmpty(promotionTemplate)) {
      this.promotionToAction.promotionTemplate = _.cloneDeep(promotionTemplate);
      this.promotionToAction.promotionTemplateId = promotionTemplate.id;
      this.modal.hide();
      this.modal.open(this.promotionForm, 'md');
    }
  }

  getResetPromotionTemplateTableParameters(): DataTableParams {
    return _.assign(this.dataPromotionTable.getTableParameters(), { offset: 0 });
  }

  onCreatePromotion = () => {
    this.promotionService.create(this.promotionToAction)
      .subscribe( () => (this.reloadPromotions(this.promotionPagination)), (error) => (this.onError(error)));
  }

  onUpdateDunningProcessStatus = (action: string) => {
    this.loadingDataTabs.contract = true;
    this.contractService.updateDunningProcess(this.currentContract.id, action)
      .subscribe((model: DunningProcess) => {
        this.loadingDataTabs.contract = false;
        this.currentContract.dunningProcess = model;
      });
  }

  uploadServiceAgreementSuccess(attachment: Attachment) {
    this.currentContract.serviceAgreement = attachment;
    this.modal.hide();
    this.contractService.update(this.currentContract).subscribe(
      (model: Contract) => {
        if (this.checkStatusLoadingData()) {
          this.isLoading = false;
        }
        this.reloadDocuments(model.documents);
      }, (error) => this.onError(error));
  }

  initContractStatusToUpdate(modalUpdateStatus: ContractStatus) {
    this.modalContractStatus = modalUpdateStatus;
    this.currentContract.reason = '';
  }

  onStatusUpdateConfirm() {
    const originStatus = this.currentContract.status;
    this.currentContract.status = this.modalContractStatus;
    if (this.selectedRetailer) {
      this.currentContract.retailer = this.selectedRetailer;
    }
    this.contractService.updatePartial(this.currentContract, ['status', 'reason', 'retailerId'])
      .subscribe(
        () => {
          this.alertService.success(`Update contract with id: ${this.currentContract.id} successfully`, true );
          this.modal.hide();
          this.goToList();
        },
        (error: ErrorResponse) => {
          this.alertService.error(error.message);
          this.modal.hide();
          this.currentContract.status = originStatus;
        }
      );
  }

  initBillingOption(modalAction: string) {
    this.modalAction = modalAction;
    this.selectedBillingPeriod = this.billingPeriodService.clone(this.currentContract.billingPeriod);

    if (_.has(this.billingBcOptions, this.currentContract.billingPeriod.billingOption)) {
      this.selectedBillingPeriod.billingBC = this.currentContract.billingPeriod.billingOption;
    }
  }

  updateBillingPeriod = () => {
    this.currentContract.billingPeriod.billingOption = this.selectedBillingPeriod.billingOption;
    this.billingPeriodService.updatePartial(this.currentContract.billingPeriod, ['billingOption'])
      .subscribe(
        (model) => {
          this.selectedBillingPeriod.nextBillingDate = model.nextBillingDate;
          this.currentContract.billingPeriod = model;
          if (!_.isEmpty(this.currentContract)) {
            this.dataService.updatePartial(this.model, ['billingPeriod']).subscribe( () => {
              this.currentContract.billingOption = model.billingOption;
              this.modal.hide();
            });
          }
      },
        (error: ErrorResponse) => {
          this.alertService.error(error.message);
        }
      );
  }

  validateBillingOption = () => {
    this.billingPeriodService.validateBillingOption(this.selectedBillingPeriod, ['billingOption'])
      .subscribe(
        (model) => {
          this.selectedBillingPeriod.nextBillingDate = model.nextBillingDate;
        },
        (error: ErrorResponse) => {
          this.alertService.error(error.message);
        }
      );
  }

  openMeterReadingsTab() {
    if (this.tabStatus.meterReading) {
      this.tabStatus.meterReading = !this.tabStatus.meterReading;
      return;
    }
    this.tabStatus.meterReading = !this.tabStatus.meterReading;
    this.reloadMeterReadings(this.usageDataMeterPagination);
  }

  onDeactivateConfirm() {
    this.currentConsumer.effectiveDate.moment.second(1);
    this.currentConsumer.status = ConsumerStatus.Deactivated;
    if (this.selectedRetailer) {
      this.currentConsumer.retailer = this.selectedRetailer;
    }
    this.dataService.updatePartial(this.model, ['effectiveDate', 'reason', 'status', 'retailerId'])
      .subscribe(
        () => {
          this.alertService.success(`Deactivate Consumer with Mssl no: ${this.currentConsumer.msslNo} successfully`, true );
          this.modal.hide();
          this.goToList();
        },
        (error: ErrorResponse) => {
          this.alertService.error(error.message);
          this.modal.hide();
        }
      );
  }

  isNumber(value: number) {
    if (!!Number(value)) {
      return true;
    }
    return false;
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

  onConsumerMeterSubmit() {
    if (this.is('new')) {
      if (this.modalAction === 'create') {
        this.consumerMeterToProcess.id = _.size(this.consumerMeterToProcess) + 1;
        this.currentConsumer.consumerMeters.push(this.consumerMeterToProcess);
      } else {
        arrayReplace(this.currentConsumer.consumerMeters, { id: this.consumerMeterToProcess.id }, this.consumerMeterToProcess);
      }
      this.logger.debug(`${(this.modalAction === 'create') ? 'Created' : 'Updated'} consumer meter`, this.consumerMeterToProcess);
      this.alertService.success(`Meter ${(this.modalAction === 'create') ? 'created' : 'updated'} successfully.`, true);
      this.modal.hide();
      this.consumerMeterToProcess = new ConsumerMeter();
    } else {
      this.consumerMeterToProcess.consumer = this.currentConsumer;
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

  protected onConsumerMeterSubmitSuccess = (model: ConsumerMeter) => {
    if (this.modalAction === 'create') {
      this.currentConsumer.consumerMeters.push(model);
    } else {
      const index = _.indexOf(this.currentConsumer.consumerMeters, _.find(this.currentConsumer.consumerMeters, { id: model.id }));
      this.currentConsumer.consumerMeters.splice(index, 1, model);
    }
    this.logger.debug(`${(this.modalAction === 'create') ? 'Created' : 'Updated'} consumer meter`, this.model, model);
    this.alertService.success(`Meter ${(this.modalAction === 'create') ? 'created' : 'updated'} successfully.`, true);
    this.modal.hide();
    this.consumerMeterToProcess = new ConsumerMeter();
    this.reloadMeters(this.metersPagination);
  }

  protected onConsumerMeterSubmitError = (error: ErrorResponse) => {
    this.alertService.clear();
    _.chain(error.errors).values().flatten().forEach((msg) => this.alertService.error(msg, true)).value();
    this.modal.hide();
  }

  /**
   *
   */
  checkStatusLoadingData() {
    return Object.keys(this.loadingDataTabs).every(tab => !tab);
  }

  updateContract(fieldName: string, input?: any, event?: any) {
    if (!_.isEmpty(event)) {
      _.set(this.currentContract, fieldName, event.currentValue);
    }

    if (input && (_.isEmpty(input.value) || this.fieldMapInput[ fieldName ] === input.value)) {
      return;
    }

    this.fieldMapUpdating[fieldName] = true;

    this.contractService.updatePartial(this.currentContract, [ fieldName ])
      .subscribe((model: Contract) => {
        this.fieldMapInput[fieldName] = false;
        this.fieldMapUpdating[fieldName] = false;

        if (input) {
          input.blur();
        }

        if (this.checkStatusLoadingData()) {
          this.isLoading = false;
        }
      }, (error) => this.onError(error));
  }

  changeToggleContract(event: any) {
    if (event.modelFieldName !== this.clickedModelFieldName) {
      this.tempValueAfterEditField = event.oldValue;
      this.clickedModelFieldName = event.modelFieldName;
    }
  }

  renderEmailContentHTML(html: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(html);
  }

  updateContractByCustomFieldInput(event: any) {
    const { modelFieldName, currentValue } = event;
    _.set(this.fieldMapUpdating, modelFieldName, true);

    if (_.get(this.currentContract, modelFieldName) !== currentValue) {
      const contract = _.cloneDeep(this.currentContract);
      _.set(contract, modelFieldName, currentValue);

      this.contractService.updatePartial(contract, [ modelFieldName ])
        .subscribe(
          (model) => {
            _.set(this.currentContract, modelFieldName, currentValue);
            this.fieldMapInput[ modelFieldName ] = false;
            this.fieldMapUpdating[ modelFieldName ] = false;

            if (this.checkStatusLoadingData()) {
              this.isLoading = false;
            }
          },
          (error) => {
            this.onError(error);
            this.fieldMapUpdating[modelFieldName] = false;
          }
        );
    }
  }

  updateCustomerByCustomFieldInput(event: any) {
    const { modelFieldName, currentValue } = event;

    _.set(this.fieldMapUpdating, modelFieldName, true);
    if (_.get(this.model, modelFieldName) !== currentValue) {
      _.set(this.model, modelFieldName, currentValue);

      this.dataService.updatePartial(this.model, [ modelFieldName ])
        .subscribe(
          (model) => {
            this.fieldMapInput[ modelFieldName ] = false;
            this.fieldMapUpdating[ modelFieldName ] = false;

            if (this.checkStatusLoadingData()) {
              this.isLoading = false;
            }
          },
          (error) => {
            this.onError(error);
            this.fieldMapUpdating[modelFieldName] = false;
          }
        );
    }
  }

  updateConsumerByCustomFieldInput(event: any) {
    const { modelFieldName, currentValue } = event;

    _.set(this.fieldMapUpdating, modelFieldName, true);

    if (_.get(this.currentConsumer, modelFieldName) !== currentValue) {

      const consumer = _.cloneDeep(this.currentConsumer);
      _.set(consumer, modelFieldName, currentValue);

      this.consumerService.updatePartial(consumer, [ modelFieldName ])
        .subscribe(
          (model) => {

            _.set(this.currentConsumer, modelFieldName, currentValue);
            this.fieldMapInput[ modelFieldName ] = false;
            this.fieldMapUpdating[ modelFieldName ] = false;

            if (this.checkStatusLoadingData()) {
              this.isLoading = false;
            }
          },
          (error) => {
            this.onError(error);
            this.fieldMapUpdating[modelFieldName] = false;
          }
        );
    }
  }

  editFieldByCustomFieldInput(fieldName: string) {
    this.fieldMapInput = _.mapValues(this.fieldMapInput, () => false);
    this.fieldMapInput[fieldName] = true;
  }

  // extendContractRenewal() {
  //   this.contractRenewal = _.clone(this.currentContract);
  //   this.pricingPlanService.fetchAllPricingPlan().subscribe(
  //     collection => {
  //       this.pricingPlanList = collection.items;
  //
  //       const modalConfig: { [ key: string ]: any } = {
  //         events: {
  //           onHidden: (reason: string) => {
  //             setTimeout(() => {
  //               this.contractRenewal.promotionCode = '';
  //               this.verifyingPromotionCode = false;
  //               this.isPromotionCodeValid = false;
  //             }, 300);
  //           }
  //         },
  //       };
  //
  //       this.modal.config(modalConfig).open(this.contractRenewalModal, 'lg');
  //
  //     },
  //     (error) => {
  //       this.onError(error);
  //     }
  //   );
  // }

  openContractRenewalModal() {
    this.contractRenewal = _.cloneDeep(this.currentContract);
    if (this.contractRenewal.promotionCode) {
      this.contractRenewal.promotionCode = '';
    }
    this.contractRenewal.commissionedDate.moment = moment(this.currentContract.plannedEndDate.short, 'DD-MM-YYYY').add('days', 1);
    this.pricingPlanService.fetchAllPricingPlan().subscribe(
      collection => {
        this.pricingPlanList = _.filter(collection.items, item => !_.isEmpty(item.promotionTemplate));
        if (this.isExtendContract) {
          this.pricingPlanService.fetchOnePricingPlan(this.isExtendContract, this.currentContract.id).subscribe(
            contractWithPricingPlan => {
              this.contractRenewal.pricingPlanName = contractWithPricingPlan.name;

              const modalConfig: { [ key: string ]: any } = {
                events: {
                  onHidden: (reason: string) => {
                    setTimeout(() => {
                      this.contractRenewal.promotionCode = '';
                      this.verifyingPromotionCode = false;
                      this.isPromotionCodeValid = true;
                    }, 300);
                  }
                },
              };
              this.modal.config(modalConfig).open(this.contractRenewalModal, 'lg');
            },
            (error) => {
              this.onError(error);
            }
          );
        } else {
          const modalConfig: { [ key: string ]: any } = {
            events: {
              onHidden: (reason: string) => {
                setTimeout(() => {
                  this.contractRenewal.promotionCode = '';
                  this.verifyingPromotionCode = false;
                  this.isPromotionCodeValid = true;
                }, 300);
              }
            },
          };
          this.modal.config(modalConfig).open(this.contractRenewalModal, 'lg');
        }
      },
      (error) => {
        this.onError(error);
      }

    );

  }

  saveContractRenewal() {
    this.isRenewaledContract = true;
    this.modal.hide();
    this.contractService.saveContractRenewal(this.currentContract.id, this.contractRenewal, this.isExtendContract).subscribe(
        contract => {
          this.contractService.fetchOne(this.currentContract.id).subscribe(
            currentCtr => {
              this.currentContract = currentCtr;
            }
          );
          this.alertService.success('Contract renewal successfully');
        },
      (error) => {
        this.alertService.error('Contract renewal failed');
      }
    );
  }

  submitContractRenewal() {
    this.isRenewaledContract = false;
    this.modal.hide();
    this.contractService.saveContractRenewal(this.currentContract.id, this.contractRenewal, this.isExtendContract).subscribe(
      contract => {
        this.contractService.submitContractRenewal(this.currentContract.id).subscribe(
          contractSubmitted => {
            this.alertService.success('Contract renewal submitted successfully.');
          },
          (error) => {
            this.alertService.error('Contract renewal submitted failed.');
          }
        );
      },
      error => {
        this.alertService.error('Contract renewal failed.');
      }
    );
  }

  /**
   * Handle event change value of promotion code
   * @param searchValue
   */
  onPromotionCodeInputKeyUp(searchValue: string) {
    this.verifyingPromotionCode = !!searchValue;
    this.isPromotionCodeValid = true;
    this.promotionCodeKeyUpSubject.next(searchValue);
  }

  verifyPromotionCode(code: string) {
    if (code) {
      this.transactionService.verifyPromotionCode(code).subscribe(() => {
        this.verifyingPromotionCode = false;
        this.isPromotionCodeValid = true;
      }, () => {
        this.verifyingPromotionCode = false;
        this.isPromotionCodeValid = false;
      });
    }
  }

  reviewContractRenewal() {
    this.isPromotionCodeValid = true;
    this.isDoneReview = false;
    this.isExtendContract = false;
    this.contractService.getContractRenewalBeReviewed(this.currentContract.id).subscribe(
      contractRenewal => {
        this.contractRenewal = contractRenewal;
        this.pricingPlanService.fetchAllPricingPlan().subscribe(
          collection => {
            this.isDoneReview = true;
            this.pricingPlanList = _.filter(collection.items, item => !_.isEmpty(item.promotionTemplate));
            this.modal.open(this.contractRenewalModal, 'lg');
          }
        );
      },
      (error: ErrorResponse) => {
        this.alertService.error(error.message);
      }
    );
  }

  reloadExpiredContract(params: DataTableParams) {
    this.loadingDataTabs.expiredContract = true;
    if (_.isEmpty(this.model.id)) {
      this.contractService.fetchAll({ 'customerId': this.model.id , 'status': ContractStatus.Deactivated}, params)
        .subscribe( collection => {
        this.expiredContractMeta = collection.meta;
        this.expiredContract = collection.items;
        this.loadingDataTabs.expiredContract = false;
      }, (err) => {
          this.loadingDataTabs.expiredContract = false;
          this.alertService.error(err.message);
      });
    } else {
      this.loadingDataTabs.expiredContract = false;
    }
  }

}
