import { Component, Injector, OnInit } from '@angular/core';

import * as moment from 'moment';

import { CtrReport, CtrReportService, DateMoment } from '@app/core';
import { FormComponent } from '../../shared';

@Component({
  selector: 'admin-ctr-report-form',
  templateUrl: 'ctr-report-form.component.html',
})
export class CtrReportFormComponent extends FormComponent<CtrReport, CtrReportService> implements OnInit {

  modelName = 'CTR Report';

  now = new DateMoment();

  constructor(
    injector: Injector,
    protected dataService: CtrReportService,
  ) {
    super(injector);
    this.model = new CtrReport();
  }

  ngOnInit() {
    super.ngOnInit();

    this.now.moment = moment();

    this.model.toDate.moment = moment();
    this.model.fromDate.moment = moment().week(moment().week() - 1);
    this.model.isForced = true;
    this.model.isStored = true;
  }

  onSubmitSuccess(model: CtrReport) {
    if (model.document) {
      window.location.href = model.document.fullFilePath;
    }
    super.onSubmitSuccess(model);
  }
}
