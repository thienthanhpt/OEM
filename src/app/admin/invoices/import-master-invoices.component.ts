import { ListComponent } from '../shared/views/crud/list.component';
import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorResponse } from '../../core/data-services';
import { Invoice, InvoiceImportModel, InvoiceService } from '../../core/data-services/invoice.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DataTableParams } from '@libs/data-table/components/types';

export class Error {
  line: number = null;
  reason: string = null;
}

export enum Headers {
  CustomerName = 'name', BillingOption = 'billing option', InvoiceNo = 'invoice', MSSL = 'mss',
  BillingPeriod = 'billing period', BalancePrevious = 'prev bal', UsageAmount = 'usage amt',
  Rate = 'rate', CurrentCharges = 'current charges', taxGST = 'gst',
  Rebate = 'rebate', AmountPayable = 'amt payable', PaymentReceived = 'pmt recd',
  PaymentDateReceived = 'date recd', PaymentMode = 'pmt mode', OutstandingBalance = 'o/s bal',
  DateInvoice = 'invoice date', AdditionCharge = 'addition charge'
}

@Component({
  selector: 'admin-import-master-invoices',
  templateUrl: 'import-master-invoices.component.html'
})
export class ImportMasterInvoicesComponent extends ListComponent<Invoice, InvoiceService> {
  @ViewChild('tempImportModal') tempImportModal: TemplateRef<any>;
  @ViewChild('errorListModal') errorListModal: TemplateRef<any>;
  @ViewChild('errorModal') errorModal: TemplateRef<any>;
  @ViewChild('dataTable') dataTable: any;

  invoicesListFromCSVFile: InvoiceImportModel[] = [];
  invoicesListFromCSVFileOnPage: InvoiceImportModel[] = [];
  invoicesListSelected: InvoiceImportModel[] = [];
  invoicesListCurrent: InvoiceImportModel[] = [];
  allErrorInvoicesList: InvoiceImportModel[] = [];

  isImportAll = true;

  errorList: InvoiceImportModel[] = [];
  isDryRun = false;
  isDeleteAll = false;
  modalLoading = false;
  filePath = 's3-ap-southeast-1.amazonaws.com/sse-documents-storage-prod/media/403111e2244c141e718ca133ad05a93dc51ec1b4' +
    '/Template-Import-Invoice.csv';
  invoiceMeta: { [name: string]: number } = {
    count: 0,
    page: 1,
  };

  invoicePagination: DataTableParams = {
    limit: 20,
    sortBy: 'line',
    sortAsc: false,
    offset: 0
  };

  headers = Headers;
  erorrMessage = '';

  constructor(
    injector: Injector,
    protected dataService: InvoiceService,
    private router: Router,
  ) {
    super(injector);
  }

