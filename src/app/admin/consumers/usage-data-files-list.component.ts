import { Component, Injector } from '@angular/core';

import * as _ from 'lodash';

import { UsageData, UsageDataService, UsageDataStatus, ConsumerMeter, ConsumerMeterService, SuccessResponse } from '@app/core/index';
import { ListComponent } from '../shared';
import { UsageFileUploadModalComponent } from './components/usage-file-upload-modal.component';
import { DataTableParams } from '@app/libs/data-table/components/types';

@Component({
  selector: 'admin-usage-data-files-list',
  templateUrl: 'usage-data-files-list.component.html',
})
export class UsageDataFilesListComponent extends ListComponent<UsageData, UsageDataService> {

  usageDataToApproved = new UsageData();

  UsageDataStatus = UsageDataStatus;

  meters: ConsumerMeter[] = [];
  meterMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };
  isMetersLoading = false;

  usageDataFileToViewDetail: UsageData = null;

  isDataFound = true;

  protected searchFields = [ '~meters.meterId', ];

  constructor(
    injector: Injector,
    protected dataService: UsageDataService,
    protected consumerMeterService: ConsumerMeterService,
  ) {
    super(injector);
  }

  uploadComplete = () => {
    this.meta.page = 1;
    this.reloadItems(this.dataTable.getTableParameters());
    this.modal.hide();
  }

  openUploadFilesModal = (usageData?: UsageData) => {
    this.modal.open(UsageFileUploadModalComponent, 'lg', {
      uploadComplete: this.uploadComplete,
      datePickerConfig: this.adminConfig.bootstrap.datePicker,
      usageDataToUpload: (usageData) ? this.dataService.clone(usageData) : new UsageData()
    });
  }

  approveUsageDataFile = () => {
    this.isLoading = true;
    this.modal.hide();
    this.dataService.approveUsageDataStatus(this.usageDataToApproved.id)
      .subscribe(
        (rs: SuccessResponse) => {
          this.alertService.clear();
          if (rs.data.status === UsageDataStatus.Success) {
            this.alertService.success(`File ${this.usageDataToApproved.document.displayName} approved successfully`);
          }
          if (rs.data.status === UsageDataStatus.Invalid) {
            this.alertService.warn(`File ${this.usageDataToApproved.document.displayName} is invalid`);
          }
          this.isLoading = false;
          this.reloadItems(this.dataTable.getTableParameters());
        }, this.onError
      );
  }

  reloadMeters = (params: DataTableParams) => {
    const meterIds: number[] = [] ;

    _.forEach(this.usageDataFileToViewDetail.meters, (meter) => meterIds.push(meter.id));

    const listIdToFetch = meterIds.join(',');

    if (!_.isEmpty(listIdToFetch)) {
      this.isDataFound = true;
      this.isMetersLoading = true;
      this.consumerMeterService.fetchAll({ 'ids': listIdToFetch }, params)
        .subscribe((collection) => {
          this.meters = collection.items;
          this.meterMeta = _.cloneDeep(collection.meta);
          this.isMetersLoading = false;
        });
    } else {
      this.isDataFound = false;
    }
  }
}
