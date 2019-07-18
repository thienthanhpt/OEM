import { Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import { DataTableRowComponent } from '@app/libs/data-table/components/data-table-row.component';

import { ListComponent } from '../../shared';
import { Customer, CustomerService, Model, MODEL_OPTIONS, InvoiceAgingReportService, ErrorResponse } from '@app/core';

@Component({
  selector: 'admin-aging-invoice-generate-list',
  templateUrl: 'aging-invoice-generate-list.component.html',
})
export class AgingInvoiceGenerateListComponent extends ListComponent<Customer, CustomerService> implements OnInit {

  @ViewChild('selectedCustomerModal') selectedCustomerModal: TemplateRef<any>;

  protected searchFields = [
    '~spAccountNo', '~name', '~gstRegisteredNo', '~identificationNo',
    '~postalCode', '~address', '~typeValue',
  ];

  selectedCustomers: Customer[] = [];
  modalLoading = false;
  modalPage = 0;
  modalLimit = 20;
  modalCurrentPage: number;

  constructor(
    injector: Injector,
    protected dataService: CustomerService,
    protected invoiceAgingService: InvoiceAgingReportService,
    private router: Router,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.Customer]));
  }

  onRowSelected(selectedCustomer: Customer, selected: boolean) {
    const index = _.findIndex(this.selectedCustomers, (customer: Customer) => customer.id === selectedCustomer.id);
    if (selected && index < 0) {
      this.selectedCustomers.push(selectedCustomer);
    } else if (!selected && index >= 0) {
      this.selectedCustomers.splice(index, 1);
    }
  }

  onRowCreated(row: DataTableRowComponent) {
    setTimeout(() => {
      const index = _.findIndex(this.selectedCustomers, customer => customer.id === row.item.id);
      row.selected = index >= 0;
    });
  }

  openSelectedCustomersModal() {
    if (this.selectedCustomers.length > 0) {
      // calculate paging
      this.modalCurrentPage = 1;
      this.updateModalPaging();

      this.modal.open(this.selectedCustomerModal, 'lg');
    }
  }

  updateModalPaging() {
    if (Math.floor(this.selectedCustomers.length / this.modalLimit) === this.selectedCustomers.length / this.modalLimit) {
      this.modalPage = this.selectedCustomers.length / this.modalLimit;
    } else {
      this.modalPage = Math.floor(this.selectedCustomers.length / this.modalLimit) + 1;
    }
  }

  removeCustomerFromList(customer: Customer) {
    const index = this.selectedCustomers.indexOf(customer);
    this.selectedCustomers.splice(index, 1);
    this.dataTable.rows.forEach(row => {
      if (row.item.id === customer.id) {
        row.selected = false;
      }
    });
    if (this.selectedCustomers.length === 0) {
      this.modal.hide();
    } else {
      this.updateModalPaging();
      if (this.getDisplayCustomerOnPaging.length === 0) {
        this.modalCurrentPage -= 1;
      }
    }
  }

  get getDisplayCustomerOnPaging(): Customer[] {
    const start = this.modalLimit * (this.modalCurrentPage - 1);
    const end = (start + this.modalLimit) > this.selectedCustomers.length ? this.selectedCustomers.length : start + this.modalLimit;
    return _.slice(this.selectedCustomers, start, end);
  }

  get pageCount(): number[] {
    return new Array(this.modalPage);
  }

  generateSuccess = () => {
    this.modalLoading = false;
    this.modal.hide();
    this.alertService.success('Aging invoice report generated successfully.', true);
    this.router.navigate( [this.linkToList()]);
  }

  generateError = (error: ErrorResponse) => {
    this.modalLoading = false;
    this.modal.hide();
    this.alertService.error(error.message);
  }

  generate() {
    const customerIds: number[] = [];
    if (_.size(this.selectedCustomers)) {
      _.forEach(this.selectedCustomers, ((customer: Customer) => {
        customerIds.push(customer.id);
      }));
    }

    this.modalLoading = true;
    this.invoiceAgingService.generate({ 'customer_ids': customerIds }).subscribe(this.generateSuccess, this.generateError);
  }

  generateAll() {
    this.modalLoading = true;
    this.invoiceAgingService.generateAll().subscribe(this.generateSuccess, this.generateError);
  }

  linkToList(): string {
    return this.router.createUrlTree(['..'], { relativeTo: this.route }).toString();
  }
}
