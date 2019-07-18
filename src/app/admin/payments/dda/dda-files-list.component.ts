import { Component, Injector, Input } from '@angular/core';

import * as _ from 'lodash';

import { DdaFile, DdaFileService, UsageData, UsageDataService, DdaFileStatus, DdaFileType } from '@app/core';
import { ListComponent, AlertModalService } from '../../shared';
import { DdaFileUploadModalComponent } from './dda-file-upload-modal.component';
import { DdaFileGenerateModalComponent } from './dda-file-generate-modal.component';

@Component({
  selector: 'admin-dda-files-list',
  templateUrl: './dda-files-list.component.html',
})
export class DdaFilesListComponent extends ListComponent<DdaFile, DdaFileService> {

  @Input() type: DdaFileType;
  ddaType = DdaFileType;
  fileToDelete: DdaFile = null;
  ddaFileStatus = DdaFileStatus;
  selectedDdaFile: DdaFile;
  isLoading = false;

  constructor(
    injector: Injector,
    protected dataService: DdaFileService,
    protected usageDataService: UsageDataService,
    protected alertModalService: AlertModalService,
  ) {
    super(injector);
  }

  reloadItems(meta?: { [name: string]: any }) {
    this.criteria = { type: this.type.toString() };
    if (!meta.sortBy) {
      meta.sortBy = 'createdTime';
      meta.sortAsc = false;
    }
    return super.reloadItems(meta);
  }

  openGenerateFilesModal = () => {
    const ref = this.modal.open(DdaFileGenerateModalComponent, 'lg', {
      onComplete: (success: boolean) => {
        if (success) {
          this.alertService.success('DDA files generated successfully.');
          this.reloadItems(_.assign(this.getResetTableParameters()));
          ref.hide();
        } else {
          this.alertService.error('An error occurred while generating files. Please try again.');
          ref.hide();
        }
      }
    });
  }

  deleteGeneratedFile = () => {
    if (this.fileToDelete) {
      this.isLoading = true;
      this.dataService.delete(this.fileToDelete.id).subscribe(() => {
        this.alertService.success('File deleted successfully.');
        this.reloadItems(_.assign(this.getResetTableParameters()));
        this.isLoading = false;
        this.modal.hide();
      }, () => {
        this.alertService.error('An error occurred while deleting file. Please try again.');
        this.isLoading = false;
        this.modal.hide();
      });
    }
  }

  openUploadFilesModal = (usageData?: UsageData) => {
    const uploadSuccess = () => {
      this.reloadItems(_.assign(this.getResetTableParameters()));
      ref.hide();
      this.alertService.success('Upload file successfully.');
    };
    const uploadFail = () => {
      ref.hide();
    };
    const ref = this.modal.open(DdaFileUploadModalComponent, 'lg', {
      uploadSuccess,
      uploadFail,
      datePickerConfig: this.adminConfig.bootstrap.datePicker,
      usageDataToUpload: (usageData) ? this.usageDataService.clone(usageData) : new UsageData()
    });
  }
}
