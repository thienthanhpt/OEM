import { FormComponent } from '../shared';
import {
  Consumer,
  ConsumerService,
  ContractService,
  PricingPlanService,
  Contract,
  Customer,
  CustomerService, ErrorResponse,
  Invoice,
  InvoiceService, PricingPlan, ProductType, ContractType, DateMoment, InvoiceCharge,
} from '../../core/data-services';
import { Component, Injector, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'admin=invoice-form-create',
  templateUrl: 'invoice-form-create.component.html'
})
export class InvoiceFormCreateComponent extends FormComponent<Invoice, InvoiceService> {
  @ViewChild('selectCustomerName') selectCustomerName: any;

  modelName = 'Create Invoice';

  customerList: Customer[] = [];
  consumerList: Consumer[] = [];
  currentCustomer: Customer = null;
  currentConsumer: Consumer = null;
  currentContract: Contract = null;
  currentPricingPlan: PricingPlan = null;
  ContractType = ContractType;

  periodDateFrom = new DateMoment();
  periodDateTo = new DateMoment();
  amtBeforeGST: number = null;
  adjustGstAmt: number = null;
  amountBeforeGST: number = null;

  // adjustRate: number = null;
  // chargeType: string = null;
  // chargeName: string = null;
  // chargeValue: number = null;
  contractType = ContractType;
  isRequire = false;
  rateChargeEvent: number = null;
  chargeableAmount: number = null;

  adjustRateChargeEvent: number = null;
  adjustChargeableAmount: number = null;

  selectedItems = null;
  dropdownSettings = {};

  constructor(
    injector: Injector,
    protected dataService: InvoiceService,
    private customerService: CustomerService,
    private consumerService: ConsumerService,
    private contractService: ContractService,
    private pricingPlanService: PricingPlanService,
  ) {
    super(injector);
    this.model = new Invoice();

    if (_.isEmpty(this.model.contract)) {
      this.model.contract = new Contract();
    }

    if (_.isEmpty(this.model.customer)) {
      this.model.customer = new Customer();
    }

    if (_.isEmpty(this.model.consumer)) {
      this.model.consumer = new Consumer();
    }
    this.model.contract.commissionedDate.moment = moment();
  }

  protected onFetchModelFinished = () => {
    this.customerService.fetchAll().subscribe(
      collection => {
        this.customerList = collection.items;
      }
    );

    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

  }

  onSelectCustomer(customerId: number) {
    this.selectCustomerName.closeDropdown();
    customerId = _.toNumber(customerId);
    this.model.customer.id = customerId;
    this.currentCustomer = _.find(this.customerList, ['id', customerId]);
    this.customerService.fetchOne(customerId).subscribe(
      data => {
        if (!_.isEmpty(data.consumers)) {
          this.consumerList = data.consumers;
          this.onSelectConsumer(this.consumerList[0].id);
        }
      }
    );
  }

  onDeSelect(event: { id: number, name: string }) {
    console.log(event);
  }

  onSelectConsumer(id: number) {
    const consumerId = _.toNumber(id);
    this.model.consumer.id = consumerId;
    this.consumerService.fetchOne(consumerId).subscribe((consumer: Consumer) => {
      this.currentConsumer = consumer;
      const contractId = _.find(this.consumerList, ['id', consumerId]).contractId;
      if (!_.isUndefined(contractId)) {
        // this.model.contract.id = contractId;
        this.loadContractSection(contractId);
      }
    });
  }

  loadConsumerSection(id: number) {
    if (id != null) {
      this.consumerService.fetchOne(id).subscribe(
        (consumer: Consumer) => {

          if (_.isEmpty(consumer)) {
            this.alertService.error('Failed for loading this consumer data');
          } else {
            this.currentConsumer = consumer;
          }
        }, (error: ErrorResponse) => {
          this.alertService.error(error.message);
        });
    }
  }

  loadContractSection(id: number) {
    if (id != null) {
      this.contractService.fetchOne(id).subscribe(
        (contract: Contract) => {
          if (_.isEmpty(contract)) {
            this.currentContract = null;
          } else {
            this.currentContract = contract;
            this.model.contract = contract;
            this.getPricingPlan();
          }
        }, (error: ErrorResponse) => {

          this.currentContract = null;
          this.alertService.error(error.message);
        });
    }
  }

  getPricingPlan() {
    this.pricingPlanService.fetchOneByCustomerType(this.currentContract.pricingPlanId, _.toString(this.currentCustomer.type))
      .subscribe((plan: PricingPlan) => {
        this.currentPricingPlan = plan;
        if (plan.productType === ProductType.DiscountOffTariff) {
          this.currentContract.contractType = ContractType.Dot;
        } else if (plan.productType === ProductType.FixedPrice) {
          this.currentContract.contractType = ContractType.Fix;
        }
      });
  }

