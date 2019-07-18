import { Component, ViewChild } from '@angular/core';
import { HttpEvent } from '@angular/common/http';

import { BsModalRef } from 'ngx-bootstrap';

import { FileUploadComponent, FileUploadContent } from '../../shared/components/form/file-upload.component';
import { ErrorResponse, SuccessResponse } from '../../../core/data-services/base.service';
import { DbsOrderService } from '../../../core/data-services/dbs-order.service';

@Component({
  selector: 'dbs-order-upload-modal',
  template: `
    <div class="modal-body">
      <file-upload (upload)="upload($event)"
                   (uploadSuccess)="uploadSuccess($event)"
                   (uploadComplete)="uploadComplete()"
                   #fileUpload></file-upload>
    </div>
  `
})
export class DbsOrderUploadModalComponent {

  @ViewChild(FileUploadComponent) fileUploadComponent: FileUploadComponent;
  uploadComplete: () => { };

  constructor(
    protected dataService: DbsOrderService,
    public modal: BsModalRef
  ) { }

  upload = (data: FileUploadContent) => {
    this.dataService.upload(data.content, this.fileUploadComponent.listFileToUpload[data.index].file.name)
      .subscribe(
        (event: HttpEvent<any>) => this.fileUploadComponent.onUpload(event, data.index),
        (error: ErrorResponse) => this.fileUploadComponent.onError(error, data.index)
      );
  }

  uploadSuccess(rs: SuccessResponse) {
    this.dataService.uploadSuccess(rs);
  }
}
