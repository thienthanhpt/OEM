import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';

import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Ng2FileDropAcceptedFile, Ng2FileDropRejectedFile, Ng2FileDropFiles } from '@app/libs/ng2-file-drop';
import * as _ from 'lodash';

import { Attachment, AttachmentService, ErrorResponse, SuccessResponse } from '@app/core';
import { AlertService } from '../../services/alert.service';
import { readFile } from '@shared/utils/read-file.util';

export class FileUploadContent {
  content: string;
  index: number;
}

export enum UploadState {
  Pending = 0,
  Selected = 1,
  Uploading = 2,
  ServerProcessing = 3,
}

export enum FileUploadState {
  Ready = 0,
  Reading = 1,
  Processing = 2,
  Fail = 3,
  Success = 4,
}

const MB = 1000000;
const FILE_SIZE_TO_WARN = 10 * MB;

export interface FileUploadObject {
  file: File;
  progress: number;
  status: number;
}

@Component({
  selector: 'file-upload',
  template: `
    <div ng2FileDrop class="custom-component-drop-zone has-advanced-upload"
         [ng2FileDropAcceptMultiple]="isMultipleUpload"
         (ng2FileDropFilesDropped)="dragFilesDropped($event)"
         (ng2FileDropFileAccepted)="dragFileAccepted($event)"
         (ng2FileDropFileRejected)="dragFileRejected($event)">
      <div class="box__input p-4 row justify-content-center">
        <div class="col-12">
          <div *ngIf="state >= uploadStates.Selected">
            <div class="row" *ngFor="let item of listFileToUpload; let i = index">
              <div class="col-12">
                <button type="button" class="btn btn-link text-danger d-inline-block"
                        *ngIf="state === uploadStates.Selected"
                        (click)="removeFile(i)">
                  <i class="far fa-times-circle"></i>
                </button>
                <span [class.text-danger]="item.status === fileUploadStates.Fail">{{ item.file.name }}</span>
              </div>
              <div class="col-12" *ngIf="state === uploadStates.Uploading">
                <div class="progress file-upload">
                  <div class="progress-bar progress-bar-striped"
                       role="progressbar" [attr.aria-valuenow]="item.progress"
                       aria-valuemin="0" aria-valuemax="100"
                       [ngClass]="{ 'progress-bar-success': item.status !== fileUploadStates.Fail,
                          'progress-bar-danger': item.status === fileUploadStates.Fail }"
                       [style.width]="item.progress + '%'">
                    <span *ngIf="state !== uploadStates.ServerProcessing">{{ item.progress }}%</span>
                    <span *ngIf="state === uploadStates.ServerProcessing">Processing...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="text-center my-2" *ngIf="listFileToUpload.length > 0 && state === uploadStates.Selected">
            <button class="btn btn-info" (click)="onSubmit()">Upload</button>
          </div>
        </div>

        <div class="col-12 align-items-center text-center" *ngIf="state < uploadStates.Uploading">
          <input class="box__file" type="file" name="file" id="file" [attr.multiple]="isMultipleUpload ? '' : null"
                 (change)="onFileChange($event)"/>
          <label for="file" class="font-weight-bold block-choose-file label-upload">
            <span *ngIf="isMultipleUpload">
              {{ state === uploadStates.Pending ? 'Choose files' : 'Choose other files' }}
            </span>
            <span *ngIf="!isMultipleUpload">
              {{ state === uploadStates.Pending ? 'Choose a file' : 'Choose another file' }}
            </span>
            <span class="box__dragndrop"> {{ isMultipleUpload ? 'or drag them here' : 'or drag it here' }}</span>.
          </label>
        </div>
      </div>
    </div>

    <ng-template #confirmToUploadModal>
      <div class="modal-body">
        <div class="form-group row">
          <div class="col-md-12" *ngIf="!isShowAlertMaximumFile">
            Your chosen file is
            <span *ngFor="let size of fileSizeOverWarning"> {{ toMb(size) | number: '1.2-2' }}MB,</span>
            bigger than expected size 10MB.
            Do you want to upload this file anyway?
          </div>
          <div class="col-md-12 text-center" *ngIf="isShowAlertMaximumFile">
            The number of files exceeds the maximum: {{ maxUploadFile }}.
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-md mr-auto"
                (click)="modal.hide()">{{ isShowAlertMaximumFile ? 'Cancel' : 'Ok' }}</button>
        <button type="button" class="btn btn-md btn-primary" (click)="uploadFile()" *ngIf="!isShowAlertMaximumFile">
          <span class="font-weigh-bold">Confirm</span>
        </button>
      </div>
    </ng-template>

    <ng-template #errorMessageWrongFileStyleModal>
      <div class="modal-body">
        <div class="form-group row">
          <div class="col-md-12">
            Please to choose file is CSV format.
          </div>
        </div>

        <button type="button" class="float-right btn btn-default"
                (click)="modal.hide()">Ok</button>
      </div>
    </ng-template>

  `,
  styles: [`
    .box__input {
      min-height: 200px;
    }

    .box__file,
    .box__dragndrop,
    .box__uploading,
    .box__success,
    .box__error {
      display: none;
    }

    .has-advanced-upload {
      background-color: white;
      outline: 2px dashed #ccc;
      outline-offset: -10px;
    }
    .has-advanced-upload .box__dragndrop {
      display: inline;
    }
    .is-dragover {
      background-color: grey;
    }
    .file-upload {
      min-width: 40px;
      max-width: 400px;
    }
    .button-upload {
      width: 70px;
      height: 40px;
    }
    .label-upload {
      cursor: pointer;
      width: 100%;
      padding: 20px 0;
    }
  `]
})
export class FileUploadComponent {

