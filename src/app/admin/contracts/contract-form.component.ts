import { Component, DoCheck, Injector, ViewChild } from '@angular/core';

import * as _ from 'lodash';
import { DataTableParams, DataTableComponent } from '@app/libs/data-table/data-table.module';
import { TabsetComponent } from 'ngx-bootstrap';

import { FormComponent } from '../shared/views/crud/form.component';
import { Model, MODEL_OPTIONS } from '@core/services/authorization.service';
import { PricingPlan, PricingPlanService, ProductType } from '@core/data-services/pricing-plan.service';
import { Consumer, CONSUMER_DEACTIVATE_REASONS, ConsumerService } from '@core/data-services/consumer.service';
import { PaymentMode, PaymentModeService } from '@core/data-services/payment-mode.service';
import { Customer, CustomerService, CustomerType } from '@core/data-services/customer.service';
import { Invoice, InvoiceService } from '@core/data-services/invoice.service';
import { BILLING_OPTIONS, BillingOptionContent, BillingPeriod, BillingPeriodService } from '@core/data-services/billing-period.service';
import { Retailer, RetailerService } from '@core/data-services/retailer.service';
import { Attachment } from '@core/data-services/attachment.service';
import {
  Contract,
  CONTRACT_ORIGIN_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  ContractService,
  ContractStatus, ContractType,
  DunningProcess
} from '@core/data-services/contract.service';
import { PricingPlanRate, PricingPlanRateService } from '@core/data-services/pricing-plan-rate.service';
import { ISSUER_OPTIONS, Promotion, PromotionService } from '@core/data-services/promotion.service';
import { PromotionTemplate, PromotionTemplateService } from '@core/data-services/promotion-template.service';
import { SaleTeam, SaleTeamService } from '@core/data-services/sale-team.service';
import { ErrorResponse } from '@core/data-services/base.service';


@Component({
  selector: 'admin-contract-form',
  templateUrl: 'contract-form.component.html',
})
export class ContractFormComponent extends FormComponent<Contract, ContractService> implements DoCheck {

  ISSUER_OPTIONS = ISSUER_OPTIONS;
  modelName = 'Contract';

  @ViewChild(TabsetComponent) tabsRef: TabsetComponent;
  @ViewChild(DataTableComponent) dataPromotionTable: DataTableComponent;
  @ViewChild('promotionForm') promotionForm: any;

  invoicePagination: DataTableParams = {
    limit: 10,
    sortBy: 'period',
    sortAsc: false,
    offset: 0,
  };

  promotionPagination: DataTableParams = {
    limit: 10,
    offset: 0,
  };

  promotionTemplate: DataTableParams = {
    limit: 10,
    offset: 0,
  };

  paymentModeList: PaymentMode[] = [];
  saleTeamList: SaleTeam[] = [];
  pricingPlan: PricingPlan = null;
  pricingPlanList: PricingPlan[] = [];
  pricingPlanRateList: PricingPlanRate[] = [];
  isCurrentPricingPlanBelongsToFixFamily = false;

  selectedBillingPeriod: BillingPeriod = null;

  consumerList: Consumer[] = [];
  consumerCount = 0;

  invoices: Invoice[] = [];
  invoiceCount = 0;

  promotions: Promotion[] = [];
  promotionCount = 0;
  promotionToAction: Promotion = null;

