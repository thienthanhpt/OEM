import { Component, Injector, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { Subject, forkJoin } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DataTableColumnComponent, DataTableParams, DataTableRowComponent } from '@app/libs/data-table/data-table.module';

import { ModalConfig, ModalService } from '@app/admin/shared/services/modal.service';
import { ListComponent } from '@app/admin/shared/views/crud/list.component';
import { AlertModalService } from '@app/admin/shared/services/alert-modal.service';
import { PricingPlan, PricingPlanService } from '@core/data-services/pricing-plan.service';
import { BILLING_BC_OPTIONS, BILLING_OPTIONS, BillingOptionContent } from '@core/data-services/billing-period.service';
import { Transaction, TRANSACTION_STATUS_OPTIONS, TransactionService, TransactionStatus } from '@core/data-services/transaction.service';
import { Attachment } from '@core/data-services/attachment.service';
import { OrderTransactionType } from '@core/data-services/order.service';
import { Collection, ErrorResponse } from '@core/data-services/base.service';

const REJECT_REASON_OPTIONS = [
  'SP account number mismatch',
  'Svc add mismatch',
  'Acc no, svc add mismatch'
];

@Component({
  selector: 'admin-transactions-list',
  templateUrl: 'transactions-list.component.html',
  styles: [`
    table.no-border th, table.no-border td {
      border: none !important;
    }

    .transaction-view th, .transaction-view td {
      height: 46px;
      width: 16%;
    }

    .transaction-view .table-header th {
      background-color: lightgray;
    }

    .table-row-clear td {
      border: none;
      height: 16px;
      padding: 0;
    }

    table.order-item {
      border: none;
    }

    .btn-submit {
      color: black !important;
    }
    .btn-submit:hover {
      background-color: white;
      color: blue !important;
    }

    .btn-close {
      background-color: transparent;
      padding: 0;
    }
    .btn-close i {
      font-size: 1.2rem;
    }

    .order-detail p {
      margin-bottom: 0;
    }

    .btn-tab.active {
      background-color: #399DA3;
      color: white;
    }
  `],
})
export class TransactionsListComponent extends ListComponent<Transaction, TransactionService> implements OnInit, OnDestroy {

  @ViewChild('viewSSETransactionModal') viewSSETransactionModal: any;
  @ViewChild('previewDocument') previewDocument: any;
  @ViewChild('warningTransactionConfirmModal') warningTransactionConfirmModal: any;
  @ViewChild('confirmUpdateStatusModal') confirmUpdateStatusModal: any;
  @ViewChild('confirmMultipleUpdateStatusModal') confirmMultipleUpdateStatusModal: any;
  @ViewChild('updatePromotionCodeModal') updatePromotionCodeModal: any;
  @ViewChild('warningUpdatePromotionCodeModal') warningUpdatePromotionCodeModal: any;
  confirmUpdateStatusModalRef: any = null;
  confirmWarningTransactionModalRef: any = null;

  OrderTransactionType = OrderTransactionType;

  activeTab: string;

  modal: ModalService;

  transactionToReview: Transaction = null;
  transactionToUpdateStatus: Transaction = null;
  multipleTransactionToUpdateStatus: Transaction[] = [];
  isMultipleUpdateStatus = false;
  canUpdateStatus = false;
  transactionToConfirm: Transaction = null;

  rejectReasonOptions: string[] = REJECT_REASON_OPTIONS;
  transactionStatusCategories = _.map(TRANSACTION_STATUS_OPTIONS, (name, value) => ({ name, value, count: 0 }));

  TransactionStatus = TransactionStatus;
  transactionType: string = null;

  isTransactionBeingReview = false;

  attachmentToPreview: Attachment = null;

  firstTimeInitTable = true;

  defaultVisibleColumn = [
    'order.orderId', 'contractEffectiveDate.short', 'order.customerName', 'order.documentId',
    'order.rootItem.serviceId', 'serviceAddress', 'postalCode', 'order.items[0].contractSignedDate.short', 'selector',
  ];
  columnToHideInExtendedView = [
    'serviceAddress', 'postalCode', 'order.items[0].contractSignedDate.short',
  ];
  isCustomized = false;

  pricingPlanList: PricingPlan[] = [];
  pricePlanToUpdate = '';
  isMultipleUpdatePricePlan = false;
  modalLoading = false;
  promotionCodeToUpdate = '';
  isPromotionCodeValid = false;
  verifyingPromotionCode = false;
  transactionsToDelete: Transaction[] = [];

