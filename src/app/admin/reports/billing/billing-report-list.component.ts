import { Component, Injector, OnInit } from '@angular/core';

import { BillingReport, BillingReportService, Model, MODEL_OPTIONS } from '@app/core';
import { ListComponent } from '../../shared';

@Component({
  selector: 'admin-billing-report-list',
  templateUrl: 'billing-report-list.component.html',
})

export class BillingReportListComponent extends ListComponent<BillingReport, BillingReportService> implements OnInit {

  generateModal: BillingReport = null;

  constructor(
    injector: Injector,
    protected dataService: BillingReportService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.BillingReport]));
  }

  generateLinkReport = (item: BillingReport) => {
    this.generateModal = this.dataService.clone(item);
    this.dataService.create(this.generateModal)
      .subscribe(
        (model: BillingReport) => {
          if (model.document) {
            item = this.dataService.clone(model);
            window.location.href = item.document.fullFilePath;
          }
        }
      );
  }
}
