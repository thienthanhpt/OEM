import { Component, Injector, OnInit } from '@angular/core';

import { ListComponent } from '../../shared';
import { EmaReport, EmaReportService, Model, MODEL_OPTIONS } from '@app/core';

@Component({
  selector: 'admin-ema-report-list',
  templateUrl: 'ema-report-list.component.html',
})
export class EmaReportListComponent extends ListComponent<EmaReport, EmaReportService> implements OnInit{

  generateModal: EmaReport = null;

  constructor(
    injector: Injector,
    protected dataService: EmaReportService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.EMAReport]));
  }

  generateLinkReport = (item: EmaReport) => {
    this.generateModal = this.dataService.clone(item);
    this.generateModal.isForced = true;
    this.generateModal.isStored = true;
    this.dataService.create(this.generateModal)
      .subscribe(
        (model: EmaReport) => {
          if (model.document) {
            item = this.dataService.clone(model);
            window.location.href = item.document.fullFilePath;
          }
        }
      );
  }
}
