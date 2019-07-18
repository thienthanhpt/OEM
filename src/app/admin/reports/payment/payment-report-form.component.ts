import { Component, Injector, OnInit } from '@angular/core';

import * as moment from 'moment';

import { PaymentReport, PaymentReportService, DateMoment } from '@app/core';
import { FormComponent } from '../../shared/views/crud/form.component';

@Component({
  selector: 'admin-payment-report-form',
  templateUrl: 'payment-report-form.component.html',
})
export class PaymentReportFormComponent extends FormComponent<PaymentReport, PaymentReportService> implements OnInit {

  modelName = 'Payment Report';

  now = new DateMoment();

  paymentOriginList = [];

  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  constructor(
    injector: Injector,
    protected dataService: PaymentReportService
  ) {
    super(injector);
    this.model = new PaymentReport();
  }

  protected onFetchModelFinished = () => {
    this.dataService.fetchAllPaymentOrigin().subscribe(
      items => {
        this.paymentOriginList = items.filter(item => item);
      }
    );
  }

  ngOnInit() {
    super.ngOnInit();

    this.now.moment = moment();

    this.model.toDate.moment = moment();
    this.model.fromDate.moment = moment().week(moment().week() - 1);
    this.model.isForced = true;
    this.model.isStored = true;
    this.model.getAll = false;
  }

  onSubmitSuccess(model: PaymentReport) {
    if (model.document) {
      window.location.href = model.document.fullFilePath;
    }
    super.onSubmitSuccess(model);
  }

  onSubmit() {
    if (this.model.paymentOrigins.length <= 0) {
      this.model.paymentOrigins = null;
    }
    this.dataService.create(this.model).subscribe(
      (model: PaymentReport) => {
        this.onSubmitSuccess(model);
      },
      this.onError
    );
  }
}