  promotionCodeKeyUpSubject: Subject<string> = new Subject();
  promotionCodeInListKeyUpSubject: Subject<any> = new Subject();
  msslNoKeyUpSubject: Subject<any> = new Subject();
  meterIdKeyUpSubject: Subject<any> = new Subject();
  readonly inputDelayedTime = 1000;
  billingOptions: { [key: string]: BillingOptionContent } = BILLING_OPTIONS;
  billingBcOptions: { [key: string]: BillingOptionContent } = BILLING_BC_OPTIONS;
  isExistsPromotionCodeInvalid = false;

  protected searchFields = [ '~orderId', '~customerName', '~customerIdentification', '~serviceAddress', '~consumerServiceAddress',
    '~consumerPostal', '~consumerServiceId',  '~promotionCode', '~customerMobile', '~customerEmail'
  ];

  constructor(
    injector: Injector,
    protected dataService: TransactionService,
    private pricingPlanService: PricingPlanService,
    private alertModalService: AlertModalService,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.criteria.status = this.activeTab = this.TransactionStatus.Pending;
    this.transactionType = window.document.location.pathname.split('/')[3];

    if (_.includes([
      OrderTransactionType.Subscription, OrderTransactionType.Termination, OrderTransactionType.Relocation
    ], this.transactionType)) {
      this.criteria['order.transactionType'] = this.transactionType;
    }

    this.pricingPlanService.fetchAll()
      .subscribe(collection => {
        this.pricingPlanList = _.uniqBy(collection.items, 'name');
      });

    this.promotionCodeKeyUpSubject.pipe(debounceTime(this.inputDelayedTime)).subscribe(code => this.verifyPromotionCode(code));

    this.msslNoKeyUpSubject
      .pipe(debounceTime(this.inputDelayedTime))
      .subscribe((value: { transaction: Transaction, msslNo: string }) => {
        if (value) {
          this.validateNewMsslNo(value.transaction, value.msslNo);
        }
      });

    this.meterIdKeyUpSubject
      .pipe(debounceTime(this.inputDelayedTime))
      .subscribe((value: { transaction: Transaction, meterId: string }) => {
        if (value) {
          this.validateNewMeterId(value.transaction, value.meterId);
        }
      });

    this.promotionCodeInListKeyUpSubject
      .pipe(debounceTime(this.inputDelayedTime))
      .subscribe((value: { transaction: Transaction, promoCode: string }) => {
        if (value) {
          this.validatePromotionCodeInList(value.transaction, value.promoCode);
        }
    });
  }

  ngOnDestroy() {
    this.promotionCodeInListKeyUpSubject.next(null);
    this.promotionCodeInListKeyUpSubject.unsubscribe();
    this.promotionCodeKeyUpSubject.next(null);
    this.promotionCodeKeyUpSubject.unsubscribe();
    this.meterIdKeyUpSubject.next(null);
    this.meterIdKeyUpSubject.unsubscribe();
    this.msslNoKeyUpSubject.next(null);
    this.msslNoKeyUpSubject.unsubscribe();
  }

  initPreviewDocument = (attachment: Attachment) => {
    if (this.modal) {
      this.modal.hide();
    }
    this.attachmentToPreview = attachment;
    this.isTransactionBeingReview = true;
    this.modal.open(this.previewDocument, 'lg', { }, { ignoreBackdropClick: true });
  }

  reloadItems(meta?: DataTableParams, isSwitchTab: boolean = false) {
    if (isSwitchTab || this.firstTimeInitTable) {
      switch (this.activeTab) {
        case TransactionStatus.Pending:
          meta.sortBy = 'contractExpectedStartDate';
          meta.sortAsc = true;
          break;
        case TransactionStatus.Submitted:
          meta.sortBy = 'updatedTime';
          meta.sortAsc = false;
          break;
        case TransactionStatus.Approved:
          meta.sortBy = 'approvedDate';
          meta.sortAsc = false;
          break;
        case TransactionStatus.Rejected:
          meta.sortBy = 'rejectedDate';
          meta.sortAsc = false;
          break;
        case TransactionStatus.Cancellation:
          meta.sortBy = 'cancelledDate';
          meta.sortAsc = false;
          break;
      }
      this.firstTimeInitTable = false;
    }

    return super.reloadItems(meta);
  }

