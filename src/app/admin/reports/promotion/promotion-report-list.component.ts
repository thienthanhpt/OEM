import { PromotionReport, PromotionReportService } from '../../../core/data-services/promotion-report.service';
import { ListComponent } from '../../shared/';
import { Component, Injector } from '@angular/core';

@Component({
  selector: 'admin-promotion-report-list',
  templateUrl: 'promotion-report-list.component.html'
})
export class PromotionReportListComponent extends ListComponent<PromotionReport, PromotionReportService> {
  generateModal: PromotionReport = null;

  constructor(
    injector: Injector,
    protected dataService: PromotionReportService
  ) {
    super(injector);
  }

  generateLinkReport = (item: PromotionReport) => {
    this.generateModal = this.dataService.clone(item);
    this.dataService.create(this.generateModal).subscribe(
      (model: PromotionReport) => {
        if (model.document) {
          item = this.dataService.clone(model);
          window.location.href = item.document.fullFilePath;
        }
      }
    );
  }
}
