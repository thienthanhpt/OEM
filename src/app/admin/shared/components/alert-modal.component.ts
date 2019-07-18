import { Component } from '@angular/core';

import * as _ from 'lodash';

import { AlertModalContent } from '../services/alert-modal.service';
import { AlertType } from '../services/alert.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'alert-modal',
  template: `
    <div class="pt-3 pr-4 pl-4 text-right">
      <button type="button" class="close float-none" aria-label="Close" (click)="modal.hide()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body text-center pl-5 pr-5 pb-5">
      <ng-container [ngSwitch]="alertContent.type">
        <i class="fas fa-exclamation-triangle fa-4x text-warning" *ngSwitchCase="ALERT_TYPES.Warning"></i>
        <i class="fas fa-exclamation-circle fa-4x text-danger" *ngSwitchCase="ALERT_TYPES.Error"></i>
        <i class="fas fa-info-circle fa-4x text-info" *ngSwitchCase="ALERT_TYPES.Info"></i>
        <i class="fas fa-check-circle fa-4x text-success" *ngSwitchCase="ALERT_TYPES.Success"></i>
      </ng-container>
      <h5 class="mt-4 mb-3 font-weight-bold">{{ alertContent.title }}</h5>
      <p class="mb-0" [innerHTML]="convertTextToHtml(alertContent.message)" [class.text-left]="!alignCenter"></p>
    </div>
  `
})

export class AlertModalComponent {

  ALERT_TYPES = AlertType;
  alertContent: AlertModalContent = null;
  alignCenter: true;

  constructor(
    public modal: ModalService,
  ) { }

  convertTextToHtml = (str: string): string => {
    if (typeof str === 'string') {
      return _.map(str, (s) => s.replace(`\n`, `<br>`)).join('');
    } else {
      return 'An error occurred. Please try again.';
    }
  }


}