  assignItems = (collection: Collection<Transaction>) => {
    this.items = collection.items;
    this.meta = collection.meta;
    _.forEach(this.transactionStatusCategories, (category) => {
      category.count = _.chain(collection.meta.status_categorize).find({ status: category.value })
        .get('count', 0)
        .value();
    });
  }

  onTabSelect(status: string): void {
    this.transactionToReview = null;
    this.items = [];
    this.activeTab = this.criteria.status = status;
    this.dataTable.selectColumnVisible = status === this.TransactionStatus.Pending
      || status === this.TransactionStatus.Submitted
      || status === this.TransactionStatus.Cancellation;
    this.reloadItems(_.assign(this.getResetTableParameters()), true);
  }

  initConfirmUpdateTransactionStatus = (transaction: Transaction, status: TransactionStatus) => {
    this.isMultipleUpdateStatus = false;
    this.canUpdateStatus = false;
    this.transactionToUpdateStatus = this.dataService.clone(transaction);

    if (_.has(this.billingBcOptions, transaction.billingOption)) {
      this.transactionToUpdateStatus.billingBC = transaction.billingOption;
    }

    if (status === TransactionStatus.Approved) {
      this.transactionToUpdateStatus.msslNo = null;
      this.transactionToUpdateStatus.meterId = null;
    }
    this.transactionToUpdateStatus.status = status;

    if (this.transactionToUpdateStatus.contractCommissionedDate.moment === null) {
      this.transactionToUpdateStatus.contractCommissionedDate.moment = moment();
    }
  }

  initConfirmUpdateMultipleTransactionStatus = (status?: TransactionStatus) => {
    this.multipleTransactionToUpdateStatus = [];
    this.isMultipleUpdateStatus = true;
    this.canUpdateStatus = false;
    if (this.dataTable.selectedRows.length > 0) {
      _.each(this.dataTable.selectedRows, (row, index) => {
        const transaction = this.dataService.clone(row.item);

        if (_.has(this.billingBcOptions, transaction.billingOption)) {
          transaction.billingBC = this.billingBcOptions[transaction.billingOption].value;
        }

        if (transaction.order && transaction.order.promotionCode) {
          transaction.isPromoCodeValidating = true;
          this.dataService.verifyPromotionCode(transaction.order.promotionCode).subscribe(
            () => {
              transaction.isPromoCodeValid = true;
              transaction.isPromoCodeValidating = false;
              if ((index + 1) === this.dataTable.selectedRows.length) {
                this.validateTransactionToApprove();
              }
            },
            () => {
              transaction.isPromoCodeValid = false;
              transaction.isPromoCodeValidating = false;
              if ((index + 1) === this.dataTable.selectedRows.length) {
                this.validateTransactionToApprove();
              }
            }
          );
        } else {
          transaction.isPromoCodeValid = true;
          transaction.isPromoCodeValidating = false;
          if ((index + 1) === this.dataTable.selectedRows.length) {
            this.validateTransactionToApprove();
          }
        }

        if (status) {
          if (status === TransactionStatus.Approved) {
            transaction.msslNo = null;
            transaction.meterId = null;
          }

          transaction.status = status;
          if (transaction.contractCommissionedDate.moment === null) {
            transaction.contractCommissionedDate.moment = moment();
          }
        }

        this.multipleTransactionToUpdateStatus.push(transaction);
      });
    } else {
      this.validateTransactionToApprove();
    }
  }

  openTransactionUpdateStatusModal(status: TransactionStatus) {
    this.initConfirmUpdateTransactionStatus(this.transactionToReview, status);

    if ((status === TransactionStatus.Submitted || status === TransactionStatus.Approved)
      && (this.transactionToUpdateStatus.order && this.transactionToUpdateStatus.order.promotionCode)) {
      this.dataService.verifyPromotionCode(this.transactionToUpdateStatus.order.promotionCode).subscribe(
        () => {
          this.transactionToUpdateStatus.isPromoCodeValid = true;
          this.transactionToUpdateStatus.isPromoCodeValidating = false;
          this.confirmUpdateStatusModalRef = this.modal.open(this.confirmUpdateStatusModal, 'lg', {}, { ignoreBackdropClick: true } );
        },
        () => {
          this.transactionToUpdateStatus.isPromoCodeValid = false;
          this.transactionToUpdateStatus.isPromoCodeValidating = false;
          this.modal.open(this.warningUpdatePromotionCodeModal, 'md', {}, { class: 'box-shadow margin-top-sm' });
        }
      );
    } else {
      this.confirmUpdateStatusModalRef = this.modal.open(this.confirmUpdateStatusModal, 'lg', {}, { ignoreBackdropClick: true } );
    }
  }

