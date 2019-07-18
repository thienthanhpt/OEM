import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import * as _ from 'lodash';
import { BsModalRef } from 'ngx-bootstrap';

import { environment } from '@env/environment';
import { Attachment, AttachmentService } from '@app/core';
import { AlertModalService } from '../../services/alert-modal.service';
import { ModalService } from '../../services/modal.service';

export enum NavigatorAction {
  Back = 'back', Next = 'next'
}

@Component({
  selector: 'file-preview',
  template: `
    <div class="modal-body position-relative">
      <div style="margin: -14px">
        <button type="button" class="close pull-right mr-1" aria-label="Close" (click)="finishPreview();">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="document-preview-layout block-loading"
           [class.is-loading]="isResourceLoading"
           [ngClass]="{ 'd-flex justify-content-center align-items-center': !isFilePDF }">
        <div class="ml-4"><img *ngIf="currentImageUrl" [src]="currentImageUrl" style="width: 100%" (error)="onError();"></div>
      </div>
      <div class="slider-button-left" *ngIf="hasPreviousImage" (click)="onImageUrlChange(NavigatorAction.Back)">
        <button type="button" class="btn mb-1" (click)="onImageUrlChange(NavigatorAction.Back)">
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>
      <div class="slider-button-right" *ngIf="hasNextImage" (click)="onImageUrlChange(NavigatorAction.Next)">
        <button type="button" class="btn" (click)="onImageUrlChange(NavigatorAction.Next)">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-md mr-auto" (click)="finishPreview();">Close</button>
      <a [href]="attachmentPath" class="btn btn-primary float-right" download><i class="fas fa-download"></i></a>
    </div>
  `,
})
export class FilePreviewComponent implements OnInit {

  @Input() attachmentId: number;
  @Input() attachmentPath: string;
  @Input() hasParentModal: boolean;
  @Output() changeImage: EventEmitter<any> = new EventEmitter<any>();
  @Output() closePreview: EventEmitter<any> = new EventEmitter<any>();

  modal: BsModalRef;

  currentImageUrl = '';
  imageUrlList: string[] = [];
  hasPreviousImage = false;
  hasNextImage = false;
  isFilePDF = false;

  NavigatorAction = NavigatorAction;

  isResourceLoading = false;

  constructor(
    protected attachmentService: AttachmentService,
    private alertModalService: AlertModalService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.isResourceLoading = true;
    if (!_.isEmpty(this.attachmentPath)) {
      if (_.endsWith(this.attachmentPath, 'pdf')) {
        this.isFilePDF = true;
        this.attachmentService.fetchImages(this.attachmentId)
          .subscribe((attachment: Attachment) => {
            if (!_.isEmpty(attachment.previewImages)) {
              _.forEach(attachment.previewImages, imageUrl => {
                const fullImageUrl = `${environment.apiUrl}/${imageUrl}`;
                this.imageUrlList.push(fullImageUrl);
              });
              this.currentImageUrl = this.imageUrlList[0];
              this.isResourceLoading = false;
              if (_.size(this.imageUrlList) > 1) {
                this.hasNextImage = true;
              }
            }
          });
      } else {
        this.imageUrlList.push(this.attachmentPath);
        this.currentImageUrl = this.attachmentPath;
        this.isResourceLoading = false;
      }
    }
  }

  onImageUrlChange = (navigation: NavigatorAction) => {
    if (navigation === NavigatorAction.Back) {
      this.currentImageUrl = this.imageUrlList[this.imageUrlList.indexOf(this.currentImageUrl) - 1];
      this.hasNextImage = true;
    } else {
      this.currentImageUrl = this.imageUrlList[this.imageUrlList.indexOf(this.currentImageUrl) + 1];
      this.hasPreviousImage = true;
    }

    if (this.imageUrlList.indexOf(this.currentImageUrl) === 0) {
      this.hasPreviousImage = false;
    }
    if (this.imageUrlList.indexOf(this.currentImageUrl) === (_.size(this.imageUrlList) - 1)) {
      this.hasNextImage = false;
    }
    this.changeImage.emit();
  }

  finishPreview = () => {
    this.closePreview.emit();
  }

  onError = () => {
    if (this.isFilePDF) {
      this.modalService.hide();
      setTimeout(() => {
        this.alertModalService.error('Something went wrong', 'Invalid File URL Specified. Please try another one!');
      }, 500);
    }
  }
}


