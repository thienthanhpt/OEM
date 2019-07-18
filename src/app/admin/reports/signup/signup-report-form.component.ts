import { Component, Injector, OnInit } from '@angular/core';

import * as moment from 'moment';

import { SignupReport, SignupReportService, DateMoment } from '@app/core';
import { FormComponent } from '../../shared';


@Component({
  selector: 'admin-signup-report-form',
  templateUrl: 'signup-report-form.component.html',
})

export class SignupReportFormComponent extends FormComponent<SignupReport, SignupReportService> implements OnInit {

  modelName = 'Signup Report';

  now = new DateMoment();

  constructor(
    injector: Injector,
    protected dataService: SignupReportService
  ) {
    super(injector);
    this.model = new SignupReport();
  }

  ngOnInit() {
    super.ngOnInit();

    this.now.moment = moment();

    this.model.toDate.moment = moment();
    this.model.fromDate.moment = moment().week(moment().week() - 1);
    this.model.isForced = true;
    this.model.isStored = true;
  }

  onSubmitSuccess(model: SignupReport) {
    if (model.document) {
      window.location.href = model.document.fullFilePath;
    }
    super.onSubmitSuccess(model);
  }
}