  openMultipleTransactionUpdateStatusModal(status: TransactionStatus) {
    this.initConfirmUpdateMultipleTransactionStatus(status);
    if (this.multipleTransactionToUpdateStatus.length > 0) {
      this.modal.open(this.confirmMultipleUpdateStatusModal, 'xl');
    }
  }

  onNewMsslNoKeyUp(transaction: Transaction, msslNo: string) {
    if (msslNo && msslNo.toString().length !== 10) {
      if (msslNo.toString().length > 10) {
        transaction.msslNo = msslNo.toString().substr(0, 10);
      }
      if (msslNo.toString().length < 10) {
        transaction.isMsslNumberValid = false;
      }
      return;
    } else if (msslNo && msslNo.toString().length === 10) {
      if (transaction.isMsslNumberValidating || transaction.isMsslNumberValid) {
        return;
      }
    }
    transaction.isMsslNumberValidating = !!msslNo;
    transaction.isMsslNumberValid = false;

    this.canUpdateStatus = false;
    this.msslNoKeyUpSubject.next({ transaction, msslNo });
  }

  validateNewMsslNo(transaction: Transaction, msslNo: string) {
    if (msslNo) {
      this.dataService
        .validate(transaction.id, { origin: transaction.orderOrigin, mssl_no: _.trim(msslNo) })
        .subscribe((res) => {
          transaction.isMsslNumberValidating = false;
          if (res.status === 200) {
            // Order ready to be approved
            transaction.isMsslNumberValid = true;
            transaction.warning = false;
            transaction.error = false;
            this.validateTransactionToApprove();
          } else if (res.status === 299) {
            transaction.warning = true;
            transaction.error = false;
            transaction.isMsslNumberValid = true;
            transaction.reasonMessage = 'Existed orders with the same SP account number. Are you sure to approve to order?';
            this.validateTransactionToApprove();
          } else {
            transaction.error = true;
            transaction.warning = false;
            transaction.isMsslNumberValid = false;
            transaction.reasonMessage = 'Invalid error.';
          }
        }, (err) => {
          transaction.isMsslNumberValidating = false;
          transaction.error = true;
          transaction.warning = false;
          transaction.isMsslNumberValid = false;
          if (err.status === 400) {
            transaction.reasonMessage = `Error! There is an order ${transaction.order.orderId} approved with the same SP Number.`;
            if (!this.isMultipleUpdateStatus) {
              this.alertModalService.error('Error', transaction.reasonMessage);
            }
          } else {
            transaction.reasonMessage = 'Invalid error.';
          }
        });
    } else {
      transaction.warning = false;
      transaction.error = false;
      transaction.isMsslNumberValid = false;
    }
  }

  onNewMeterIdKeyUp(transaction: Transaction, meterId: string) {
    transaction.isMeterIdValidating = !!meterId;
    transaction.isMeterIdValid = false;

    this.canUpdateStatus = false;
    this.meterIdKeyUpSubject.next({ transaction, meterId });
  }

  validateNewMeterId(transaction: Transaction, meterId: string) {
    if (meterId) {
      this.dataService
        .validate(transaction.id, { origin: transaction.orderOrigin, meter_id: _.trim(meterId) })
        .subscribe(() => {
          transaction.isMeterIdValid = true;
          transaction.isMeterIdValidating = false;
          this.validateTransactionToApprove();
        }, () => {
          transaction.isMeterIdValidating = false;
          transaction.isMeterIdValid = false;
        });
    } else {
      transaction.isMeterIdValid = false;
    }
  }

  validatePromotionCodeInList(transaction: Transaction, promoCode: string) {
    if (promoCode) {
      transaction.isPromoCodeValidating = true;
      this.dataService.verifyPromotionCode(promoCode).subscribe(
        () => {
          transaction.isPromoCodeValidating = false;
          transaction.isPromoCodeValid = true;

          this.validateTransactionToApprove();
        },
        () => {
          transaction.isPromoCodeValidating = false;
          transaction.isPromoCodeValid = false;

          this.validateTransactionToApprove();
        }
      );
    } else {
      transaction.isPromoCodeValidating = false;
      transaction.isPromoCodeValid = true;

      this.validateTransactionToApprove();
    }
  }

