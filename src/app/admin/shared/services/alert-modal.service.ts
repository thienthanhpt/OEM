import { Injectable } from '@angular/core';

import { AlertType } from './alert.service';
import { ModalService } from './modal.service';
import { AlertModalComponent } from '../components/alert-modal.component';

export class AlertModalContent {
  title: string;
  message: string;
  type: AlertType;
}

@Injectable()
export class AlertModalService {

  constructor(public modal: ModalService) { }

  success(title: string, message: string, size: 'sm' | 'md' | 'lg' | '' = 'md', alignCenter = true) {
    this.setAlertModal(title, message, AlertType.Success, size, alignCenter);
  }

  error(title: string, message: string, size: 'sm' | 'md' | 'lg' | '' = 'md', alignCenter = true) {
    this.setAlertModal(title, message, AlertType.Error, size, alignCenter);
  }

  info(title: string, message: string, size: 'sm' | 'md' | 'lg' | '' = 'md', alignCenter = true) {
    this.setAlertModal(title, message, AlertType.Info, size, alignCenter);
  }

  warn(title: string, message: string, size: 'sm' | 'md' | 'lg' | '' = 'md', alignCenter = true) {
    this.setAlertModal(title, message, AlertType.Warning, size, alignCenter);
  }

  private setAlertModal(title: string, message: string, type: AlertType, size: 'sm' | 'md' | 'lg' | '', alignCenter: boolean) {
    const alertContent: AlertModalContent = { title, message, type };
    this.modal.open(AlertModalComponent, size, { alertContent, alignCenter });
  }
}
