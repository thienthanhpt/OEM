import { Component, ViewChild } from '@angular/core';
import { HttpEvent } from '@angular/common/http';

import { BsModalRef } from 'ngx-bootstrap';

import { DdaFileService, ErrorResponse } from '@app/core';
import { FileUploadComponent, FileUploadContent } from '../../shared';

@Component({
  selector: 'dda-upload',
  templateUrl: './dda-file-upload-modal.component.html',
})
export class DdaFileUploadModalComponent {

  @ViewChild(FileUploadComponent) fileUploadComponent: FileUploadComponent;

  uploadSuccess: () => { };
  uploadFail: () => { };

  constructor(
    public dataService: DdaFileService,
    public modal: BsModalRef,
  ) { }

  upload = (data: FileUploadContent) => {
    this.dataService
      .upload(data.content, this.fileUploadComponent.listFileToUpload[data.index].file.name)
      .subscribe(
        (event: HttpEvent<any>) => this.fileUploadComponent.onUpload(event, data.index),
        (error: ErrorResponse) => this.fileUploadComponent.onError(error, data.index)
      );
  }
}
