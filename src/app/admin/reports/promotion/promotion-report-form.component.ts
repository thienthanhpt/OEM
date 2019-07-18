import { Component, Injector, OnInit } from '@angular/core';
import { FormComponent } from '../../shared';
import { PromotionReport, PromotionReportService } from '../../../core/data-services/promotion-report.service';
import { DateMoment } from '@app/core';
import * as moment from 'moment';

@Component({
  selector: 'admin-promotion-report-form',
  templateUrl: 'promotion-report-form.component.html'
})
export class PromotionReportFormComponent extends FormComponent<PromotionReport, PromotionReportService> implements OnInit {

  modelName = 'Promotion Report';
  now = new DateMoment();

  constructor(
    injector: Injector,
    protected dataService: PromotionReportService
  ) {
    super(injector);
    this.model = new PromotionReport();
  }

  ngOnInit() {
    super.ngOnInit();

    this.now.moment = moment();

    this.model.toDate.moment = moment();
    this.model.fromDate.moment = moment().week(moment().week() - 1);
  }

  onSubmitSuccess(model: PromotionReport) {
    if (model.document) {
      window.location.href = model.document.fullFilePath;
    }
    super.onSubmitSuccess(model);
  }

}
