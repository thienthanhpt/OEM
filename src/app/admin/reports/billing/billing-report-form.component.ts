import { Component, Injector } from '@angular/core';

import { BillingReport, BillingReportService, BILLING_REPORT_OPTIONS } from '@app/core';
import { FormComponent } from '../../shared';


@Component({
  selector: 'admin-billing-report-form',
  templateUrl: 'billing-report-form.component.html',
})

export class BillingReportFormComponent extends FormComponent<BillingReport, BillingReportService> {

  modelName = 'Billing Report';

  billingReportOptions = BILLING_REPORT_OPTIONS;

  constructor(
    injector: Injector,
    protected dataService: BillingReportService
  ) {
    super(injector);
    this.model = new BillingReport();
  }

  onSubmitSuccess(model: BillingReport) {
    if (model.document) {
      window.location.href = model.document.fullFilePath;
    }
    super.onSubmitSuccess(model);
  }
}