  reader(content: string) {
    let indexCustomerName, indexOfBillingOption, indexOfInvoiceNo, indexOfMSSL, indexOfBillingPeriod, indexOfBalanceRrevious,
      indexOfUsageAmount, indexOfRate, indexOfCurrentCharges, indexOfTaxGST, indexOfRebate, indexOfAmountPayable, indexOfPaymentReceived,
      indexOfPaymentDateReceived, indexOfPaymentMode, indexOfOutstandingBalance, indexOfDateInvoice, indexOfAdditionCharge;

    _.forEach(content.split('\n'), (line, index) => {

      if (index === 0 && line) {
        const values = _.map(line.toLowerCase().split(','), _.trim);

        if (values.length >= 18) {
          indexCustomerName = _.indexOf(values, this.headers.CustomerName);
          indexOfBillingOption = _.indexOf(values, this.headers.BillingOption);
          indexOfInvoiceNo = _.indexOf(values, this.headers.InvoiceNo);
          indexOfMSSL = _.indexOf(values, this.headers.MSSL);
          indexOfBillingPeriod = _.indexOf(values, this.headers.BillingPeriod);
          indexOfBalanceRrevious = _.indexOf(values, this.headers.BalancePrevious);
          indexOfUsageAmount = _.indexOf(values, this.headers.UsageAmount);
          indexOfRate = _.indexOf(values, this.headers.Rate);
          indexOfCurrentCharges = _.indexOf(values, this.headers.CurrentCharges);
          indexOfTaxGST = _.indexOf(values, this.headers.taxGST);
          indexOfRebate = _.indexOf(values, this.headers.Rebate);
          indexOfAmountPayable = _.indexOf(values, this.headers.AmountPayable);
          indexOfPaymentReceived = _.indexOf(values, this.headers.PaymentReceived);
          indexOfPaymentDateReceived = _.indexOf(values, this.headers.PaymentDateReceived);
          indexOfPaymentMode = _.indexOf(values, this.headers.PaymentMode);
          indexOfOutstandingBalance = _.indexOf(values, this.headers.OutstandingBalance);
          indexOfDateInvoice = _.indexOf(values, this.headers.DateInvoice);
          indexOfAdditionCharge = _.indexOf(values, this.headers.AdditionCharge);
        } else {
          this.modal.open(this.errorModal, 'sm', { ignoreBackdropClick: true });
        }

      } else if (index > 0 && _.trim(line)) {
        const values = line.split(',');

        const invoiceImport = new InvoiceImportModel();
        invoiceImport.line = index;
        invoiceImport.customerName = values[indexCustomerName];
        invoiceImport.billingOption = values[indexOfBillingOption];
        invoiceImport.invoiceNo = values[indexOfInvoiceNo];
        invoiceImport.msslNo = values[indexOfMSSL];
        invoiceImport.billingPeriod = moment(_.trim(_.split(values[indexOfBillingPeriod], '-')[0]), 'DD MMM YYYY').format('DD/MM/YYYY')
          + ' - ' + moment(_.trim(_.split(values[indexOfBillingPeriod], '-')[1]), 'DD MMM YYYY').format('DD/MM/YYYY');
        invoiceImport.balanceFromPreviousBill = _.toNumber(values[indexOfBalanceRrevious]);
        invoiceImport.usageAmount = _.toNumber(values[indexOfUsageAmount]);
        invoiceImport.rate = _.toNumber(values[indexOfRate]);
        invoiceImport.currentCharges = _.toNumber(values[indexOfCurrentCharges]);
        invoiceImport.taxGST = _.toNumber(values[indexOfTaxGST]);
        invoiceImport.rebate = _.toNumber(values[indexOfRebate]);
        invoiceImport.amountPayable = _.toNumber(values[indexOfAmountPayable]);
        invoiceImport.paymentReceived = _.toNumber(values[indexOfPaymentReceived]);
        invoiceImport.paymentDateReceived = moment(values[indexOfPaymentDateReceived], 'DD MMM YYYY').format('DD/MM/YYYY');
        invoiceImport.paymentMode = values[indexOfPaymentMode];
        invoiceImport.outstandingBalance = values[indexOfOutstandingBalance];
        invoiceImport.dateInvoice = moment(values[indexOfDateInvoice], 'DD MMM YYYY').format('DD/MM/YYYY');
        invoiceImport.additionCharge = values[indexOfAdditionCharge];
        this.invoicesListFromCSVFile.push(invoiceImport);
      }
    });
    this.invoicesListFromCSVFile = _.sortBy(this.invoicesListFromCSVFile, 'line');
    this.getInvoicesDisplayOnPaging();
    this.modal.hide();

  }

  onRowSelected(invoiceSelected?: InvoiceImportModel, isSelected?: boolean) {

    const index = _.findIndex(this.invoicesListSelected, (row: InvoiceImportModel) => row.line === invoiceSelected.line);
    if (isSelected && index < 0) {
      this.invoicesListSelected.push(invoiceSelected);
    } else if (!isSelected && index >= 0) {
      this.invoicesListSelected.splice(index, 1);
    }
  }

  showInvoicesWillBeImported() {
    this.isDeleteAll = false;
    this.invoicesListCurrent = _.sortBy(this.invoicesListSelected, 'line');
    this.invoiceMeta.page = 1;
    this.getInvoicesDisplayOnPaging();
    this.modal.open(this.tempImportModal, 'lg');
  }

  linkToList(): string {
    return this.router.createUrlTree(['..'], { relativeTo: this.route }).toString();
  }

