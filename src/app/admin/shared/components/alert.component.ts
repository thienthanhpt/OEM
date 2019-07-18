import { Component, OnInit } from '@angular/core';

import { Alert, AlertType, AlertService } from '../services/alert.service';

@Component({
  selector: 'admin-alert',
  template: `
    <alert *ngFor="let alert of alerts" [type]="getType(alert)" [dismissible]="true">
      {{ alert.message }}
    </alert>
  `
})

export class AlertComponent implements OnInit {

  alerts: Alert[] = [];

  constructor(
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.alertService.getAlert().subscribe((alert: Alert) => {
      if (!alert) {
        // clear alerts when an empty alert is received
        this.alerts = [];
        return;
      }

      // add alert to array
      this.alerts.push(alert);
    });
  }

  removeAlert(alert: Alert) {
    this.alerts = this.alerts.filter(x => x !== alert);
  }

  getType(alert: Alert) {
    // return css class based on alert type
    switch (alert.type) {
      case AlertType.Success:
        return 'success';
      case AlertType.Error:
        return 'danger';
      case AlertType.Info:
        return 'info';
      case AlertType.Warning:
        return 'warning';
      default:
        return '';
    }
  }
}