  // Function when each file upload is success or fail
  @Output() uploadSuccess: EventEmitter<Attachment | any> = new EventEmitter<Attachment>();
  @Output() uploadFail: EventEmitter<ErrorResponse> = new EventEmitter<ErrorResponse>();
  // Function upload file
  @Output() upload: EventEmitter<FileUploadContent> = new EventEmitter<FileUploadContent>();

  // Function upload file with content is string
  @Output() reader: EventEmitter<string> = new EventEmitter<string>();

  // Function when all file upload done
  @Output() uploadComplete: EventEmitter<any> = new EventEmitter<any>();

  @Input() resourceModel: string;
  @Input() resourceId: number;
  @Input() originAssetId: number;
  @Input() isMultipleUpload = false;
  @Input() maxUploadFile = 5;
  @Input() isUploadFile = true;
  @Input() isCheckContentAndUpload = false;

  @ViewChild('confirmToUploadModal') confirmToUploadModal: TemplateRef<any>;
  @ViewChild('errorMessageWrongFileStyleModal') errorMessageWrongFileStyleModal: TemplateRef<any>;

  modal: BsModalRef;

  state: UploadState = UploadState.Pending;

  fileSizeOverWarning: number[] = [];
  listFileToUpload: FileUploadObject[] = [];

  uploadStates = UploadState;
  fileUploadStates = FileUploadState;
  isShowAlertMaximumFile = false;

  constructor(
    protected attachmentService: AttachmentService,
    protected modalService: BsModalService,
    protected alertService: AlertService,
  ) { }

  onSubmit() {
    let checkFileSize = false;
    _.forEach(this.listFileToUpload, (item) => {
      if (item.file.size > FILE_SIZE_TO_WARN) {
        checkFileSize = true;
        this.fileSizeOverWarning.push(item.file.size);
      }
    });

    if (checkFileSize) {
      this.modal = this.modalService.show(this.confirmToUploadModal);
    } else {
      this.uploadFile();
    }
  }

  // Files are chosen
  onFileChange(event: any) {
    if (this.isMultipleUpload) {
      const files = new Ng2FileDropFiles(_.map(event.target.files, (file: File) => new Ng2FileDropAcceptedFile(file)));
      this.dragFilesDropped(files);
    } else {
      this.dragFileAccepted(new Ng2FileDropAcceptedFile(event.target.files[0]));
    }
    event.target.files = null;
  }

  // Files being dragged have been dropped. Only emit when multiple file upload.
  dragFilesDropped(droppedFiles: Ng2FileDropFiles) {
    // check limit file
    if (this.modal) {
      this.modal.hide();
      this.modal = null;
    }

    this.isShowAlertMaximumFile = false;

    if (droppedFiles.accepted.length > 0) {
      if (droppedFiles.accepted.length + this.listFileToUpload.length > this.maxUploadFile) {
        this.isShowAlertMaximumFile = true;
        this.modal = this.modalService.show(this.confirmToUploadModal);
        return;
      }

      _.forEach(droppedFiles.accepted, file => this.dragFileAccepted(file));
    }

    if (droppedFiles.rejected.length > 0) {
      _.forEach(droppedFiles.rejected, file => this.dragFileRejected(file));
    }
  }

