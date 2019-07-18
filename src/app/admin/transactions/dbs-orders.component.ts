import { Component, Injector } from '@angular/core';

import { DbsOrder, DbsOrderService, UsageDataStatus } from '@app/core';
import { AlertService, ListComponent } from '../shared';
import { DbsOrderUploadModalComponent } from './components/dbs-order-upload-modal.component';

@Component({
  selector: 'admin-dbs-orders',
  templateUrl: 'dbs-orders.component.html',
})

export class DbsOrdersComponent extends ListComponent<DbsOrder, DbsOrderService> {

  protected searchFields = ['fileName'];
  usageDataStatus = UsageDataStatus;

  constructor(
    injector: Injector,
    protected dataService: DbsOrderService,
    protected alertService: AlertService,
  ) {
    super(injector);
  }

  uploadSuccess = () => {
    this.reloadItems(this.dataTable.getTableParameters());
    this.modal.hide();
  }

  uploadFailed = () => {
    this.modal.hide();
  }

  openUploadFilesModal = () => {
    this.modal.open(DbsOrderUploadModalComponent, 'lg', {
      uploadSuccess: this.uploadSuccess,
      uploadFailed: this.uploadFailed,
    });
  }

  verifyFileUploadContent = (item: DbsOrder) => {
    this.dataService.force([ item.id ]).subscribe(() => {
      this.alertService.success(`The file name ${item.fileName} contained no errors.`);
      this.reloadItems(this.dataTable.getTableParameters());
    },  () => {
      this.alertService.error(`The file name ${item.fileName} could not be verified successfully.`);
    });
  }

}
