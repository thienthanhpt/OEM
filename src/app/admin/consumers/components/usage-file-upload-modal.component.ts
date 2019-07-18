import { Component, ViewChild } from '@angular/core';
import { HttpEvent } from '@angular/common/http';
import * as moment from 'moment';

import { BsModalRef } from 'ngx-bootstrap';

import { ErrorResponse, SuccessResponse, UsageData, UsageDataService } from '@app/core/index';
import { FileUploadContent, FileUploadComponent } from '../../shared/components/form/file-upload.component';

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
                       (uploadSuccess)="uploadSuccess($event)"
                       (uploadComplete)="uploadComplete()"
                       [isMultipleUpload]="true"
                       #fileUpload></file-upload>
        </div>
      </div>
    </div>
  `
})
export class UsageFileUploadModalComponent {

  @ViewChild(FileUploadComponent) fileUploadComponent: FileUploadComponent;

  usageDataToUpload: UsageData = new UsageData();

  uploadComplete: () => { };

  constructor(
    protected dataService: UsageDataService,
    public modal: BsModalRef
  ) { }

  upload(data: FileUploadContent) {
    this.usageDataToUpload = new UsageData();
    this.usageDataToUpload.billingDate.moment = moment();

    if (this.usageDataToUpload.id) {
      this.dataService
        .uploadAndUpdate(data.content, this.fileUploadComponent.listFileToUpload[data.index].file.name, this.usageDataToUpload)
        .subscribe(
          (event: HttpEvent<any>) => this.fileUploadComponent.onUpload(event, data.index),
          (error: ErrorResponse) => this.fileUploadComponent.onError(error, data.index)
        );
    } else {
      this.dataService
        .uploadAndCreate(data.content, this.fileUploadComponent.listFileToUpload[data.index].file.name, this.usageDataToUpload)
        .subscribe(
          (event: HttpEvent<any>) => this.fileUploadComponent.onUpload(event, data.index),
          (error: ErrorResponse) => this.fileUploadComponent.onError(error, data.index)
        );
    }
  }

  uploadSuccess(rs: SuccessResponse) {
    this.dataService.uploadSuccess(rs);
  }
}
