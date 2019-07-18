import { Component, Injector, OnInit } from '@angular/core';
import {
  Contract,
  ContractService,
  ContractType, Customer, CustomerService, DateMoment,
  ErrorResponse,
  Invoice,
  InvoiceService,
  PricingPlan,
  PricingPlanService,
  ProductType,
} from '@app/core';
import { FormComponent } from '../shared/views/crud/form.component';
import * as _ from 'lodash';

const INVOICE_EDIT_FIELDS = [ 'newBalance', 'status', 'remarks' , 'rebate' , 'paymentReceived',
  'oldBalance', 'invoiceDate' , 'dueDate' ];

@Component({
  selector: 'admin-invoice-edit',
  templateUrl: './invoice-edit.component.html',
})
export class InvoiceEditComponent extends FormComponent<Invoice, InvoiceService> implements OnInit {
  modelName = 'Invoice';
  currentContract: Contract = null;
  currentCustomer: Customer = null;
  currentPricingPlan: PricingPlan = null;
  ContractType = ContractType;
  dataInvoice: Invoice = null;

  rateChargeEvent: number = null;
  chargeableAmount: number = null;

  adjustRateChargeEvent: number = null;
  adjustChargeableAmount: number = null;

  periodDateFrom = new DateMoment();
  periodDateTo = new DateMoment();
  amtBeforeGST: number = null;
  adjustGstAmt: number = null;

  gstAmount: number = null;

  invoice_edit_fields = INVOICE_EDIT_FIELDS;

  constructor(
    injector: Injector,
    protected dataService: InvoiceService,
    private contractService: ContractService,
    private pricingPlanService: PricingPlanService,
    private customerService: CustomerService,

) {
    super(injector);
    this.model = new Invoice();

  }

  protected onFetchModelFinished = () => {
    this.gstAmount = parseFloat((this.model.breakDownOfCharges[0].chargeableAmount
      - this.model.breakDownOfCharges[0].taxAbleAmount).toFixed(4));
    this.model.rebate = Math.abs(this.model.rebate);
    this.contractService.fetchOne(this.model.contract.id).subscribe(
      (contract: Contract) => {
        if (_.isEmpty(contract)) {
          this.currentContract = null;
        } else {
          this.currentContract = contract;
          this.getCustomer();
        }
      }, (error: ErrorResponse) => {

        this.currentContract = null;
        this.alertService.error(error.message);
      });
  }

  getCustomer() {
    this.customerService.fetchOne(this.model.customer.id).subscribe(
      data => {
        this.currentCustomer = data;
        this.getPricingPlan();
      }, (error: ErrorResponse) => {

        this.currentCustomer = null;
        this.alertService.error(error.message);
      });
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
      }, (error: ErrorResponse) => {

        this.currentPricingPlan = null;
        this.alertService.error(error.message);
      });
    this.getInvoice();
  }

  getInvoice() {
    this.dataService.fetchInvoice(this.model.id).subscribe((invoice: Invoice) => {
      this.dataInvoice = invoice;
      console.log(this.dataInvoice);
    });
  }

  editInvoice(isNew: boolean) {
    this.model.status = isNew ? null : 'pending';
    this.model.invoiceDate = this.dataInvoice.invoiceDate;
    this.model.dueDate = this.dataInvoice.dueDate;
    this.dataService.updatePartial(this.model, this.invoice_edit_fields).subscribe(() => {
      this.alertService.success(`Edit Invoice successfully.`);
      this.isLoading = false;
      if (this.model.status === 'pending') {
        this.router.navigate([ '/admin/management/invoices' ]).then();
      }
    }, (err) => {
      this.alertService.error(`Edit Invoice failed. ` + err.errors);
      this.isLoading = false;
    });
  }

  onChangeInvoiceDate(invoiceDate) {
    if (!_.isEmpty(invoiceDate.short)) {
      const dueDate = _.cloneDeep(this.dataInvoice.invoiceDate);
      this.dataInvoice.dueDate.moment = dueDate.moment.add(14, 'days');
    }
  }

}