  promotionTemplateList: PromotionTemplate[] = [];
  promotionTemplateMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };
  promotionTemplateCriteriaAllInOne = '';
  promotionTemplateSearchFields: string[] = [
    '~promotionName'
  ];

  // this is the competitors of Sunseap used when we deactivate contract
  retailerList: Retailer[] = [];
  selectedRetailer: Retailer = null;

  consumerDeactivateReasons = CONSUMER_DEACTIVATE_REASONS;

  documentsToDownload: Attachment[];

  contractTypeOptions = CONTRACT_TYPE_OPTIONS;
  contractOriginOptions = CONTRACT_ORIGIN_OPTIONS;
  billingOptions: { [key: string]: BillingOptionContent } = BILLING_OPTIONS;

  ContractStatus = ContractStatus;
  ContractType = ContractType;
  CustomerType = CustomerType;

  isConsumerLoading = false;
  isPromotionTemplateLoading = false;

  modalAction: string = null;
  modalContractStatus: ContractStatus;

  currentCustomer: Customer = null;
  currentConsumer: Consumer = null;
  currentPricingPlan: PricingPlan = null;

  protected searchConsumerFields = [
    'name', 'premiseAddress', 'premisePostalCode',
    'msslNo', 'ebsNo', 'shBillingAccount'
  ];

  constructor(
    injector: Injector,
    protected dataService: ContractService,
    protected consumerService: ConsumerService,
    protected billingPeriodService: BillingPeriodService,
    protected paymentModeService: PaymentModeService,
    protected pricingPlanService: PricingPlanService,
    protected invoiceService: InvoiceService,
    protected promotionService: PromotionService,
    protected saleTeamService: SaleTeamService,
    protected pricingPlanRateService: PricingPlanRateService,
    protected retailerService: RetailerService,
    protected promotionTemplateService: PromotionTemplateService,
    protected customerService: CustomerService,
  ) {
    super(injector);
    this.model = new Contract();
    this.selectedRetailer = new Retailer();
  }

  ngDoCheck(): void {
    if (this.is('new')) {
      if (this.currentCustomer.type === CustomerType.Residential) {
        this.model.isAfpIncluded = true;
        this.model.isEmcIncluded = true;
        this.model.isHeucIncluded = true;
        this.model.isMeucIncluded = true;
        this.model.isMssIncluded = true;
        this.model.isMssMdscIncluded = true;
        this.model.isMssOthersIncluded = true;
        this.model.isPsoIncluded = true;
        this.model.isUosIncluded = true;
      } else {
        this.model.isAfpIncluded = false;
        this.model.isEmcIncluded = false;
        this.model.isHeucIncluded = false;
        this.model.isMeucIncluded = false;
        this.model.isMssIncluded = false;
        this.model.isMssMdscIncluded = false;
        this.model.isMssOthersIncluded = false;
        this.model.isPsoIncluded = false;
        this.model.isUosIncluded = false;
      }
    }
  }

  protected onFetchModelFinished = () => {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.Contract]));
    if (this.is(['new', 'edit'])) {
      this.paymentModeService.fetchAll()
        .subscribe(collection => this.paymentModeList = _.uniqBy(collection.items, 'paymentMode'));

      this.pricingPlanService.fetchAll()
        .subscribe(collection => {
          this.pricingPlanList = _.uniqBy(collection.items, 'name');
          if (this.model.pricingPlanName) {
            const name = this.model.pricingPlanName;
            const currentPricingPlan = _.find(this.pricingPlanList, { name });
            if (currentPricingPlan.name.toLowerCase().includes('fix')) {
              this.isCurrentPricingPlanBelongsToFixFamily = true;
            } else {
              this.isCurrentPricingPlanBelongsToFixFamily = false;
            }
            this.onPricingPlanChange(this.model.pricingPlanName);
          }
        });

      this.saleTeamService.fetchAll()
        .subscribe(collection => this.saleTeamList = collection.items);
    }

    if (this.model.id) {
      const errorHandler = (error: ErrorResponse) => { this.alertService.error(error.message); };

      this.customerService.fetchOne(this.model.customerId)
        .subscribe((customer: Customer) => {
          this.currentCustomer = customer;
          this.pricingPlanService.fetchOneByCustomerType(this.model.pricingPlanId, _.toString(this.currentCustomer.type))
            .subscribe((pricingPlan: PricingPlan) => this.currentPricingPlan = pricingPlan, errorHandler);
          }, errorHandler
         );

      if(this.model.consumerId) {
        this.consumerService.fetchOne(this.model.consumerId)
          .subscribe((consumer: Consumer) => this.currentConsumer = consumer, errorHandler);
      }

      this.reloadInvoices(this.invoicePagination);
      this.reloadPromotions(this.promotionPagination);

      this.retailerService.fetchAll({ 'isCompetitor': true })
        .subscribe(collection => this.retailerList = collection.items, errorHandler);

      this.pricingPlanService.fetchOne(this.model.pricingPlanId)
        .subscribe((model: PricingPlan) => (this.pricingPlan = model), errorHandler);
    }
  }

  initPromotion = () => {
    this.promotionToAction = new Promotion();
    this.promotionToAction.contractId = this.model.id;
  }

  reloadPromotionTemplate(params: DataTableParams) {
    this.isPromotionTemplateLoading = true;
    this.promotionTemplateService.fetchAll(params)
      .subscribe( (collection) => {
        this.promotionTemplateList = collection.items;
        this.promotionTemplateMeta = collection.meta;
        this.isPromotionTemplateLoading = false;
      }, (error) => {
        this.alertService.error(error);
        this.isPromotionTemplateLoading = false;
      });
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
    this.dataService.updateDunningProcess(this.model.id, action)
      .subscribe((model: DunningProcess) => this.model.dunningProcess = model);
  }

  onPricingPlanRateChange(id: number) {
    this.currentPricingPlan.currentPricingPlanRate = _.find(this.pricingPlanRateList, { id: Number(id) });
    if (this.currentPricingPlan.currentPricingPlanRate) {
      this.model.offPeakRate = this.currentPricingPlan.currentPricingPlanRate.offPeakRate;
      this.model.discountPercentage = this.currentPricingPlan.currentPricingPlanRate.discountPercentage;
      this.model.cleanEnergyPercentage = this.currentPricingPlan.currentPricingPlanRate.cleanEnergyPercentage;
    } else {
      this.model.cleanEnergyPercentage = 0;
    }
  }

  onPricingPlanChange(name: string) {
    const selectedPricingPlan = _.find(this.pricingPlanList, { name });

    if (selectedPricingPlan) {
      if (selectedPricingPlan.productType === ProductType.DiscountOffTariff) {
        this.model.contractType = ContractType.Dot;
      } else if (selectedPricingPlan.productType === ProductType.FixedPrice) {
        this.model.contractType = ContractType.Fix;
      }

      if (selectedPricingPlan.name !== this.model.pricingPlanName) {
        this.model.pricingPlanName = selectedPricingPlan.name;
        this.currentPricingPlan.currentPricingPlanRate = null;
      }

      this.pricingPlanRateService
        .fetchAll( { 'pricePlanId': selectedPricingPlan.id }, { sortAsc: false, sortBy: 'startDate' } )
        .subscribe(collection => this.pricingPlanRateList = collection.items);
    }
  }

  reloadPromotions(params: DataTableParams) {
    if (this.model.id) {
      this.promotionService
        .fetchAll({ 'contractId': this.model.id }, params)
        .subscribe(collection => (this.promotions = collection.items) && (this.promotionCount = collection.meta.count));
    }
  }

  reloadInvoices(params: DataTableParams) {
    if (this.model.id) {
      this.invoiceService
        .fetchAll({ 'contractId': this.model.id }, params)
        .subscribe(collection => (this.invoices = collection.items) && (this.invoiceCount = collection.meta.count));
    }
  }

  reloadDocuments = (attachments?: Attachment[]) => {
    if (attachments) {
      this.model.documents = attachments;
    }
  }

  uploadSuccess(attachment: Attachment) {
    this.model.contractDocument = attachment;
    this.modal.hide();
    this.isLoading = true;
    this.dataService.updatePartial(this.model, [ 'contractDocumentId' ]).subscribe(
      (model: Contract) => {
        this.isLoading = false;
        this.reloadDocuments(model.documents);
      }, (error) => this.onError(error));
  }

  uploadServiceAgreementSuccess(attachment: Attachment) {
    this.model.serviceAgreement = attachment;
    this.modal.hide();
    this.isLoading = true;
    this.dataService.update(this.model).subscribe(
      (model: Contract) => {
        this.isLoading = false;
        this.reloadDocuments(model.documents);
      }, (error) => this.onError(error));
  }

  initContractStatusToUpdate(modalUpdateStatus: ContractStatus) {
    this.modalContractStatus = modalUpdateStatus;
    this.model.reason = '';
  }

  onStatusUpdateConfirm() {
    const originStatus = this.model.status;
    this.model.status = this.modalContractStatus;
    if (this.selectedRetailer) {
      this.model.retailer = this.selectedRetailer;
    }
    this.dataService.updatePartial(this.model, ['status', 'reason', 'retailerId'])
      .subscribe(
        () => {
          this.alertService.success(`Update contract with id: ${this.model.id} successfully`, true );
          this.modal.hide();
          this.goToList();
        },
        (error) => {
          this.alertService.error(error.message);
          this.modal.hide();
          this.model.status = originStatus;
        }
      );
  }

  initBillingOption(modalAction: string) {
    this.modalAction = modalAction;
    this.selectedBillingPeriod = this.billingPeriodService.clone(this.model.billingPeriod);
  }

  updateBillingPeriod = () => {
    this.model.billingPeriod.billingOption = this.selectedBillingPeriod.billingOption;
    this.billingPeriodService.updatePartial(this.model.billingPeriod, ['billingOption'])
      .subscribe((model) => {
        this.model.billingPeriod = model;
        if (this.model.id) {
          this.dataService.updatePartial(this.model, ['billingPeriod']).subscribe( () => {
            this.model.billingOption = model.billingOption;
            this.modal.hide();
          });
        }
      });
  }

  reloadData(event: any) {
    let consumerId: number = null;
    if (this.currentConsumer) {
      // this is for garbage data when we have no id in the model
      if (this.currentConsumer.id) {
        consumerId = this.currentConsumer.id;
      }
    } else if (this.route.snapshot.queryParams['consumerId']) {
      consumerId = Number(this.route.snapshot.queryParams['consumerId']);
    }
    const consumerCriteria: { [key: string]: any } = {
      'isUnAssigned': '~true' ,
      'contractAssignedStatus': '~' + ContractStatus.Inactive
    };
    if (consumerId) {
      consumerCriteria['id'] = '~' + consumerId;
    }

    this.isConsumerLoading = true;
    this.consumerService
      .fetchAll(consumerCriteria, event.data)
      .subscribe(collection => {
        this.isConsumerLoading = false;
        if (!_.isEmpty(collection.items)) {
          this.consumerList = collection.items;
          this.consumerList = _.uniqBy(this.consumerList, 'id');
          this.consumerList = _.orderBy(this.consumerList, 'createdTime.short', false);
          if (!_.isEmpty(this.currentConsumer)) {
            this.consumerList.splice(this.consumerList.findIndex(consumer => consumer.id === this.currentConsumer.id), 1);
            this.consumerList.unshift(this.currentConsumer);
          }
        }
      },  (error: ErrorResponse) => {
        this.isConsumerLoading = false;
        this.modal.hide();
        this.alertService.clear();
        this.alertService.error(error.message, true);
      });
  }

  onSelect(event: any) {
    if (this.currentConsumer === null) {
      this.currentConsumer = new Consumer();
    }
    if (event.item.id === this.currentConsumer.id) {
      return;
    }
    this.currentConsumer = _.cloneDeep(event.item);
    this.modal.hide();
  }
}
