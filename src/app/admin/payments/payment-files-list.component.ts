import { Component, Injector } from '@angular/core';

import { ListComponent } from '../shared';
import { PaymentFileUploadModalComponent } from './components/payment-file-upload-modal.component';
import { Payment, PaymentFile, PaymentFileService, PaymentService, SuccessResponse, UsageDataStatus, PaymentStatus } from '@app/core';

@Component({
  selector: 'admin-payment-files-list',
  templateUrl: 'payment-files-list.component.html',
})
export class PaymentFilesListComponent extends ListComponent<PaymentFile, PaymentFileService> {

  paymentToApprove: PaymentFile;
  PaymentStatus = PaymentStatus;
  isDocumentsLoading = false;

  constructor(
    injector: Injector,
    protected dataService: PaymentFileService,
    protected paymentUploadService: PaymentService,
  ) {
    super(injector);
  }

  openUploadFilesModal = (payData?: Payment) => {
    this.isDocumentsLoading = true;
    this.modal.open(PaymentFileUploadModalComponent, 'lg', {
      uploadComplete: this.uploadComplete,
      uploadFail: this.uploadFail,
      datePickerConfig: this.adminConfig.bootstrap.datePicker,
      paymentUpload: (payData) ? this.paymentUploadService.clone(payData) : new Payment()
    });
  }

  uploadComplete = () => {
    this.reloadItems(this.dataTable.getTableParameters());
    this.isDocumentsLoading = false;
    this.modal.hide();
  }

  uploadFail = () => {
    this.isDocumentsLoading = false;
    this.modal.hide();
  }

  approvePaymentFile = () => {
    this.isLoading = true;
    this.modal.hide();
    this.paymentUploadService.approvePaymentStatus(this.paymentToApprove.id)
      .subscribe(
        (rs: SuccessResponse) => {
          this.alertService.clear();
          if (rs.data) {
            if (rs.data.status === UsageDataStatus.Success) {
              this.alertService.success(`File ${this.paymentToApprove.document.displayName} approved successfully`);
            }
            if (rs.data.status === UsageDataStatus.Invalid) {
              this.alertService.warn(`File ${this.paymentToApprove.document.displayName} is invalid`);
            }
          }
          this.isLoading = false;
          this.reloadItems(this.dataTable.getTableParameters());
        }, this.onError
      );
  }
}
