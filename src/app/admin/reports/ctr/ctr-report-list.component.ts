import { Component, Injector, OnInit } from '@angular/core';

import { CtrReport, CtrReportService, Model, MODEL_OPTIONS } from '@app/core';
import { ListComponent } from '../../shared';

@Component({
  selector: 'admin-ctr-report-list',
  templateUrl: 'ctr-report-list.component.html',
})
export class CtrReportListComponent extends ListComponent<CtrReport, CtrReportService> implements OnInit {

  constructor(
    injector: Injector,
    protected dataService: CtrReportService,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.CTRReport]));
  }

  generateLinkReport = (item: CtrReport) => {
    if (item.document) {
      window.location.href = item.document.fullFilePath;
    }
  }

}