  // validatePromotionCodeToSubmitOrApprove() {
  //   if (this.isMultipleUpdateStatus) {
  //     this.isExistsPromotionCodeInvalid = _.some(this.multipleTransactionToUpdateStatus, (transaction) => !transaction.isPromoCodeValid);
  //   } else {
  //     this.isExistsPromotionCodeInvalid = !this.transactionToUpdateStatus.isPromoCodeValid;
  //   }
  // }

  onChangeAndVerifyPromotionCodeOnTable(transaction: Transaction, promoCode: string) {
    if (promoCode) {
      transaction.isPromoCodeValidating = true;
      this.promotionCodeInListKeyUpSubject.next({ transaction, promoCode });
    } else {
      transaction.isPromoCodeValid = true;
      this.validateTransactionToApprove();
    }
  }

  validateTransactionToApprove() {
    if (this.isMultipleUpdateStatus) {
      const transactions = this.multipleTransactionToUpdateStatus;
      for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].meterId) {
          const index = _.findIndex(transactions, transaction => _.trim(transaction.meterId) === _.trim(transactions[i].meterId));
          if (index === i) {
            if (transactions[i].isMeterIdDuplicated) {
              this.validateNewMeterId(transactions[i], transactions[i].meterId);
              transactions[i].isMeterIdDuplicated = false;
            }
          } else {
            transactions[i].isMeterIdDuplicated = true;
            transactions[i].isMeterIdValid = false;
          }
        }