  // File being dragged has been dropped and is valid
  dragFileAccepted(acceptedFile: Ng2FileDropAcceptedFile) {
    if (acceptedFile.file !== undefined) {
      if (!this.isUploadFile && !_.isEqual(acceptedFile.file.type, 'text/csv')
        && !_.isEqual(acceptedFile.file.type, 'application/vnd.ms-excel')) {
        this.modal = this.modalService.show(this.errorMessageWrongFileStyleModal);
        return;
      }

      if (!this.isMultipleUpload) {
        this.listFileToUpload = [];
      }

      this.listFileToUpload.push({
        file: acceptedFile.file,
        progress: 0,
        status: FileUploadState.Ready,
      });

      this.state = UploadState.Selected;
    }
  }

  // File being dragged has been dropped and has been rejected
  dragFileRejected(rejectedFile: Ng2FileDropRejectedFile) {
    console.log('dragFileRejected', rejectedFile);
  }

  uploadFile() {
    // Hide modal warning file size
    if (this.modal) {
      this.modal.hide();
      this.modal = null;
    }

    this.state = UploadState.Uploading;

    if (!this.isMultipleUpload) {
      this.progressUpload(0);
    } else {
      this.listFileToUpload.map((item, index) => {
        this.progressUpload(index);
      });
    }
  }

  progressUpload(index: number = 0) {
    this.listFileToUpload[index].status = FileUploadState.Reading;
    if (this.isCheckContentAndUpload) {
      readFile(this.listFileToUpload[index].file, false).subscribe(
        (content: string) => {
          this.listFileToUpload[index].status = FileUploadState.Processing;

          if (this.reader.observers.length > 0) {
            this.reader.emit(content);
            readFile(this.listFileToUpload[index].file, true).subscribe(
              (file: string) => {
                this.upload.emit({ content: file, index });
                this.listFileToUpload[index].status = FileUploadState.Success;
                this.listFileToUpload[index].progress = 100;
              }
            );
          }
        }
      );
    } else {

      readFile(this.listFileToUpload[index].file, this.isUploadFile).subscribe(
        (content: string) => {
          this.listFileToUpload[index].status = FileUploadState.Processing;

          if (!this.isUploadFile && this.reader.observers.length > 0) {
            this.reader.emit(content);
            this.listFileToUpload[index].status = FileUploadState.Success;
            this.listFileToUpload[index].progress = 100;
          } else if (this.upload.observers.length > 0) {
            this.upload.emit({ content, index });
          } else if (this.uploadSuccess.observers.length > 0) {
            if (this.originAssetId) {
              this.attachmentService
                .uploadToReplace(content, this.listFileToUpload[index].file.name, this.resourceModel, this.resourceId, this.originAssetId)
                .subscribe(
                  (event: HttpEvent<SuccessResponse>) => this.onUpload(event, index),
                  (error: ErrorResponse) => this.onError(error, index)
                );
            } else {
              this.attachmentService
                .upload(content, this.listFileToUpload[index].file.name, this.resourceModel, this.resourceId)
                .subscribe(
                  (event: HttpEvent<SuccessResponse>) => this.onUpload(event, index),
                  (error: ErrorResponse) => this.onError(error, index)
                );
            }
          }
        }
      );

    }
  }

  // todo: consider following solution https://gist.github.com/stuartaccent/51afc6b17d89d4dc6f3968ede5d789b6
  onUpload(event: HttpEvent<SuccessResponse>, index: number = 0) {
    if (event.type === HttpEventType.UploadProgress) {
      // calculate Upload Progress
      const item = this.listFileToUpload[index];
      item.progress = Math.round(100 * event.loaded / event.total);
    } else if (event.type === HttpEventType.Response) {
      this.successUpload(event.body, index);
    }
  }

  onError(error: ErrorResponse, index: number = 0) {
    this.listFileToUpload[index].status = FileUploadState.Fail;
    this.alertService.error(`Fail to upload file ${this.listFileToUpload[index].file.name}: ${error.message}`);
    this.uploadFail.emit(error);

    this.completeUpload();
  }

  toMb = (kb: number) => (kb / MB);

  removeFile = (index: number) => {
    this.listFileToUpload.splice(index, 1);
    if (this.listFileToUpload.length === 0) {
      this.state = UploadState.Pending;
    }
  }

  private successUpload = (rs: SuccessResponse, index: number) => {
    this.listFileToUpload[index].status = FileUploadState.Success;
    this.uploadSuccess.emit(this.attachmentService.uploadComplete(rs));

    this.completeUpload();
  }

  private completeUpload = () => {
    if (this.listFileToUpload.filter(x => x.status === FileUploadState.Processing).length > 0) {
      return;
    }

    this.state = UploadState.Pending;
    this.uploadComplete.emit(true);
  }
}
