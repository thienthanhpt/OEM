import { Component, TemplateRef, ViewChild } from '@angular/core';
import { HttpEvent } from '@angular/common/http';

import { BsModalRef } from 'ngx-bootstrap';

import { FileUploadComponent, FileUploadContent, ModalService } from '../../shared';
import { Payment, PaymentService, ErrorResponse, PaymentDataRequest } from '@app/core';
import * as _ from 'lodash';

enum FileFormat {
  RCCD = 'RCCD',
  ORIGINAL = 'ORIGINAL'
}

enum HeadersOfRCCD {
  MSSL_NO = 'mssl no',
  AMOUNT = 'amount',
  INVOICE_NO = 'invoice no',
  DUE_DATE = 'due date'
}

enum HeaderOfManual {
  INVOICE_NO = 'invoice no',
  MSSL_NO = 'mss no',
  PAYMENT_RECEIVED = 'payment received',
  DATE_RECEIVED = 'date received',
  PAYMENT_MODE = 'payment mode'
}

@Component({
  selector: 'modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Upload form</h4>
      <button type="button" class="close pull-right" aria-label="Close" (click)="modal.hide()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-12">
          <file-upload (upload)="upload($event)"
                       (reader)="readContent($event)"
                       [isCheckContentAndUpload]="true"
                       (uploadComplete)="uploadComplete()"
                       (uploadSuccess)="paymentService.uploadSuccess($event)"
                       (uploadFail)="uploadFail()"
                       #fileUpload1></file-upload>
        </div>
      </div>
    </div>
    <ng-template #errorFormatFileModal>
      <div class="modal-body">
        <div class="form-group row">
          <div class="col-md-12">
            Please to choose file is CSV format which must have header template adapt with valid header template.
          </div>
        </div>
        <div class="text-center">
          <button type="button" class="text-center btn btn-default"
                  (click)="errorModal.hide(); fileUploadComponent.removeFile(indexFileCurrent)">Ok</button>
        </div>
      </div>
    </ng-template>
  `
})
export class PaymentFileUploadModalComponent {
  @ViewChild(FileUploadComponent) fileUploadComponent: FileUploadComponent;
  @ViewChild('errorFormatFileModal') errorFormatFileModal: TemplateRef<any>;

  paymentUpload: Payment = new Payment();

  uploadComplete: () => { };
  uploadFail: () => { };
  fileFormat = FileFormat.RCCD;

  headersOfRCCD = HeadersOfRCCD;

  headersOfManual = HeaderOfManual;
  paymentDataRequest = new PaymentDataRequest();
  indexFileCurrent = 0;

  constructor(
    public paymentService: PaymentService,
    public modal: BsModalRef,
    private errorModal: ModalService
  ) { }

  upload(data: FileUploadContent) {
    if (this.fileFormat) {
      this.paymentDataRequest.fileContent = data.content;
      this.paymentDataRequest.fileName = this.fileUploadComponent.listFileToUpload[data.index].file.name;
      this.paymentDataRequest.isStored = true;
      this.paymentDataRequest.receivedDate = this.paymentUpload.receivedDate;
      this.paymentDataRequest.fileFormat = this.fileFormat;

      if (this.paymentUpload.invoiceNo) {
        this.paymentService.uploadAndUpdate(this.paymentUpload.id, this.paymentDataRequest).subscribe(
            (event: HttpEvent<any>) => this.fileUploadComponent.onUpload(event, data.index),
            (error: ErrorResponse) => this.fileUploadComponent.onError(error, data.index)
          );
      } else {
        this.paymentService.uploadAndCreate(this.paymentDataRequest).subscribe(
            (event: HttpEvent<any>) => this.fileUploadComponent.onUpload(event, data.index),
            (error: ErrorResponse) => this.fileUploadComponent.onError(error, data.index)
          );
      }
    } else {
      this.indexFileCurrent = data.index;
      this.errorModal.open(this.errorFormatFileModal, 'sm', {}, { class: 'box-shadow', ignoreBackdropClick: true });
    }
  }

  readContent(content: string) {
    if (content) {
      const headers = _.map(_.split(content, '\n')[0].toLowerCase().split(','), _.trim);

      if (headers.length >= 5) {
        if (this.isFormatManual(headers)) {
          this.fileFormat = FileFormat.ORIGINAL;
        } else {
          this.fileFormat = null;
        }
      } else if (headers.length >= 4) {
        if (this.isFormatRCCD(headers)) {
          this.fileFormat = FileFormat.RCCD;
        } else {
          this.fileFormat = null;
        }
      } else {
        this.fileFormat = null;
      }
    }
  }

  isFormatRCCD(headers: string[]): boolean {
    if (headers[0] === this.headersOfRCCD.MSSL_NO
      && headers[1] === this.headersOfRCCD.AMOUNT
      && headers[2] === this.headersOfRCCD.INVOICE_NO
      && headers[3] === this.headersOfRCCD.DUE_DATE) {
      return true;
    } else {
      return false;
    }
  }

  isFormatManual(headers: string[]): boolean {
    if (headers[0] === this.headersOfManual.INVOICE_NO
      && headers[1] === this.headersOfManual.MSSL_NO
      && headers[2] === this.headersOfManual.PAYMENT_RECEIVED
      && headers[3] === this.headersOfManual.DATE_RECEIVED
      && headers[4] === this.headersOfManual.PAYMENT_MODE) {
      return true;
    } else {
      return false;
    }
  }

}