  addInvoice(isNew: boolean) {
    this.isLoading = true;
    const invoiceCharge = new InvoiceCharge();
    invoiceCharge.billingPeriod = (this.model.invoiceFromDate.moment.format('DD/MM/YY')
      + ' - ' + this.model.invoiceToDate.moment.format('DD/MM/YY'));
    invoiceCharge.usageKWH = this.model.usageAmount;
    invoiceCharge.taxAbleAmount = this.amountBeforeGST;
    invoiceCharge.rate = this.rateChargeEvent;
    invoiceCharge.chargeableAmount = parseFloat((this.amountBeforeGST + this.model.gstAmount).toFixed(4));
    this.model.chargingEvents = [];
    this.model.chargingEvents.push(invoiceCharge);
    const invoiceAdjustCharge = new InvoiceCharge();
    if (this.isRequire) {
      invoiceAdjustCharge.billingPeriod = (this.periodDateFrom.moment.format('DD/MM/YY')
        + ' - ' + this.periodDateTo.moment.format('DD/MM/YY'));
      invoiceAdjustCharge.rate = this.adjustRateChargeEvent || 0;
      invoiceAdjustCharge.usageKWH = this.model.adjustUsageAmount;
      invoiceAdjustCharge.taxAbleAmount = this.amtBeforeGST || 0;
      invoiceAdjustCharge.chargeableAmount = parseFloat((this.adjustGstAmt + this.amtBeforeGST).toFixed(4));
      this.model.chargingEvents.push(invoiceAdjustCharge);
    }
    this.adjustGstAmt = this.adjustGstAmt || 0;
    this.model.gstExemptedAmount = parseFloat((this.model.gstAmount + (this.adjustGstAmt || 0)).toFixed(4));
    this.model.oldBalance = this.model.oldBalance || 0;
    this.model.paymentReceived = this.model.paymentReceived || 0;
    this.model.currentOutstandingBalance = parseFloat((this.model.oldBalance - this.model.paymentReceived).toFixed(4));
    const totalChargeEvent = parseFloat((this.model.chargingEvents.reduce((total, chargingEvent) => {
      return total += chargingEvent.chargeableAmount; }, 0)).toFixed(4));
    this.model.totalAmountPayable =  parseFloat((totalChargeEvent - this.model.rebate + this.model.remarksCharges).toFixed(4));
    const invoiceBillDate = _.cloneDeep(this.model.invoiceDate);
    this.model.invoiceBillDateMonth = invoiceBillDate.moment.format('MMM YYYY');
    this.model.usageToDate = this.model.invoiceToDate;
    this.model.usageFromDate = this.model.invoiceFromDate;
    this.model.status = isNew ? 'new' : 'pending';
    this.dataService.createInvoice(this.model)
      .subscribe(() => {
        this.alertService.success(`Create Invoice successfully.`);
        this.isLoading = false;
        if (this.model.status === 'pending') {
          this.router.navigate([ '/admin/management/invoices' ]).then();
        }
      }, () => {
        this.alertService.error(`Create Invoice failed.`);
        this.isLoading = false;
      });
  }

  onChangeInvoiceDate(invoiceDate) {
    if (!_.isEmpty(invoiceDate.short)) {
      const dueDate = _.cloneDeep(this.model.invoiceDate);
      this.model.dueDate.moment = dueDate.moment.add(14, 'days');
    }
  }

  // onCreateCharge() {
  //   const invoiceChargeEvents = new InvoiceChargeEvent();
  //   invoiceChargeEvents.chargeType = this.chargeType;
  //   invoiceChargeEvents.chargeName = this.chargeName;
  //   invoiceChargeEvents.chargeValue = this.chargeValue;
  //   this.model.charge.push(invoiceChargeEvents);
  //   this.chargeType = null;
  //   this.chargeName = null;
  //   this.chargeValue = null;
  //   console.log(this.model.charge);
  // }
  //
  // removeCharge = (item: InvoiceChargeEvent) => {
  //   const index = this.model.charge.indexOf(item);
  //   this.model.charge.splice(index, 1);
  // }
  isValid5Fields() {
    this.isRequire = !_.isEmpty(this.periodDateFrom.short) || !_.isEmpty(this.periodDateTo.short)
      || _.isNumber(this.model.adjustUsageAmount)
      || _.isNumber(this.amtBeforeGST)
      || _.isNumber(this.adjustGstAmt)
      || _.isNumber(this.adjustRateChargeEvent);
  }

  calculateChargeableAmount(isAdjust: boolean) {
    if (isAdjust) {
      this.adjustChargeableAmount = parseFloat((this.adjustGstAmt + this.amtBeforeGST).toFixed(4));
      this.isValid5Fields();
    } else {
      this.chargeableAmount = parseFloat((this.amountBeforeGST + this.model.gstAmount).toFixed(4));
    }
  }

}