  importInvoices() {
    this.invoiceMeta.page = 1;
    this.modalLoading = true;
    if (this.isImportAll) {
      this.dataService.importInvoices(this.invoicesListFromCSVFile, this.isDryRun).subscribe(
        (collection) => {
          this.updateDataAfterImport(collection.items);
        },
        (error: ErrorResponse) => {
          this.modal.hide();
          this.modalLoading = false;
          this.alertService.error(error.message);
        }
      );
    } else {
      if (this.invoicesListCurrent.length > 0) {
        this.dataService.importInvoices(this.invoicesListCurrent, this.isDryRun).subscribe(
          (collection) => {
            this.updateDataAfterImport(collection.items);
          },
          (error: ErrorResponse) => {
            this.modal.hide();
            this.modalLoading = false;
            this.alertService.error(error.message);
          }
        );
      }
    }
  }

  removeInvoice(invoice: InvoiceImportModel, isSelected?: boolean) {
    if (isSelected) {
      this.invoicesListCurrent.splice(_.indexOf(this.invoicesListCurrent, invoice), 1);
    } else {
      this.invoicesListFromCSVFile.splice(_.indexOf(this.invoicesListFromCSVFile, invoice), 1);
      this.invoicesListSelected.splice(_.indexOf(this.invoicesListCurrent, invoice), 1);
    }
  }

  openModalInvoiceError() {
    this.isDeleteAll = true;
    this.modal.open(this.errorListModal, 'lg');
  }

  deleteAllInvoicesError() {
    this.invoicesListFromCSVFile = _.filter(this.invoicesListFromCSVFile, invoice => (invoice.isInserted !== false));
    this.getInvoicesDisplayOnPaging();
    this.allErrorInvoicesList = [];
    this.modal.hide();
  }

  resetAllSelectedRow() {
    this.dataTable.selectAllCheckbox = false;
    this.invoicesListSelected = [];
    this.invoicesListCurrent = [];
    this.invoiceMeta.page = 1;
    this.getInvoicesDisplayOnPaging();
  }

  updateDataAfterImport(invoiceList: InvoiceImportModel[]) {
    this.modalLoading = false;
    this.invoicesListSelected = [];
    this.modal.hide();
    this.dataTable.resetAllSelected();
    if (invoiceList && invoiceList.length > 0) {

      invoiceList.forEach((item: InvoiceImportModel) => {
        if (!this.isDryRun && item.isInserted) {
          this.invoicesListFromCSVFile.splice(_.findIndex(this.invoicesListFromCSVFile, {line: item.line}), 1);
        }
        this.invoicesListFromCSVFile.map(invoice => {
          if (_.isEqual(item.line, invoice.line)) {
            invoice.isInserted = item.isInserted;
            invoice.reason = item.reason;
          }
        });
        this.allErrorInvoicesList = _.filter(this.invoicesListFromCSVFile, (invoice => invoice.isInserted === false));
      });
    }
    this.modalLoading = false;
    this.invoicesListSelected = [];
    this.modal.hide();
    this.errorList = _.filter(this.invoicesListFromCSVFile,
      (invoice) => _.findIndex(this.invoicesListCurrent, { line: invoice.line }) > -1
        && invoice.isInserted === false);

    if (this.errorList.length > 0) {
      if (this.errorList.length < this.invoicesListCurrent.length) {
        this.alertService.success('Import invoices successfully.');
      }
      this.modal.open(this.errorListModal, 'lg');
    }
  }

  reloadItemsInvoice(params: DataTableParams) {
    this.invoiceMeta.page = Math.floor(params.offset / params.limit) + 1;
    this.getInvoicesDisplayOnPaging();
  }

  getInvoicesDisplayOnPaging() {
    const start = (this.invoiceMeta.page - 1) * this.invoicePagination.limit;
    const end = start + this.invoicePagination.limit > this.invoicesListCurrent.length
      ? this.invoicesListCurrent.length : start + this.invoicePagination.limit;
    this.invoicesListFromCSVFileOnPage =  _.slice(this.invoicesListCurrent, start, end);
  }
}
