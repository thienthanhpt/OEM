import { Component, Injector, OnInit } from '@angular/core';

import { ContractReport, ContractReportService, Model, MODEL_OPTIONS } from '@app/core';
import { ListComponent } from '../../shared';

@Component({
  selector: 'admin-contract-report-list',
  templateUrl: 'contract-report-list.component.html',
})
export class ContractReportListComponent extends ListComponent<ContractReport, ContractReportService> implements OnInit{

  generateModal: ContractReport = null;

  constructor(
    injector: Injector,
    protected dataService: ContractReportService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.EMAReport]));
  }
}
