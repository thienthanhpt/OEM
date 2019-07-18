import { Component, Injector, OnInit } from '@angular/core';

import * as moment from 'moment';

import { EmaReport, EmaReportService, DateMoment } from '@app/core';
import { FormComponent } from '../../shared';


@Component({
  selector: 'admin-ema-report-form',
  templateUrl: 'ema-report-form.component.html',
})

export class EmaReportFormComponent extends FormComponent<EmaReport, EmaReportService> implements OnInit {

  modelName = 'EMA Report';

  now = new DateMoment();

  constructor(
    injector: Injector,
    protected dataService: EmaReportService
  ) {
    super(injector);
    this.model = new EmaReport();
  }

  ngOnInit() {
    super.ngOnInit();

    this.now.moment = moment();

    this.model.toDate.moment = moment();
    this.model.fromDate.moment = moment().week(moment().week() - 1);
    this.model.isForced = true;
    this.model.isStored = true;
  }

  onSubmitSuccess(model: EmaReport) {
    if (model.document) {
      window.location.href = model.document.fullFilePath;
    }
    super.onSubmitSuccess(model);
  }
}
