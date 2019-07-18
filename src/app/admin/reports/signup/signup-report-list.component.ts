import { Component, Injector, OnInit } from '@angular/core';

import { SignupReport, SignupReportService, Model, MODEL_OPTIONS } from '@app/core';
import { ListComponent } from '../../shared';

@Component({
  selector: 'admin-signup-report-list',
  templateUrl: 'signup-report-list.component.html',
})

export class SignupReportListComponent extends ListComponent<SignupReport, SignupReportService> implements OnInit {

  generateModal: SignupReport = null;

  constructor(
    injector: Injector,
    protected dataService: SignupReportService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.SignUpReport]));
  }

  generateLinkReport = (item: SignupReport) => {
    this.generateModal = this.dataService.clone(item);
    this.generateModal.isForced = true;
    this.generateModal.isStored = true;
    this.dataService.create(this.generateModal)
      .subscribe(
        (model: SignupReport) => {
          if (model.document) {
            item = this.dataService.clone(model);
            window.location.href = item.document.fullFilePath;
          }
        }
      );
  }
}
