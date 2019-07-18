import { Component, Injector, OnDestroy, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { forkJoin } from 'rxjs';

import * as _ from 'lodash';

import { DateMoment, Invoice, InvoiceService, InvoiceStatistic, InvoiceStatus } from '@app/core';
import { DataTableParams } from '../../libs/data-table/components/types';
import { ListComponent, AdminConfig } from '../shared';

export enum InvoiceAction {
  UpdateStatus = 'updateStatus',
  SendDispatch = 'sendDispatch'
}

@Component({
  selector: 'admin-invoice-statistic-list',
  templateUrl: 'invoice-statistic.component.html',
})
export class InvoicesStatisticComponent extends ListComponent<Invoice, InvoiceService> implements OnInit, OnDestroy {

  @ViewChild('confirmMultipleActionModal') confirmMultipleActionModal: any;
  @ViewChild('blockDetail') blockDetail: ElementRef;

  modelName = 'Invoice Statistic';

  InvoiceAction = InvoiceAction;
  action: InvoiceAction;

  invoiceToReview: Invoice = null;
  invoiceToAction: Invoice = null;
  invoiceListToAction: Invoice[] = [];

  isInvoiceStatisticsBeingView = true;
  invoiceDateToFetchData = new DateMoment();
  invoiceToReviewPage = 0;

  invoicePagination: DataTableParams = {
    limit: 20,
    sortBy: 'dueDate',
    sortAsc: false,
    offset: 0,
  };

  invoiceStatistics: InvoiceStatistic[];
  invoiceStatisticToReview: InvoiceStatistic;

  InvoiceStatus = InvoiceStatus;

  adminConfig = AdminConfig;
  isInvoiceGenerating = false;
  isInvoiceHasDocument = false;

  blockDetailTop = 0;
  footerTop = 0;

  constructor(
    injector: Injector,
    protected dataService: InvoiceService,
  ) {
    super(injector);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.initScroll();
  }

  ngOnInit() {
    this.dataService.fetchInvoiceStatistics()
    .subscribe((invoiceStatistics) => {
        this.invoiceStatistics = invoiceStatistics.items;
        this.invoiceStatisticToReview = this.invoiceStatistics[0];
        this.invoiceDateToFetchData = this.invoiceStatisticToReview.invoiceDate;
        this.reloadItems(this.invoicePagination);
      }, (error) => this.onError(error));

    window.addEventListener('scroll', this.scroll, true);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scroll, true);
  }

  initScroll() {
    this.blockDetailTop = this.calculateOffsetTop(document.getElementById('blockList').getBoundingClientRect().top);
    this.footerTop = this.calculateOffsetTop(document.getElementsByClassName('app-footer')[0].getBoundingClientRect().top);
  }

  calculateOffsetTop(clientReactTop: number): number {
    return clientReactTop + window.pageYOffset - document.documentElement.clientTop;
  }

  scroll = (): void => {
    if (this.invoiceToReview && this.blockDetail) {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

      if (scrollTop > this.blockDetailTop) {
        const scrollX = scrollTop - this.blockDetailTop;
        const blockDetailBottom = scrollX + this.blockDetail.nativeElement.clientHeight;

        if (scrollX > 0 && blockDetailBottom < this.footerTop) {
          this.blockDetail.nativeElement.style.top = scrollX + 'px';
        }
      } else {
        this.blockDetail.nativeElement.style.top = '0px';
      }
    }
  }

  initConfirmActionOnInvoice = (invoice: Invoice, action: InvoiceAction, status?: InvoiceStatus) => {
    this.action = action;
    this.invoiceToAction = this.dataService.clone(invoice);
    if (status) {
      this.invoiceToAction.status = status;
    }
  }

  initConfirmActionOnMultipleInvoice = (action: InvoiceAction, status?: InvoiceStatus) => {
    this.action = action;
    this.invoiceListToAction = [];
    _.each(this.dataTable.selectedRows, row => {
      const invoice = this.dataService.clone(row.item);
      if (status) {
        invoice.status = status;
      }
      this.invoiceListToAction.push(invoice);
    });
    if (_.size(this.invoiceListToAction) > 0) {
      this.modal.open(this.confirmMultipleActionModal, 'lg');
    }
  }

  actionOnInvoice = (action: InvoiceAction, multipleUpdate = false) => {
    this.invoiceToReview = null;
    this.alertService.clear();
    this.isLoading = true;
    if (multipleUpdate) {
      if (_.size(this.invoiceListToAction)) {
        let requests: any;
        if (action === InvoiceAction.UpdateStatus) {
          requests = _.map(this.invoiceListToAction, invoice => this.dataService.updatePartial(invoice, ['status']));
        } else {
          requests = _.map(this.invoiceListToAction, invoice => this.dataService.sendInvoiceViaEmail(invoice.id));
        }
        if (!_.isEmpty(requests)) {
          if (this.modal) {
            this.modal.hide();
          }
          forkJoin(requests).subscribe(() => this.reloadItems(this.invoicePagination), error => this.onError(error));
        }
      }
    } else {
      if (action === InvoiceAction.UpdateStatus) {
        this.dataService.updatePartial(this.invoiceToAction, ['status'])
          .subscribe(() => this.reloadItems(this.invoicePagination), error => this.onError(error));
      } else {
        this.dataService.sendInvoiceViaEmail(this.invoiceToAction.id)
          .subscribe(() => this.reloadItems(this.invoicePagination)
          , error => this.onError(error));
      }
    }
  }

  removeInvoiceFromList = (invoice: Invoice) => {
    const index = this.invoiceListToAction.indexOf(invoice);
    this.invoiceListToAction.splice(index, 1);
    if (_.isEmpty(this.invoiceListToAction)) {
      this.modal.hide();
    }
  }

  onInvoiceStatisticChange = (item: InvoiceStatistic) => {
    this.invoiceStatisticToReview = item;
    this.invoiceDateToFetchData = item.invoiceDate;
    this.reloadItems(this.invoicePagination);
  }

  reloadItems(meta?: DataTableParams) {
    if (this.modal) {
      this.modal.hide();
    }
    if (!_.isEmpty(this.invoiceDateToFetchData.moment)) {
      this.criteria = { 'invoiceDate': this.invoiceDateToFetchData.moment.format('YYYY-MM-DD') };
      return super.reloadItems(meta);
    }
  }

  onComplete = () => {
    if (this.invoiceToReview) {
      const item = _.find(this.items, (invoice: Invoice) => invoice.id === this.invoiceToReview.id);
      this.setInvoiceReview(item);
    }
    this.isLoading = false;
    this.isInvoiceGenerating = false;
  }

  setInvoiceReview(item: Invoice) {
    if (item) {
      this.invoiceToReview = item;
      this.isInvoiceHasDocument = !!item.invoiceDocument;
      this.invoiceToReviewPage = this.dataTable.offset;

      setTimeout(() => {
        this.initScroll();
        this.scroll();
      }, 400);
    }
  }

  forceGenerate(id: number) {
    if (id != null) {
      this.isInvoiceGenerating = true;
      this.alertService.clear();
      this.dataService.forceGenerate(id).subscribe(() => {
        this.invoicePagination.sortBy = this.dataTable.sortBy;
        this.invoicePagination.sortAsc = this.dataTable.sortAsc;
        this.invoicePagination.offset = this.invoiceToReviewPage;
        this.reloadItems(this.invoicePagination);
        this.alertService
          .success(`Invoice document ${ this.invoiceToReview.invoiceDocument ? 're-generated' : 'generated'} PDF successfully.`);
      }, this.onError);
    }
  }
}
