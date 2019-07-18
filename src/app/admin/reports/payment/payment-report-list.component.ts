import { Component, Injector, OnInit } from '@angular/core';

import { PaymentReport, PaymentReportService, Model, MODEL_OPTIONS } from '@app/core';
import { ListComponent } from '../../shared';

@Component({
  selector: 'admin-payment-report-list',
  templateUrl: 'payment-report-list.component.html',
})
export class PaymentReportListComponent extends ListComponent<PaymentReport, PaymentReportService> implements OnInit {

  generateModal: PaymentReport = null;

  constructor(
    injector: Injector,
    protected dataService: PaymentReportService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.EMAReport]));
  }

  generateLinkReport = (item: PaymentReport) => {
    this.generateModal = this.dataService.clone(item);
    this.generateModal.isForced = true;
    this.generateModal.isStored = true;
    this.generateModal.getAll = false;
    this.dataService.create(this.generateModal)
      .subscribe(
        (model: PaymentReport) => {
          if (model.document) {
            item = this.dataService.clone(model);
            window.location.href = item.document.fullFilePath;
          }
        }
      );
  }
}