        if (transactions[i].msslNo) {
          const index = _.findIndex(transactions, transaction => _.trim(transaction.msslNo) === _.trim(transactions[i].msslNo));
          if (index === i) {
            if (transactions[i].isMsslNumberDuplicated) {
              this.validateNewMsslNo(transactions[i], transactions[i].msslNo);
              transactions[i].isMsslNumberDuplicated = false;
            }
          } else {
            transactions[i].isMsslNumberDuplicated = true;
            transactions[i].isMsslNumberValid = false;
            transactions[i].error = false;
            transactions[i].warning = false;
          }
        }
      }

      this.canUpdateStatus = !_.some(transactions, (transaction) =>
        (transaction.error || transaction.warning
          || !transaction.isMeterIdValid || !transaction.isMsslNumberValid || !transaction.isPromoCodeValid));

      this.isExistsPromotionCodeInvalid = _.some(this.multipleTransactionToUpdateStatus, (transaction) => !transaction.isPromoCodeValid);
    } else {
      if (this.transactionToUpdateStatus.warning && !this.confirmWarningTransactionModalRef) {
        this.transactionToConfirm = this.transactionToUpdateStatus;
        const modalConfig: ModalConfig = {
          events: {
            onHidden: (reason: string) => {
              if (this.transactionToUpdateStatus.warning && this.confirmUpdateStatusModalRef) {
                this.confirmUpdateStatusModalRef.hide();
                this.confirmUpdateStatusModalRef = null;
              }
              this.confirmWarningTransactionModalRef = null;
            }
          },
        };
        this.confirmWarningTransactionModalRef = this.modal.config(modalConfig).open(this.warningTransactionConfirmModal, 'md');
      }

      this.canUpdateStatus = !this.transactionToUpdateStatus.error && !this.transactionToUpdateStatus.warning
        && this.transactionToUpdateStatus.isMeterIdValid && this.transactionToUpdateStatus.isMsslNumberValid;

      this.isExistsPromotionCodeInvalid = !this.transactionToUpdateStatus.isPromoCodeValid;

    }
  }

  confirmWarningApproval = (transaction: Transaction) => {
    if (this.isMultipleUpdateStatus) {
      const warningTransaction = _.find<Transaction>(this.multipleTransactionToUpdateStatus, transaction);
      warningTransaction.warning = false;
    } else {
      this.transactionToConfirm.warning = false;
    }
    this.validateTransactionToApprove();
    this.modal.hide();
  }

  updateStatus = (multiple: boolean = false) => {
    const updateData = (transaction: Transaction): { [name: string]: string } => {
      const data: { [name: string]: string } = {
        status: transaction.status,
        newspaccountno: _.trim(transaction.msslNo),
        meter_id: _.trim(transaction.meterId),
        origin: transaction.orderOrigin,
        billing_option: transaction.billingOption,
        promotion_code: transaction.order.promotionCode
      };

      if (!multiple) {
        delete data['promotion_code'];
      }

      if (transaction.status === TransactionStatus.Submitted) {
        data.effectivedate = transaction.contractEffectiveDate.toData();
        delete data['meter_id'];
        delete data['newspaccountno'];
        delete data['billing_option'];
      } else if (transaction.status === TransactionStatus.Approved) {
        data.effectivedate = transaction.contractCommissionedDate.toData();
      } else if (transaction.status === TransactionStatus.Rejected) {
        data.rejected_reason = transaction.rejectedReason;
      }

      return data;
    };
    const handleError = (message: string) => {
      this.modalLoading = false;
      this.modal.hide();
      this.alertService.error(message, true);
    };
    const handleSuccess = (status: string) => {
      this.removeSelectedRow();
      this.modalLoading = false;
      this.modal.hide();
      this.reloadItems(this.dataTable.getTableParameters());
      this.alertService.success('Change status ' + status + ' success.', true);
    };

    this.alertService.clear();
    this.modalLoading = true;

    if (multiple) {
      if (this.multipleTransactionToUpdateStatus.length > 0) {
        const status = this.multipleTransactionToUpdateStatus[0].status;
        const requests = _.map(this.multipleTransactionToUpdateStatus,
          transaction => this.dataService.updateFromData(transaction.id, updateData(transaction)));
        forkJoin(requests).subscribe(() => handleSuccess(status), (error: ErrorResponse) => handleError(error.message));
      }
    } else {
      this.dataService.updateFromData(this.transactionToUpdateStatus.id, updateData(this.transactionToUpdateStatus))
        .subscribe(() => handleSuccess(this.transactionToUpdateStatus.status), (error: ErrorResponse) => handleError(error.message));
    }
  }

  removeTransactionFromList(transaction: Transaction) {
    const index = this.multipleTransactionToUpdateStatus.indexOf(transaction);
    this.multipleTransactionToUpdateStatus.splice(index, 1);
    if (this.multipleTransactionToUpdateStatus.length === 0) {
      this.modal.hide();
    }
    this.validateTransactionToApprove();
  }

  checkExpectedStartDate(date: string, compareDiff: number, greater: boolean) {
    const diff = moment(date, 'DD/MM/YYYY').diff(moment(), 'days');
    return  greater ? diff > compareDiff : diff <= compareDiff;
  }

  onRowSelected(row: DataTableRowComponent) {
    if (!this.transactionToReview) {
      this.dataTable.columns.forEach((column: DataTableColumnComponent) => {
        if (this.isCustomized) {
          return;
        }
        this.isCustomized = this.defaultVisibleColumn.indexOf(column.property) >= 0 ? !column.visible : column.visible;
      });

      if (!this.isCustomized) {
        this.dataTable.columns.forEach((column: DataTableColumnComponent) => {
          if (this.columnToHideInExtendedView.indexOf(column.property) >= 0) {
            column.visible = false;
          }
        });
      }
    }

    this.transactionToReview = row.item;
  }

  removeSelectedRow() {
    if (!this.isCustomized) {
      this.dataTable.columns.forEach((column: DataTableColumnComponent) => {
        if (this.columnToHideInExtendedView.indexOf(column.property) >= 0) {
          column.visible = true;
        }
      });
    } else {
      this.isCustomized = false;
    }

    this.transactionToReview = null;
  }

  openUpdatePricingPlanModal(ref: TemplateRef<any>, multiple = true) {
    this.isMultipleUpdatePricePlan = multiple;
    if (multiple) {
      this.initConfirmUpdateMultipleTransactionStatus();
      if (this.multipleTransactionToUpdateStatus.length > 0) {
        this.modal.open(ref, 'lg');
      }
    } else {
      if (this.transactionToReview) {
        this.multipleTransactionToUpdateStatus = [this.transactionToReview];
        this.pricePlanToUpdate = this.transactionToReview.order.items[0].productName;
        this.modal.open(ref, 'md');
      }
    }
  }

  updateTransactionPricingPlan(planName: string, transactionList: Transaction[]) {
    if (transactionList.length > 0) {
      const hideModal = () => {
        this.modalLoading = false;
        this.pricePlanToUpdate = null;
        this.modal.hide();
      };
      const orderIdList = transactionList.map(transaction => transaction.order.id);

      this.modalLoading = true;
      this.dataService.updatePricingPlan(planName, orderIdList).subscribe(() => {
        _.each(orderIdList, (id: number) => {
          // Update data for reviewing transaction
          if (this.transactionToReview && this.transactionToReview.order.id === id) {
            this.transactionToReview.order.items[0].productName = planName;
          }
          // Update data for data table
          const index = _.findIndex(this.dataTable.items, (item: Transaction) => item.order.id === id);
          if (index >= 0) {
            this.dataTable.items[index].order.items[0].productName = planName;
          }
        });

        hideModal();
        this.alertService.success('Pricing plan changed to ' + planName + ' successfully.', true);
      }, (error: ErrorResponse) => {
        hideModal();
        this.alertService.error(error.message, true);
      });
    }
  }

  openUpdatePromotionCodeModal() {
    const modalConfig: ModalConfig = {
      events: {
        onHidden: (reason: string) => {
          setTimeout(() => {
            this.promotionCodeToUpdate = '';
            this.verifyingPromotionCode = false;
            this.isPromotionCodeValid = false;
          }, 300);
        }
      },
    };
    this.modal.config(modalConfig).open(this.updatePromotionCodeModal, 'md');
  }

  onPromotionCodeInputKeyUp(searchValue: string) {
    this.verifyingPromotionCode = !!searchValue;
    this.isPromotionCodeValid = false;
    this.promotionCodeKeyUpSubject.next(searchValue);
  }

  verifyPromotionCode(code: string) {
    if (code) {
      this.dataService.verifyPromotionCode(code).subscribe(() => {
        this.verifyingPromotionCode = false;
        this.isPromotionCodeValid = true;
      }, () => {
        this.verifyingPromotionCode = false;
        this.isPromotionCodeValid = false;
      });
    } else {
      this.verifyingPromotionCode = false;
      this.isPromotionCodeValid = true;
    }
  }

  updateTransactionPromotionCode(code: string, transaction: Transaction) {
    this.modalLoading = true;

    this.dataService.updatePartialFromData(transaction.id, { origin: 'b2c', referral_code: code }).subscribe((updatedTransaction) => {
      this.modalLoading = false;
      this.promotionCodeToUpdate = '';
      this.alertService.success(`Order ${transaction.order.orderId} has updated promotion code successfully`);

      const index = _.findIndex(this.dataTable.items, item => item.id === updatedTransaction.id);
      // Update data for data table
      if (index >= 0) {
        this.dataTable.items[index] = updatedTransaction;
      }
      // Update data for reviewing transaction
      if (this.transactionToReview) {
        this.transactionToReview = updatedTransaction;
      }

      this.modal.hide();
      this.isPromotionCodeValid = false;
    }, (error) => {
      this.modalLoading = false;
      this.promotionCodeToUpdate = '';
      this.alertService.error(error.message);
      this.modal.hide();
      this.isPromotionCodeValid = false;
    });
  }

  openDeleteConfirmModal(ref: TemplateRef<any>, multiple = true) {
    this.isMultipleUpdatePricePlan = multiple;
    if (multiple) {
      this.initConfirmUpdateMultipleTransactionStatus();
      if (this.multipleTransactionToUpdateStatus.length > 0) {
        this.modal.open(ref, 'md');
      }
    } else {
      if (this.transactionToReview) {
        this.multipleTransactionToUpdateStatus = [this.transactionToReview];
        this.pricePlanToUpdate = this.transactionToReview.order.items[0].productName;
        this.modal.open(ref, 'md');
      }
    }
  }

  deleteTransaction(transactionList: Transaction[]) {
    if (transactionList.length > 0) {
      const orderIdList = transactionList.map(transaction => transaction.order.id);
      const requests = _.map(orderIdList, (id: number) => this.dataService.delete(id));

      this.modalLoading = true;
      forkJoin(requests).subscribe(() => {
        this.removeSelectedRow();
        this.reloadItems(this.dataTable.getTableParameters());
        this.modalLoading = false;
        this.alertService.success(`Orders deleted successfully.`);
        this.modal.hide();
      }, () => {
        this.modalLoading = false;
        this.alertService.error('Failed to delete orders.');
        this.modal.hide();
      });
    }
  }
}
